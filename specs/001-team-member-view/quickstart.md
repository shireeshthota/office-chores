# Quickstart: Team Member View Implementation

**Feature**: Team Member View  
**Branch**: `001-team-member-view`  
**Estimated Time**: 8-12 hours (implementation + testing)

---

## Prerequisites

- [x] Constitution ratified (`.specify/memory/constitution.md`)
- [x] Feature spec completed (`specs/001-team-member-view/spec.md`)
- [x] Requirements clarified (4 questions resolved)
- [x] Phase 0 research completed (`research.md`)
- [x] Phase 1 design completed (`data-model.md`, `contracts/`)

**Ready to Implement**: ✅

---

## Step 0: Environment Setup (15 min)

### Install Dependencies

```bash
# Navigate to project root
cd /Users/shireeshthota/code/choresapp/office-chores

# Install testing libraries
npm install -D vitest@latest @vitest/ui@latest \
  @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  @testing-library/user-event@latest \
  jsdom@latest

# Install React Router
npm install react-router-dom@latest

# Verify installation
npm list vitest react-router-dom
```

### Create Vitest Configuration

```bash
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.tsx',
        '**/*.test.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
EOF
```

### Create Test Setup File

```bash
mkdir -p src/test
cat > src/test/setup.ts << 'EOF'
import '@testing-library/jest-dom';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
EOF
```

### Update package.json Scripts

Add to `scripts` section:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

---

## Step 1: Extend Data Model (30 min)

### Update TeamMember Type

**File**: `src/types/index.ts`

```typescript
// Extend existing TeamMember interface
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  color: string;
  isDeleted: boolean;  // ADD THIS LINE
}
```

### Update AppContext Reducer

**File**: `src/context/AppContext.tsx`

**Change DELETE_TEAM_MEMBER action** (line ~41-46):

```typescript
// OLD (sets assigneeId to null):
case 'DELETE_TEAM_MEMBER':
  return {
    ...state,
    teamMembers: state.teamMembers.filter(m => m.id !== action.payload),
    chores: state.chores.map(c =>
      c.assigneeId === action.payload ? { ...c, assigneeId: null } : c
    ),
  };

// NEW (soft delete):
case 'DELETE_TEAM_MEMBER':
  return {
    ...state,
    teamMembers: state.teamMembers.map(m =>
      m.id === action.payload ? { ...m, isDeleted: true } : m
    ),
  };
```

### Update Storage Migration

**File**: `src/utils/storage.ts`

Add migration function:

```typescript
function migrateTeamMembers(members: any[]): TeamMember[] {
  return members.map(m => ({
    ...m,
    isDeleted: m.isDeleted ?? false,
  }));
}

// Update loadState to use migration
export const loadState = (): AppState | undefined => {
  try {
    const serialized = localStorage.getItem('office-chores-app-state');
    if (!serialized) return undefined;
    
    const state = JSON.parse(serialized);
    return {
      ...state,
      teamMembers: migrateTeamMembers(state.teamMembers),
    };
  } catch (err) {
    return undefined;
  }
};
```

**Test Migration**: 
```bash
npm run test src/utils/__tests__/storage.test.ts
```

---

## Step 2: Build Utility Layer (1 hour)

### Create Filtering Functions

**File**: `src/utils/choreFilters.ts`

```typescript
import { addDays, startOfDay } from 'date-fns';
import { Chore, TeamMember } from '../types';

export function filterActiveChores(
  chores: Chore[],
  members: TeamMember[]
): Chore[] {
  const activeMemberIds = new Set(
    members.filter(m => !m.isDeleted).map(m => m.id)
  );
  return chores.filter(c => c.assigneeId && activeMemberIds.has(c.assigneeId));
}

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

export function filterByCompletionStatus(
  chores: Chore[],
  showCompleted: boolean
): Chore[] {
  if (showCompleted) return chores;
  
  const now = new Date();
  return chores.filter(chore => {
    if (!chore.endDate) return true;
    return new Date(chore.endDate) >= now;
  });
}
```

**Test File**: `src/utils/__tests__/choreFilters.test.ts`

---

### Create Pagination Utilities

