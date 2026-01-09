# Data Model: Team Member View

**Feature**: Team Member View  
**Date**: 2026-01-08  
**Phase**: 1 (Design & Contracts)

## Entity Definitions

### TeamMember (Extended)

**Purpose**: Represents an office team member who can be assigned chores

**Fields**:
```typescript
interface TeamMember {
  id: string;                 // UUID v4, unique identifier
  name: string;              // Display name (1-100 chars, required)
  email?: string;            // Optional contact email (valid email format)
  color: string;             // Hex color code for visual distinction (#RRGGBB)
  isDeleted: boolean;        // NEW: Soft delete flag (default: false)
}
```

**Changes from Existing**:
- **Added**: `isDeleted: boolean` field for soft delete support (FR-022/FR-023)
- **Reason**: Preserve chore history while hiding deleted members from UI

**Validation Rules**:
- `name`: Non-empty, trimmed, 1-100 characters
- `email`: Optional, must match email regex if provided
- `color`: Must be valid hex color (#RRGGBB format)
- `isDeleted`: Boolean, defaults to false on creation

**State Transitions**:
- **Created**: `isDeleted = false` by default
- **Deleted**: `isDeleted` set to `true` (soft delete)
- **Restored**: `isDeleted` set back to `false` (future feature, not in current spec)

**Relationships**:
- One-to-many with Chore (via `assigneeId`)
- Deleted members' chores hidden via filtering logic (not database cascade)

---

### Chore (No Changes)

**Purpose**: Represents a scheduled chore task

**Fields**: (Existing, unchanged)
```typescript
interface Chore {
  id: string;
  title: string;
  description?: string;
  assigneeId: string | null;
  startDate: Date;
  endDate?: Date;
  isRecurring: boolean;
  rrule?: string;
  reminderMinutesBefore?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Note**: No schema changes needed. Filtering logic in UI layer handles deleted member chores.

---

### ChoreFilter (New)

**Purpose**: Filter criteria for chore lists in Team Member View

**Fields**:
```typescript
interface ChoreFilter {
  memberId: string;           // Team member to filter by
  timeRangeDays: number;      // Number of days from today (1-30)
  showCompleted: boolean;     // Include completed chores
  includeRecurring: boolean;  // Expand recurring chores within range
}
```

**Validation Rules**:
- `memberId`: Must reference existing, non-deleted TeamMember
- `timeRangeDays`: Integer between 1 and 30 (inclusive)
- `showCompleted`: Boolean
- `includeRecurring`: Boolean, default true

**Usage**: Passed to `useTeamMemberChores` hook to filter and paginate chores

---

### PaginationState (New)

**Purpose**: Pagination configuration and state

**Fields**:
```typescript
interface PaginationState {
  currentPage: number;        // 1-indexed page number
  pageSize: number;          // Items per page (25-50)
  totalItems: number;        // Total items in unfiltered set
  totalPages: number;        // Calculated: Math.ceil(totalItems / pageSize)
}
```

**Validation Rules**:
- `currentPage`: >= 1, <= totalPages
- `pageSize`: Integer between 25 and 50 (inclusive)
- `totalItems`: >= 0
- `totalPages`: Auto-calculated, read-only

**State Transitions**:
- **Next Page**: `currentPage++` if `currentPage < totalPages`
- **Previous Page**: `currentPage--` if `currentPage > 1`
- **Go to Page**: Set `currentPage` to specific value (1 to totalPages)
- **Change Page Size**: Reset `currentPage = 1`, recalculate `totalPages`

---

## Data Flow

### Team List Page (`/team`)

```
AppContext.teamMembers 
  → Filter: isDeleted === false
  → Sort: By name (alphabetical)
  → Map: TeamMemberCard components
```

**Data Source**: `AppContext.state.teamMembers`  
**Filtering**: Exclude deleted members  
**Pagination**: Not required (max 50 members, fits on one page)

---

### Team Member Page (`/team/:memberId`)

```
1. Load TeamMember by memberId (validate not deleted)
2. Load all Chores from AppContext
3. Filter chores:
   - assigneeId === memberId
   - Member not deleted (isDeleted === false)
   - Within time range (startDate <= today + timeRangeDays)
   - Match showCompleted preference
4. Expand recurring chores (if applicable)
5. Paginate results (25-50 per page)
6. Render ChoreList + PaginationControls
```

**Data Sources**:
- `AppContext.state.teamMembers` (for member details)
- `AppContext.state.chores` (for chore list)

**Computed Data**:
- Pending chores count (for header badge)
- Completed chores count (for expandable section)
- Filtered + paginated chore subset

---

## Filtering Logic

### Active Chores Filter

**Function**: `filterActiveChores(chores, members)`

```typescript
export function filterActiveChores(
  chores: Chore[],
  members: TeamMember[]
): Chore[] {
  const activeMemberIds = new Set(
    members.filter(m => !m.isDeleted).map(m => m.id)
  );
  
  return chores.filter(chore => 
    chore.assigneeId && activeMemberIds.has(chore.assigneeId)
  );
}
```

**Purpose**: Hide chores assigned to deleted members (FR-022)

---

### Time Range Filter

**Function**: `filterByTimeRange(chores, daysFromToday)`

```typescript
export function filterByTimeRange(
  chores: Chore[],
  daysFromToday: number
): Chore[] {
  const endDate = addDays(new Date(), daysFromToday);
  const today = startOfDay(new Date());
  
  return chores.filter(chore => {
    const choreStart = new Date(chore.startDate);
    return choreStart >= today && choreStart <= endDate;
  });
}
```

**Purpose**: Show only chores within next N days (FR-004)

---

### Completed Chores Filter

**Function**: `filterByCompletionStatus(chores, showCompleted)`

```typescript
export function filterByCompletionStatus(
  chores: Chore[],
  showCompleted: boolean
): Chore[] {
  if (showCompleted) return chores;
  
  // Assuming completion tracked via endDate in past
  // (Spec doesn't define completion model - needs clarification or assumption)
  const now = new Date();
  return chores.filter(chore => {
    if (!chore.endDate) return true; // No end date = not completed
    return new Date(chore.endDate) >= now;
  });
}
```

**Note**: Completion tracking not defined in existing Chore type. Assuming `endDate < now` = completed. May need refinement in implementation.

---

## Pagination Logic

### usePagination Hook

**Signature**:
```typescript
function usePagination<T>(
  items: T[],
  options: {
    defaultPageSize?: number;
    minPageSize?: number;
    maxPageSize?: number;
  }
): {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
}
```

**Internal State**:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(options.defaultPageSize ?? 25);
```

**Computed Values**:
```typescript
const totalPages = Math.ceil(items.length / pageSize);
const startIndex = (currentPage - 1) * pageSize;
const paginatedItems = items.slice(startIndex, startIndex + pageSize);
```

**Validation**:
- Page size clamped to [minPageSize, maxPageSize] (25-50 default)
- Current page clamped to [1, totalPages]
- Reset to page 1 when items array changes (via useEffect)

---

## Storage Schema (LocalStorage)

**Key**: `office-chores-app-state`

**Schema**:
```typescript
{
  teamMembers: TeamMember[];  // Now includes isDeleted field
  chores: Chore[];           // Unchanged
  version: number;           // Schema version (for migrations)
}
```

**Migration Plan** (Existing → New):
1. Load existing state from localStorage
2. Check if TeamMember has `isDeleted` field
3. If missing, add `isDeleted: false` to all members
4. Increment schema version
5. Save back to localStorage

**Migration Code**:
```typescript
function migrateTeamMembers(members: any[]): TeamMember[] {
  return members.map(m => ({
    ...m,
    isDeleted: m.isDeleted ?? false, // Add field if missing
  }));
}
```

---

## Relationships Diagram

```
TeamMember (1) ──< (many) Chore
   │                       │
   │ isDeleted: boolean    │ assigneeId: string | null
   │                       │
   └─── Filtered Out ──────┘
        if isDeleted=true
```

**Key Constraints**:
- Chores reference TeamMembers via `assigneeId`
- Deleted members (isDeleted=true) filtered from all UI views
- Chores with deleted assignees hidden via `filterActiveChores`
- No database cascades (client-side filtering only)

---

## Summary

**Entities**:
- TeamMember: +1 field (`isDeleted`)
- Chore: No changes
- ChoreFilter: New (filter criteria)
- PaginationState: New (pagination state)

**Key Patterns**:
- Soft delete via `isDeleted` flag
- Client-side filtering (no backend)
- Pagination via custom hook
- Time range filtering via date-fns

**Data Integrity**:
- Deleted members preserved in storage (soft delete)
- Chore history maintained (assigneeId not nullified)
- Filtering logic centralized in `utils/choreFilters.ts`

**Phase 1 Data Model Complete**: Ready for contract generation.
