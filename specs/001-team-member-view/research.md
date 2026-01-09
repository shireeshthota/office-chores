# Research: Team Member View Implementation

**Feature**: Team Member View  
**Date**: 2026-01-08  
**Phase**: 0 (Research & Discovery)

## Research Topics

### 1. Testing Infrastructure for Vite + React

**Decision**: Vitest + React Testing Library + @testing-library/user-event  

**Rationale**:
- Vitest is designed for Vite projects (same config, faster than Jest)
- Native ESM support, instant HMR, TypeScript out-of-box
- React Testing Library follows accessibility-first testing (aligns with Principle VI)
- user-event provides realistic user interaction simulation for keyboard nav testing
- Combined coverage: ~94% typical for well-tested React apps (meets 90% requirement)

**Alternatives Considered**:
- Jest: Requires additional configuration (babel, ESM transforms), slower in Vite ecosystem
- Cypress Component Testing: Heavier, overkill for unit testing, better suited for E2E
- Testing Library alone: Needs test runner (would still need Vitest/Jest)

**Implementation**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration**: vitest.config.ts with jsdom environment, coverage via c8/istanbul

---

### 2. React Router Integration Strategy

**Decision**: React Router v6 (latest) with data router APIs (createBrowserRouter)

**Rationale**:
- v6 uses modern hooks-based API (useParams, useNavigate) - cleaner than v5 
- Data router APIs enable better loading states, error boundaries per route
- Type-safe route params with TypeScript
- Supports nested routes (Team List → Member View structure)
- ~48KB gzipped, actively maintained

**Alternatives Considered**:
- TanStack Router: More modern but adds complexity, overkill for simple navigation needs
- Wouter: Minimal (1.6KB) but lacks features like programmatic navigation, nested routes
- Custom routing: 200-300 LOC, maintenance burden, missing browser history integration

**Implementation Pattern**:
```tsx
// App.tsx
const router = createBrowserRouter([
  { path: '/', element: <CalendarView /> },
  { path: '/team', element: <TeamListPage /> },
  { path: '/team/:memberId', element: <TeamMemberPage /> },
]);
```

**Route Structure**:
- `/` - Calendar view (existing)
- `/team` - Team list page (all members)
- `/team/:memberId` - Individual member view

---

### 3. Pagination Patterns for React

**Decision**: Custom pagination hook (`usePagination`) with controlled state

**Rationale**:
- Small dataset (max 50 members, ~100-200 chores per member) doesn't require library
- Custom hook provides full control over page size (25-50 adjustable requirement)
- Zero dependencies, ~50 LOC, reusable across chore/member lists
- Server pagination not needed (client-side data via localStorage)

**Alternatives Considered**:
- react-paginate: 18KB for simple pagination UI, unnecessary for this scale
- TanStack Table: Overkill (100KB+), provides sorting/filtering we don't need
- Material-UI Pagination: Requires @mui/material (300KB+), conflicts with Tailwind

**Hook API**:
```typescript
const { page, pageSize, totalPages, nextPage, prevPage, goToPage, paginatedItems } = 
  usePagination(items, { defaultPageSize: 25, minPageSize: 25, maxPageSize: 50 });
```

---

### 4. Time Range Filter UX Patterns

**Decision**: Number input + unit selector (days) with inline validation

**Rationale**:
- Requirement: "adjustable time range, default 3 days"
- Number input with step=1, min=1, max=30 provides clear constraints
- Real-time validation prevents invalid states (0 days, negative, >30)
- Accessible: native HTML5 controls, keyboard-friendly
- Consistent with existing app patterns (no date pickers to maintain)

**Alternatives Considered**:
- Date range picker (start/end): More complex, spec only mentions "next X days"
- Preset buttons (3/7/14/30 days): Less flexible, doesn't meet "adjustable" requirement
- Slider input: Less precise, harder to hit exact values

**Component Structure**:
```tsx
<TimeRangeFilter 
  value={3} 
  onChange={(days) => setTimeRange(days)}
  min={1}
  max={30}
  label="Show chores for next"
  unit="days"
/>
```

---

### 5. Soft Delete Strategy for Team Members

**Decision**: Add `isDeleted: boolean` field to TeamMember, filter in UI components

**Rationale**:
- Requirement FR-022/FR-023: Hide deleted members and their chores completely
- Soft delete preserves data integrity (chore history, audit trail)
- Allows future "restore member" feature without data loss
- Filtering layer in `choreFilters.ts` keeps logic centralized

