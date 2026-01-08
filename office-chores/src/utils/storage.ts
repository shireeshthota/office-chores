import type { AppState } from '../types';

const STORAGE_KEY = 'office-chores-data';

const defaultState: AppState = {
  chores: [],
  teamMembers: [],
};

export function loadState(): AppState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return defaultState;
    }
    return JSON.parse(serialized) as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    console.error('Failed to save state to localStorage');
  }
}
