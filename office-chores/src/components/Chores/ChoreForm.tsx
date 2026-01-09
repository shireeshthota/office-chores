import { useState } from 'react';
import type { Chore } from '../../types';
import { useApp } from '../../context/AppContext';
import { buildRRule, parseRRule, describeRRule, type RecurrenceConfig } from '../../utils/rruleHelpers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RecurrenceBuilder } from './RecurrenceBuilder';

interface ChoreFormProps {
  chore?: Chore;
  initialDate?: Date;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const defaultRecurrence: RecurrenceConfig = {
  frequency: 'weekly',
  interval: 1,
  weekdays: [1],
  endType: 'never',
};

export function ChoreForm({
  chore,
  initialDate,
  onSave,
  onCancel,
  onDelete,
}: ChoreFormProps) {
  const { state, addChore, updateChore } = useApp();
  const [title, setTitle] = useState(chore?.title ?? '');
  const [description, setDescription] = useState(chore?.description ?? '');
  const [assigneeId, setAssigneeId] = useState(chore?.assigneeId ?? '');
  
  // Extract date and time from existing chore or use defaults
  const getLocalDateString = (isoString?: string, fallback?: Date) => {
    if (isoString) {
      const d = new Date(isoString);
      return d.getFullYear() + '-' + 
             String(d.getMonth() + 1).padStart(2, '0') + '-' + 
             String(d.getDate()).padStart(2, '0');
    }
    if (fallback) {
      return fallback.getFullYear() + '-' + 
             String(fallback.getMonth() + 1).padStart(2, '0') + '-' + 
             String(fallback.getDate()).padStart(2, '0');
    }
    const now = new Date();
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0');
  };
  
  const getLocalTimeString = (isoString?: string) => {
    if (isoString) {
      const d = new Date(isoString);
      return String(d.getHours()).padStart(2, '0') + ':' + 
             String(d.getMinutes()).padStart(2, '0');
    }
    return '09:00'; // Default to 9 AM
  };
  
  const [startDate, setStartDate] = useState(
    getLocalDateString(chore?.startDate, initialDate)
  );
  const [startTime, setStartTime] = useState(
    getLocalTimeString(chore?.startDate)
  );
  const [isRecurring, setIsRecurring] = useState(chore?.isRecurring ?? false);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>(
    chore?.rrule ? parseRRule(chore.rrule) : defaultRecurrence
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    chore?.reminderMinutesBefore?.toString() ?? ''
  );
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    // Combine date and time into a local datetime
    const [year, month, day] = startDate.split('-').map(Number);
    const [hours, minutes] = startTime.split(':').map(Number);
    const localDateTime = new Date(year, month - 1, day, hours, minutes);

    const choreData = {
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId: assigneeId || null,
      startDate: localDateTime.toISOString(),
      isRecurring,
      rrule: isRecurring ? buildRRule(recurrence, localDateTime) : undefined,
      reminderMinutesBefore: reminderMinutes ? parseInt(reminderMinutes) : undefined,
    };

    if (chore) {
      updateChore({
        ...chore,
        ...choreData,
      });
    } else {
      addChore(choreData);
    }

    onSave();
  };

  const teamMemberOptions = state.teamMembers.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Clean the kitchen"
        autoFocus
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          rows={3}
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-0 focus:border-indigo-400 focus:bg-white focus:shadow-md hover:border-gray-300 resize-none"
        />
      </div>

      <Select
        label="Assign to"
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        options={[{ value: '', label: 'Unassigned' }, ...teamMemberOptions]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100/50">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${isRecurring ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">
              Repeat this chore
            </span>
            <p className="text-xs text-gray-500">Set up a recurring schedule</p>
          </div>
        </label>
      </div>

      {isRecurring && (
        <div className="animate-slide-up">
          <RecurrenceBuilder config={recurrence} onChange={setRecurrence} />
          {chore?.rrule && (
            <p className="mt-3 text-sm text-indigo-600 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {describeRRule(chore.rrule)}
            </p>
          )}
        </div>
      )}

      <Select
        label="Reminder"
        value={reminderMinutes}
        onChange={(e) => setReminderMinutes(e.target.value)}
        options={[
          { value: '', label: 'No reminder' },
          { value: '0', label: 'At time of chore' },
          { value: '15', label: '15 minutes before' },
          { value: '30', label: '30 minutes before' },
          { value: '60', label: '1 hour before' },
          { value: '1440', label: '1 day before' },
        ]}
      />

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <div>
          {onDelete && (
            <Button type="button" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{chore ? 'Update' : 'Add'} Chore</Button>
        </div>
      </div>
    </form>
  );
}
