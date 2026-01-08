import { useState, useEffect } from 'react';
import type { TeamMember } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TeamMemberFormProps {
  member?: TeamMember;
  onSave: (member: Omit<TeamMember, 'id'> | TeamMember) => void;
  onCancel: () => void;
}

const COLORS = [
  { value: '#6366f1', name: 'Indigo' },
  { value: '#8b5cf6', name: 'Violet' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#ef4444', name: 'Red' },
  { value: '#f97316', name: 'Orange' },
  { value: '#eab308', name: 'Yellow' },
  { value: '#22c55e', name: 'Green' },
  { value: '#06b6d4', name: 'Cyan' },
];

export function TeamMemberForm({ member, onSave, onCancel }: TeamMemberFormProps) {
  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [color, setColor] = useState(member?.color ?? COLORS[0].value);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email ?? '');
      setColor(member.color);
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    const data = {
      name: name.trim(),
      email: email.trim() || undefined,
      color,
    };

    if (member) {
      onSave({ ...data, id: member.id });
    } else {
      onSave(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="John Doe"
        autoFocus
      />

      <Input
        label="Email (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Color
        </label>
        <div className="flex gap-3 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 ${
                color === c.value
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              style={{
                backgroundColor: c.value,
                boxShadow: color === c.value ? `0 4px 14px ${c.value}50` : undefined
              }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {member ? 'Update' : 'Add'} Member
        </Button>
      </div>
    </form>
  );
}
