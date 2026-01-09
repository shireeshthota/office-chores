import type { AppState, TeamMember } from '../types';

const STORAGE_KEY = 'office-chores-data';
const STORAGE_VERSION_KEY = 'office-chores-version';
const CURRENT_VERSION = 1;

const defaultState: AppState = {
  chores: [],
  teamMembers: [],
};

/**
 * Migrate team members to add isDeleted field
 */
function migrateTeamMembers(members: any[]): TeamMember[] {
  return members.map((m) => ({
    ...m,
    isDeleted: m.isDeleted ?? false,
  }));
}

/**
 * Migrate old data format to current version
 */
function migrateState(state: any): AppState {
  const version = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10);
  
  let migratedState = { ...state };
  
  // Version 0 -> 1: Add isDeleted field to TeamMember
  if (version < 1) {
    migratedState = {
      ...migratedState,
      teamMembers: migrateTeamMembers(migratedState.teamMembers || []),
    };
  }
  
  return migratedState as AppState;
}

export function loadState(): AppState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return defaultState;
    }
    
    const parsed = JSON.parse(serialized);
    const migrated = migrateState(parsed);
    
    // Update version after successful migration
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
    
    return migrated;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