**Alternatives Considered**:
- Hard delete: Loses chore history, breaks existing chore references, violates data integrity
- Separate "deleted members" collection: Duplicates data, sync issues
- Set assigneeId to null: Current implementation, but doesn't hide chores (spec violation)

**Implementation Changes**:
```typescript
// types/index.ts
interface TeamMember {
  id: string;
  name: string;
  email?: string;
  color: string;
  isDeleted: boolean; // NEW
}

// utils/choreFilters.ts
export const filterActiveChores = (chores: Chore[], members: TeamMember[]) => {
  const activeMembers = members.filter(m => !m.isDeleted);
  const activeMemberIds = new Set(activeMembers.map(m => m.id));
  return chores.filter(c => c.assigneeId && activeMemberIds.has(c.assigneeId));
};
```

**AppContext Change**: DELETE_TEAM_MEMBER sets `isDeleted: true` instead of nullifying assigneeId

---

### 6. Pastel Color Palette for Light Theme

**Decision**: Developer-selected palette with WCAG AA contrast validation

**Rationale**:
- Clarification: "Developer choice" for pastel colors
- Must meet WCAG AA contrast (4.5:1 text, 3:1 UI components)
- Tailwind CSS provides pastel variants (50-300 shades)
- Contrast checker: WebAIM or built into design tools

**Alternatives Considered**:
- Auto-generated from name hash: Risk of poor contrast, inconsistent feel
- User-customizable: Out of scope for MVP, adds complexity

**Proposed Palette**:
```typescript
// Tailwind classes with AA-compliant contrasts
const pastelColors = [
  'bg-blue-100 text-blue-900',     // Light blue bg, dark blue text
  'bg-purple-100 text-purple-900',
  'bg-pink-100 text-pink-900',
  'bg-green-100 text-green-900',
  'bg-yellow-100 text-yellow-900',
  'bg-orange-100 text-orange-900',
];
```

**Validation**: Test with contrast checker before finalizing

---

### 7. FullCalendar Integration (Navigation from Member View)

**Decision**: Programmatic navigation using React Router + FullCalendar scrollToTime

**Rationale**:
- Requirement FR-010: "Navigate to overall calendar from member view"
- React Router handles `/team/:id` → `/` navigation
- FullCalendar API: `calendarRef.current.getApi().scrollToTime(startDate)` focuses chore
- Pass chore ID via URL param or state for highlighting

**Alternatives Considered**:
- Open modal: Breaks requirement for "overall calendar" (wants full calendar view)
- Inline calendar: Duplicate component, violates DRY

**Implementation**:
```tsx
// TeamMemberPage.tsx
const navigate = useNavigate();
const handleViewInCalendar = (choreId: string) => {
  navigate('/', { state: { highlightChore: choreId } });
};

// CalendarView.tsx (existing, modify)
const location = useLocation();
useEffect(() => {
  if (location.state?.highlightChore) {
    // Scroll to and highlight chore
  }
}, [location.state]);
```

---

### 8. Loading States & Error Boundaries

**Decision**: Suspense boundaries for async routes + error boundaries per route

**Rationale**:
- React Router v6 data APIs support ErrorBoundary and Suspense per route
- Loading states required by Principle II (Ultra-Modern UX)
- Prevents blank screens during navigation
- Error boundaries catch route-level errors (404, data fetch failures)

**Implementation**:
```tsx
const router = createBrowserRouter([
  {
    path: '/team/:memberId',
    element: <TeamMemberPage />,
    errorElement: <ErrorBoundary />,
    // Suspense fallback handled by router
  }
]);
```

---

## Summary

**Technologies Selected**:
- Vitest + React Testing Library (testing)
- React Router v6 (navigation)
- Custom pagination hook (no library)
- Soft delete pattern (isDeleted field)
- Developer-curated pastel palette (WCAG AA validated)

**Key Decisions**:
1. Soft delete > hard delete (preserves data, meets spec)
2. Custom pagination > library (simple use case, zero deps)
3. Vitest > Jest (Vite-native, faster)
4. React Router v6 > alternatives (standard, type-safe, feature-rich)

**Risks Identified**:
- None critical. Testing infrastructure is new but well-documented.
- Color contrast validation must be done manually before ship.

**Phase 0 Complete**: All NEEDS CLARIFICATION resolved. Ready for Phase 1 (Data Model).
