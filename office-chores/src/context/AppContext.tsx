import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, Chore, TeamMember } from '../types';
import { loadState, saveState } from '../utils/storage';

const initialState: AppState = {
  chores: [],
  teamMembers: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CHORE':
      return { ...state, chores: [...state.chores, action.payload] };

    case 'UPDATE_CHORE':
      return {
        ...state,
        chores: state.chores.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CHORE':
      return {
        ...state,
        chores: state.chores.filter((c) => c.id !== action.payload),
      };

    case 'TOGGLE_CHORE_COMPLETION':
      return {
        ...state,
        chores: state.chores.map((c) =>
          c.id === action.payload
            ? {
                ...c,
                isCompleted: !c.isCompleted,
                completedAt: !c.isCompleted ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'ADD_TEAM_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };

    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map((m) =>
          m.id === action.payload ? { ...m, isDeleted: true } : m
        ),
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addChore: (chore: Omit<Chore, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChore: (chore: Chore) => void;
  deleteChore: (id: string) => void;
  toggleChoreCompletion: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  getTeamMember: (id: string | null) => TeamMember | undefined;
}

export const AppContext = createContext<AppContextValue | null>(null);

function generateId(): string {
  return crypto.randomUUID();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loaded = loadState();
    dispatch({ type: 'LOAD_STATE', payload: loaded });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addChore = (chore: Omit<Chore, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_CHORE',
      payload: {
        ...chore,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      },
    });
  };

  const updateChore = (chore: Chore) => {
    dispatch({
      type: 'UPDATE_CHORE',
      payload: { ...chore, updatedAt: new Date().toISOString() },
    });
  };

  const deleteChore = (id: string) => {
    dispatch({ type: 'DELETE_CHORE', payload: id });
  };

  const toggleChoreCompletion = (id: string) => {
    dispatch({ type: 'TOGGLE_CHORE_COMPLETION', payload: id });
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    dispatch({
      type: 'ADD_TEAM_MEMBER',
      payload: { ...member, id: generateId(), isDeleted: false },
    });
  };

  const updateTeamMember = (member: TeamMember) => {
    dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: member });
  };

  const deleteTeamMember = (id: string) => {
    dispatch({ type: 'DELETE_TEAM_MEMBER', payload: id });
  };

  const getTeamMember = (id: string | null) => {
    if (!id) return undefined;
    return state.teamMembers.find((m) => m.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addChore,
        updateChore,
        deleteChore,
        toggleChoreCompletion,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        getTeamMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
