import { RRule, Weekday } from 'rrule';

export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  weekdays?: number[];
  monthDay?: number;
  monthWeek?: number;
  monthWeekday?: number;
  endType: 'never' | 'count' | 'until';
  count?: number;
  until?: Date;
}

const WEEKDAY_MAP: Record<number, Weekday> = {
  0: RRule.SU,
  1: RRule.MO,
  2: RRule.TU,
  3: RRule.WE,
  4: RRule.TH,
  5: RRule.FR,
  6: RRule.SA,
};

const FREQ_MAP: Record<string, number> = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
};

export function buildRRule(config: RecurrenceConfig, startDate: Date): string {
  const options: Partial<ConstructorParameters<typeof RRule>[0]> = {
    freq: FREQ_MAP[config.frequency],
    interval: config.interval,
    dtstart: startDate,
  };

  if (config.frequency === 'weekly' && config.weekdays?.length) {
    options.byweekday = config.weekdays.map((d) => WEEKDAY_MAP[d]);
  }

  if (config.frequency === 'monthly') {
    if (config.monthWeek !== undefined && config.monthWeekday !== undefined) {
      options.byweekday = [WEEKDAY_MAP[config.monthWeekday].nth(config.monthWeek)];
    } else if (config.monthDay !== undefined) {
      options.bymonthday = [config.monthDay];
    }
  }

  if (config.endType === 'count' && config.count) {
    options.count = config.count;
  } else if (config.endType === 'until' && config.until) {
    options.until = config.until;
  }

  const rule = new RRule(options as ConstructorParameters<typeof RRule>[0]);
  return rule.toString();
}

export function parseRRule(rruleString: string): RecurrenceConfig {
  const rule = RRule.fromString(rruleString);
  const options = rule.origOptions;

  let frequency: RecurrenceConfig['frequency'] = 'daily';
  if (options.freq === RRule.WEEKLY) frequency = 'weekly';
  else if (options.freq === RRule.MONTHLY) frequency = 'monthly';
  else if (options.freq === RRule.YEARLY) frequency = 'yearly';

  const config: RecurrenceConfig = {
    frequency,
    interval: options.interval ?? 1,
    endType: 'never',
  };

  if (options.byweekday && frequency === 'weekly') {
    config.weekdays = (options.byweekday as Weekday[]).map((wd) => wd.weekday);
  }

  if (options.byweekday && frequency === 'monthly') {
    const wd = (options.byweekday as Weekday[])[0];
    if (wd.n) {
      config.monthWeek = wd.n;
      config.monthWeekday = wd.weekday;
    }
  }

  if (options.bymonthday) {
    config.monthDay = Array.isArray(options.bymonthday)
      ? options.bymonthday[0]
      : options.bymonthday;
  }

  if (options.count) {
    config.endType = 'count';
    config.count = options.count;
  } else if (options.until) {
    config.endType = 'until';
    config.until = options.until;
  }

  return config;
}

export function getOccurrences(
  rruleString: string,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const rule = RRule.fromString(rruleString);
  return rule.between(rangeStart, rangeEnd, true);
}

export function describeRRule(rruleString: string): string {
  const rule = RRule.fromString(rruleString);
  return rule.toText();
}
