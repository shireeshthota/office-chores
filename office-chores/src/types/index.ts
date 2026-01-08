export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  color: string;
}

export interface Chore {
  id: string;
  title: string;
  description?: string;
  assigneeId: string | null;
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  rrule?: string;
  reminderMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  chores: Chore[];
  teamMembers: TeamMember[];
}

export type AppAction =
  | { type: 'ADD_CHORE'; payload: Chore }
  | { type: 'UPDATE_CHORE'; payload: Chore }
  | { type: 'DELETE_CHORE'; payload: string }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

export interface DateRange {
  start: Date;
  end: Date;
}
