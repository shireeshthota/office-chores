import type { RecurrenceConfig } from '../../utils/rruleHelpers';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface RecurrenceBuilderProps {
  config: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
}

const WEEKDAYS = [
  { value: '0', label: 'S' },
  { value: '1', label: 'M' },
  { value: '2', label: 'T' },
  { value: '3', label: 'W' },
  { value: '4', label: 'T' },
  { value: '5', label: 'F' },
  { value: '6', label: 'S' },
];

const WEEK_ORDINALS = [
  { value: '1', label: 'First' },
  { value: '2', label: 'Second' },
  { value: '3', label: 'Third' },
  { value: '4', label: 'Fourth' },
  { value: '-1', label: 'Last' },
];

const WEEKDAY_NAMES = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export function RecurrenceBuilder({ config, onChange }: RecurrenceBuilderProps) {
  const updateConfig = (updates: Partial<RecurrenceConfig>) => {
    onChange({ ...config, ...updates });
  };

  const toggleWeekday = (day: number) => {
    const current = config.weekdays ?? [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    updateConfig({ weekdays: updated });
  };

  return (
    <div className="space-y-5 p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100/50">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Select
            label="Repeat"
            value={config.frequency}
            onChange={(e) =>
              updateConfig({
                frequency: e.target.value as RecurrenceConfig['frequency'],
              })
            }
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>
        <div className="w-24">
          <Input
            label="Every"
            type="number"
            min={1}
            value={config.interval}
            onChange={(e) => updateConfig({ interval: parseInt(e.target.value) || 1 })}
          />
        </div>
        <span className="pb-3 text-sm font-medium text-gray-500">
          {config.frequency === 'daily' && 'day(s)'}
          {config.frequency === 'weekly' && 'week(s)'}
          {config.frequency === 'monthly' && 'month(s)'}
          {config.frequency === 'yearly' && 'year(s)'}
        </span>
      </div>

      {config.frequency === 'weekly' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            On days
          </label>
          <div className="flex gap-2">
            {WEEKDAYS.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleWeekday(parseInt(day.value))}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  config.weekdays?.includes(parseInt(day.value))
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {config.frequency === 'monthly' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
            <input
              type="radio"
              id="monthDay"
              name="monthType"
              checked={config.monthDay !== undefined}
              onChange={() =>
                updateConfig({
                  monthDay: new Date().getDate(),
                  monthWeek: undefined,
                  monthWeekday: undefined,
                })
              }
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="monthDay" className="text-sm font-medium text-gray-700">
              On day
            </label>
            <Input
              type="number"
              min={1}
              max={31}
              value={config.monthDay ?? ''}
              onChange={(e) =>
                updateConfig({ monthDay: parseInt(e.target.value) || 1 })
              }
              disabled={config.monthDay === undefined}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
            <input
              type="radio"
              id="monthWeek"
              name="monthType"
              checked={config.monthWeek !== undefined}
              onChange={() =>
                updateConfig({
                  monthWeek: 1,
                  monthWeekday: 1,
                  monthDay: undefined,
                })
              }
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="monthWeek" className="text-sm font-medium text-gray-700">
              On the
            </label>
            <Select
              value={config.monthWeek?.toString() ?? '1'}
              onChange={(e) =>
                updateConfig({ monthWeek: parseInt(e.target.value) })
              }
              disabled={config.monthWeek === undefined}
              options={WEEK_ORDINALS}
              className="w-28"
            />
            <Select
              value={config.monthWeekday?.toString() ?? '1'}
              onChange={(e) =>
                updateConfig({ monthWeekday: parseInt(e.target.value) })
              }
              disabled={config.monthWeek === undefined}
              options={WEEKDAY_NAMES}
              className="w-32"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Ends
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
            <input
              type="radio"
              id="endNever"
              name="endType"
              checked={config.endType === 'never'}
              onChange={() => updateConfig({ endType: 'never' })}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="endNever" className="text-sm font-medium text-gray-700">
              Never
            </label>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
            <input
              type="radio"
              id="endCount"
              name="endType"
              checked={config.endType === 'count'}
              onChange={() => updateConfig({ endType: 'count', count: 10 })}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="endCount" className="text-sm font-medium text-gray-700">
              After
            </label>
            <Input
              type="number"
              min={1}
              value={config.count ?? 10}
              onChange={(e) =>
                updateConfig({ count: parseInt(e.target.value) || 1 })
              }
              disabled={config.endType !== 'count'}
              className="w-20"
            />
            <span className="text-sm text-gray-500">occurrences</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-gray-100">
            <input
              type="radio"
              id="endUntil"
              name="endType"
              checked={config.endType === 'until'}
              onChange={() =>
                updateConfig({
                  endType: 'until',
                  until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                })
              }
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="endUntil" className="text-sm font-medium text-gray-700">
              On date
            </label>
            <Input
              type="date"
              value={
                config.until ? config.until.toISOString().split('T')[0] : ''
              }
              onChange={(e) =>
                updateConfig({ until: new Date(e.target.value) })
              }
              disabled={config.endType !== 'until'}
              className="w-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