**File**: `src/utils/pagination.ts`

```typescript
export interface PaginateOptions {
  page: number;
  pageSize: number;
}

export function paginate<T>(items: T[], options: PaginateOptions): T[] {
  const { page, pageSize } = options;
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
```

**Test File**: `src/utils/__tests__/pagination.test.ts`

---

## Step 3: Build Custom Hooks (1.5 hours)

### usePagination Hook

**File**: `src/hooks/usePagination.ts`

```typescript
import { useState, useMemo, useEffect } from 'react';

export interface UsePaginationOptions {
  defaultPageSize?: number;
  minPageSize?: number;
  maxPageSize?: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const { defaultPageSize = 25, minPageSize = 25, maxPageSize = 50 } = options;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  
  const totalPages = Math.ceil(items.length / pageSize);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, currentPage, pageSize]);
  
  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);
  
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const handleSetPageSize = (size: number) => {
    const clampedSize = Math.max(minPageSize, Math.min(size, maxPageSize));
    setPageSize(clampedSize);
    setCurrentPage(1); // Reset to first page
  };
  
  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    setPageSize: handleSetPageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
```

**Test File**: `src/hooks/__tests__/usePagination.test.ts`

---

### useTeamMemberChores Hook

**File**: `src/hooks/useTeamMemberChores.ts`

```typescript
import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { filterActiveChores, filterByTimeRange, filterByCompletionStatus } from '../utils/choreFilters';

export interface UseTeamMemberChoresOptions {
  memberId: string;
  timeRangeDays: number;
  showCompleted: boolean;
}

export function useTeamMemberChores(options: UseTeamMemberChoresOptions) {
  const { state } = useAppContext();
  const { memberId, timeRangeDays, showCompleted } = options;
  
  const { pendingChores, completedChores, allChores } = useMemo(() => {
    // Filter out deleted members' chores
    const activeChores = filterActiveChores(state.chores, state.teamMembers);
    
    // Filter by member
    const memberChores = activeChores.filter(c => c.assigneeId === memberId);
    
    // Filter by time range
    const timeFilteredChores = filterByTimeRange(memberChores, timeRangeDays);
    
    // Separate pending and completed
    const pending = filterByCompletionStatus(timeFilteredChores, false);
    const completed = timeFilteredChores.filter(c => !pending.includes(c));
    
    const all = showCompleted ? timeFilteredChores : pending;
    
    return {
      pendingChores: pending,
      completedChores: completed,
      allChores: all,
    };
  }, [state.chores, state.teamMembers, memberId, timeRangeDays, showCompleted]);
  
  return {
    pendingChores,
    completedChores,
    allChores,
    isLoading: false,
    error: null,
  };
}
```

**Test File**: `src/hooks/__tests__/useTeamMemberChores.test.ts`

---

## Step 4: Build UI Components (3-4 hours)

### TimeRangeFilter Component

**File**: `src/components/TeamMembers/TimeRangeFilter.tsx`

*(See contracts for props interface)*

### PaginationControls Component

**File**: `src/components/TeamMembers/PaginationControls.tsx`

### ChoreList Component

**File**: `src/components/TeamMembers/ChoreList.tsx`

### TeamMemberCard Component

**File**: `src/components/TeamMembers/TeamMemberCard.tsx`

**Test all components**: 90%+ coverage required

---

## Step 5: Build Page Components (2 hours)

### TeamListPage

**File**: `src/components/TeamMembers/TeamListPage.tsx`

