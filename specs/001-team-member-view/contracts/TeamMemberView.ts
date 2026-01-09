/**
 * Component Contracts: Team Member View Feature
 * 
 * TypeScript interfaces defining component props, hooks, and utility functions.
 * These contracts serve as the "API" between components and guide implementation.
 */

import { Chore, TeamMember } from '../../../../src/types';

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

/**
 * TeamListPage: Displays all active team members as clickable cards
 * Route: /team
 */
export interface TeamListPageProps {
  // No props - reads from AppContext
}

/**
 * TeamMemberPage: Individual member view with filtered chores
 * Route: /team/:memberId
 */
export interface TeamMemberPageProps {
  // No props - uses useParams() for memberId
}

// ============================================================================
// FEATURE COMPONENTS
// ============================================================================

/**
 * ChoreList: Reusable chore list with pagination
 * Used in TeamMemberPage for both pending and completed sections
 */
export interface ChoreListProps {
  chores: Chore[];
  member: TeamMember;
  pageSize?: number;           // Default: 25, range: 25-50
  emptyMessage?: string;       // Custom message when no chores
  onChoreClick?: (chore: Chore) => void;  // Navigate to calendar view
}

/**
 * PaginationControls: Previous/Next navigation for paginated lists
 */
export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageSizeChange?: (size: number) => void;  // Optional: allow user to change size
}

/**
 * TimeRangeFilter: Adjustable time range input (1-30 days)
 */
export interface TimeRangeFilterProps {
  value: number;               // Current days value (default: 3)
  onChange: (days: number) => void;
  min?: number;                // Default: 1
  max?: number;                // Default: 30
  label?: string;              // Default: "Show chores for next"
}

/**
 * TeamMemberCard: Clickable card displaying member info
 * Used in TeamListPage
 */
export interface TeamMemberCardProps {
  member: TeamMember;
  pendingChoresCount: number;  // Badge count
  onClick: (memberId: string) => void;
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * useTeamMemberChores: Filter and compute chores for a specific member
 */
export interface UseTeamMemberChoresOptions {
  memberId: string;
  timeRangeDays: number;       // Filter: next N days from today
  showCompleted: boolean;      // Include completed chores
}

export interface UseTeamMemberChoresResult {
  pendingChores: Chore[];      // Filtered pending chores
  completedChores: Chore[];    // Filtered completed chores
  allChores: Chore[];          // All filtered chores (pending + completed)
  isLoading: boolean;          // Future: async loading state
  error: Error | null;         // Future: error handling
}

export type UseTeamMemberChores = (
  options: UseTeamMemberChoresOptions
) => UseTeamMemberChoresResult;

/**
 * usePagination: Generic pagination hook
 */
export interface UsePaginationOptions {
  defaultPageSize?: number;    // Default: 25
  minPageSize?: number;        // Default: 25
  maxPageSize?: number;        // Default: 50
}

export interface UsePaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type UsePagination = <T>(
  items: T[],
  options?: UsePaginationOptions
) => UsePaginationResult<T>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Filter chores to exclude those assigned to deleted members
 */
export type FilterActiveChores = (
  chores: Chore[],
  members: TeamMember[]
) => Chore[];

/**
 * Filter chores by time range (next N days from today)
 */
export type FilterByTimeRange = (
  chores: Chore[],
  daysFromToday: number
) => Chore[];

/**
 * Filter chores by completion status
 */
export type FilterByCompletionStatus = (
  chores: Chore[],
  showCompleted: boolean
) => Chore[];

/**
 * Get pending chores count for a specific member
 */
export type GetPendingChoresCount = (
  memberId: string,
  chores: Chore[],
  members: TeamMember[],
  timeRangeDays: number
) => number;

/**
 * Paginate an array of items
 */
export interface PaginateOptions {
  page: number;                // 1-indexed
  pageSize: number;
}

export type Paginate = <T>(
  items: T[],
  options: PaginateOptions
) => T[];

/**
 * Calculate total pages for pagination
 */
export type CalculateTotalPages = (
  totalItems: number,
  pageSize: number
) => number;

// ============================================================================
// ROUTE PARAMETERS
// ============================================================================

/**
 * URL params for TeamMemberPage route
 */
export interface TeamMemberRouteParams {
  memberId: string;            // Team member UUID from URL
}

/**
 * Navigation state for passing data between routes
 */
export interface CalendarNavigationState {
  highlightChore?: string;     // Chore ID to highlight/scroll to
}

// ============================================================================
// COMPONENT TESTING CONTRACTS
// ============================================================================

/**
 * Mock factories for testing
 */
export interface TestFactories {
  createMockTeamMember: (overrides?: Partial<TeamMember>) => TeamMember;
  createMockChore: (overrides?: Partial<Chore>) => Chore;
  createMockChores: (count: number) => Chore[];
}

/**
 * Test utilities for assertions
 */
export interface TestUtilities {
  isChoreInTimeRange: (chore: Chore, daysFromToday: number) => boolean;
  isChoreCompleted: (chore: Chore) => boolean;
  getActiveMembers: (members: TeamMember[]) => TeamMember[];
}