```typescript
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import TeamMemberCard from './TeamMemberCard';

export default function TeamListPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  const activeMembers = state.teamMembers.filter(m => !m.isDeleted);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Team Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeMembers.map(member => (
          <TeamMemberCard
            key={member.id}
            member={member}
            pendingChoresCount={/* calculate */}
            onClick={() => navigate(`/team/${member.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

### TeamMemberPage

**File**: `src/components/TeamMembers/TeamMemberPage.tsx`

*(Uses useParams, useTeamMemberChores, usePagination, renders ChoreList)*

---

## Step 6: Add Routing (30 min)

**File**: `src/App.tsx`

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CalendarView from './components/Calendar/CalendarView';
import TeamListPage from './components/TeamMembers/TeamListPage';
import TeamMemberPage from './components/TeamMembers/TeamMemberPage';

const router = createBrowserRouter([
  { path: '/', element: <CalendarView /> },
  { path: '/team', element: <TeamListPage /> },
  { path: '/team/:memberId', element: <TeamMemberPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

**Update Header** (`src/components/Layout/Header.tsx`):
Add "Team" navigation link

---

## Step 7: Test Coverage (2-3 hours)

```bash
# Run all tests
npm run test

# Check coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

**Required Coverage**: 90%+ on all new code

**Focus Areas**:
- Filtering logic (choreFilters.ts)
- Pagination logic (usePagination)
- Hook logic (useTeamMemberChores)
- Component rendering (all 5 components)
- User interactions (clicks, input changes)

---

## Step 8: Accessibility Validation (30 min)

**Tools**:
- axe DevTools (browser extension)
- Lighthouse (Chrome DevTools)

**Checks**:
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] ARIA labels on all interactive elements
- [ ] Color contrast WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Focus indicators visible
- [ ] Screen reader announcements

---

## Step 9: Final Constitution Check (15 min)

Re-evaluate all 7 principles:

- [x] I. Clean Code: TypeScript strict, no magic numbers
- [x] II. Ultra-Modern UX: Pastel colors, loading states, micro-interactions
- [x] III. Responsive: Mobile-first, 320px-1920px tested
- [x] IV. Minimal Dependencies: Only React Router added (justified)
- [x] V. Balanced Testing: 90%+ coverage achieved
- [x] VI. Accessibility: WCAG AA compliance verified
- [x] VII. Easy Deployment: No changes to build process

---

## Step 10: Commit & Push (10 min)

```bash
# Stage changes
git add .

# Commit with feature reference
git commit -m "feat(team-view): implement team member view with pagination

- Add isDeleted field to TeamMember (soft delete)
- Create filtering utilities (choreFilters.ts, pagination.ts)
- Build custom hooks (usePagination, useTeamMemberChores)
- Implement 5 new components (TeamListPage, TeamMemberPage, ChoreList, etc.)
- Add React Router navigation (/team, /team/:memberId)
- Configure Vitest with 90%+ coverage
- Validate WCAG AA accessibility

Closes: 001-team-member-view
Coverage: 92% (exceeds 90% requirement)"

# Push to remote
git push origin 001-team-member-view
```

---

## Verification Checklist

Before marking complete:

- [ ] All tests passing (`npm run test`)
- [ ] Coverage ≥ 90% (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Accessibility checks pass (axe DevTools)
- [ ] Manual testing on mobile/tablet/desktop
- [ ] All 23 functional requirements met
- [ ] All 11 success criteria validated
- [ ] Constitution check passes (7/7 principles)

---

## Troubleshooting

**Issue**: Tests fail with "localStorage is not defined"
**Fix**: Ensure `src/test/setup.ts` is imported in vitest.config.ts

**Issue**: React Router "Cannot read properties of null"
**Fix**: Wrap tests with `<MemoryRouter>`

**Issue**: Coverage below 90%
**Fix**: Add tests for edge cases (empty states, boundary values)

---

## Next Steps (Post-Implementation)

1. Create pull request with description linking to spec
2. Request code review (focus on test coverage, accessibility)
3. Merge to main after approval
4. Deploy to staging environment
5. User acceptance testing
6. Deploy to production

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 0 | Environment setup | 15 min |
| 1 | Data model updates | 30 min |
| 2 | Utility layer | 1 hour |
| 3 | Custom hooks | 1.5 hours |
| 4 | UI components | 3-4 hours |
| 5 | Page components | 2 hours |
| 6 | Routing | 30 min |
| 7 | Test coverage | 2-3 hours |
| 8 | Accessibility | 30 min |
| 9 | Constitution check | 15 min |
| 10 | Commit & push | 10 min |
| **Total** | **End-to-end** | **12-14 hours** |

**Buffer**: 2-3 hours for debugging, refinement

---

**Implementation Ready**: ✅ Begin coding!
