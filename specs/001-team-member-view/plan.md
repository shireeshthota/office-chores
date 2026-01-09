# Implementation Plan: Team Member View

**Branch**: `001-team-member-view` | **Date**: 2026-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/Users/shireeshthota/code/choresapp/specs/001-team-member-view/spec.md`

## Summary

Build a dedicated Team Member View feature that allows users to navigate to individual team member pages to view their pending and completed chores. Users can access this via a "Team" navigation link that displays all team members, then drill down into individual views with time-range filtering (default 3 days), expandable completed chores section, and pagination for large chore lists. The UI uses a light theme with pastel colors and maintains 90%+ test coverage.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: React 19.2.0, React Router (to be added), Vite 7.2.4, Tailwind CSS 4.1.18  
**Storage**: LocalStorage via existing `utils/storage.ts` (client-side persistence)  
**Testing**: Vitest + React Testing Library (to be configured)  
**Target Platform**: Modern web browsers (ES2022+), responsive design for mobile/tablet/desktop  
**Project Type**: Single-page web application (React SPA)  
**Performance Goals**: <1s page load for 100 chores, <500ms pagination, <500ms team list render (50 members)  
**Constraints**: 90%+ test coverage, WCAG AA accessibility, 500KB bundle limit, light theme only  
**Scale/Scope**: Support 50 team members, paginated display (25-50 items/page), responsive across 320px-1920px viewports

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Clean Code Discipline
**Status**: ✅ PASS  
**Compliance**: Feature will follow TypeScript strict mode (already enabled), single-responsibility components, named constants for magic values (pagination sizes, time ranges). No violations expected.

### II. Ultra-Modern UX
**Status**: ✅ PASS  
**Compliance**: Pastel color theme, micro-interactions (hover/focus states), empty states for no chores, loading states during navigation, inline validation for time range input. Design system consistency via Tailwind CSS.

### III. Responsive & Fluid Design
**Status**: ✅ PASS  
**Compliance**: Mobile-first approach required (SC-007: 320px, 768px, 1024px+ breakpoints), fluid layouts using Tailwind Grid/Flexbox, touch targets meet 44×44px minimum.

### IV. Minimal Dependencies
**Status**: ⚠️  REVIEW  
**Justification**: Need to add React Router for navigation. This is justified because:
- Routing is core requirement (FR-006, FR-008, FR-009, FR-010)
- React Router is industry-standard, actively maintained, lightweight (~50KB gzipped)
- Alternative (implementing custom router) would increase complexity and maintenance burden
- **Decision**: Acceptable addition per constitution principles

### V. Balanced Testing
**Status**: ✅ PASS  
**Compliance**: 90%+ coverage required (FR-016). Focus on complex logic (filtering, pagination, time range validation), user workflows (navigation paths), critical components (chore lists, filters). Simple presentational components may have lighter coverage.

### VI. Accessibility Priority
**Status**: ✅ PASS  
**Compliance**: Keyboard navigation (SC-008), WCAG AA contrast (SC-010), semantic HTML (buttons, nav, sections), screen reader support (ARIA labels), focus indicators. Built-in from start.

### VII. Easy Deployment
**Status**: ✅ PASS  
**Compliance**: No deployment changes needed. Uses existing Vite build process, static asset optimization, environment variables via existing setup.

**Overall**: ✅ READY TO PROCEED (1 justified dependency addition)

## Project Structure

### Documentation (this feature)

```text
specs/001-team-member-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component interfaces)
│   └── TeamMemberView.ts
└── checklists/
    └── requirements.md  # Already exists
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── TeamMembers/              # New: Team member feature components
│   │   ├── TeamListPage.tsx      # Team list view with member cards
│   │   ├── TeamMemberPage.tsx    # Individual member view (main container)
│   │   ├── ChoreList.tsx         # Reusable chore list with pagination
│   │   ├── PaginationControls.tsx
│   │   ├── TimeRangeFilter.tsx
│   │   └── __tests__/
│   │       ├── TeamListPage.test.tsx
│   │       ├── TeamMemberPage.test.tsx
│   │       ├── ChoreList.test.tsx
│   │       ├── PaginationControls.test.tsx
│   │       └── TimeRangeFilter.test.tsx
│   ├── Layout/
│   │   ├── Header.tsx            # Modify: Add "Team" nav link
│   │   └── Sidebar.tsx           # Existing
│   └── ui/                       # Existing UI primitives
│
├── hooks/
│   ├── useChoreExpansion.ts      # Existing
│   ├── useNotifications.ts       # Existing
│   ├── useTeamMemberChores.ts    # New: Filter/paginate chores for member
│   ├── usePagination.ts          # New: Generic pagination logic
│   └── __tests__/
│       ├── useTeamMemberChores.test.ts
│       └── usePagination.test.ts
│
├── utils/
│   ├── choreFilters.ts           # New: Time range, status, deletion filters
│   ├── pagination.ts             # New: Pagination helpers
│   └── __tests__/
│       ├── choreFilters.test.ts
│       └── pagination.test.ts
│
├── types/
│   └── index.ts                  # Extend: Add deletion status to TeamMember
│
├── context/
│   └── AppContext.tsx            # Existing (handles DELETE_TEAM_MEMBER)
│
└── App.tsx                       # Modify: Add routing

vitest.config.ts                  # New: Vitest configuration
```

**Structure Decision**: Single project structure maintained (React SPA). New feature components isolated in `TeamMembers/` directory. Shared utilities (pagination, filtering) in `utils/` for reusability. Routing added to existing App.tsx.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

### Justified Complexity: React Router Addition

**Violation**: Principle IV (Minimal Dependencies) - Adding React Router  
**Justification**: 
- **Need**: Multi-page navigation is core requirement (team list → member view → calendar)
- **Alternatives Considered**:
  - Custom hash-based routing: Would require ~200-300 LOC, testing, maintenance burden
  - State-based view switching: Poor UX (no browser back/forward, no shareable URLs)
- **Decision**: React Router (react-router-dom) provides:
  - Industry-standard solution (actively maintained, last commit <1 week)
  - Small footprint (~48KB gzipped)
  - Type-safe with TypeScript
  - Better UX (browser history, deep linking)
- **Impact**: Acceptable tradeoff per constitution. Reduces custom code complexity, improves UX, standard solution.

**Approval**: Proceeding with React Router addition.


## Phase 0: Research (COMPLETE)

**Output**: [research.md](research.md)

**Key Decisions**:
1. Testing: Vitest + React Testing Library (Vite-native, 90%+ coverage capable)
2. Routing: React Router v6 with data router APIs (industry standard, 48KB)
3. Pagination: Custom `usePagination` hook (zero dependencies, ~50 LOC)
4. Time Range: Number input with validation (accessible, simple)
5. Soft Delete: Add `isDeleted: boolean` to TeamMember (preserves data integrity)
6. Pastel Colors: Developer-curated palette with WCAG AA validation
7. Calendar Navigation: React Router + FullCalendar API integration
8. Loading/Error: Suspense + ErrorBoundary per route (modern UX)

**Unknowns Resolved**: All NEEDS CLARIFICATION from Technical Context addressed

---

## Phase 1: Design & Contracts (COMPLETE)

**Outputs**:
- [data-model.md](data-model.md) - Entity definitions, filtering logic, pagination patterns
- [contracts/TeamMemberView.ts](contracts/TeamMemberView.ts) - TypeScript interfaces for components/hooks
- [quickstart.md](quickstart.md) - Step-by-step implementation guide

**Data Model Changes**:
- TeamMember: Added `isDeleted: boolean` field
- ChoreFilter: New interface for filter criteria
- PaginationState: New interface for pagination state
- Storage migration: Auto-migrate existing data to add `isDeleted: false`

**Component Contracts**:
- 2 page components (TeamListPage, TeamMemberPage)
- 4 feature components (ChoreList, PaginationControls, TimeRangeFilter, TeamMemberCard)
- 2 custom hooks (usePagination, useTeamMemberChores)
- 5 utility functions (filterActiveChores, filterByTimeRange, etc.)

**Route Structure**:
- `/` - Calendar view (existing)
- `/team` - Team list page
- `/team/:memberId` - Individual member view

---

## Phase 2: Implementation Planning

### File Structure (New/Modified)

**New Files** (16 total):
```
src/
├── components/TeamMembers/
│   ├── TeamListPage.tsx
│   ├── TeamMemberPage.tsx
│   ├── ChoreList.tsx
│   ├── PaginationControls.tsx
│   ├── TimeRangeFilter.tsx
│   ├── TeamMemberCard.tsx
│   └── __tests__/
│       ├── TeamListPage.test.tsx
│       ├── TeamMemberPage.test.tsx
│       ├── ChoreList.test.tsx
│       ├── PaginationControls.test.tsx
│       ├── TimeRangeFilter.test.tsx
│       └── TeamMemberCard.test.tsx
├── hooks/
│   ├── usePagination.ts
│   ├── useTeamMemberChores.ts
│   └── __tests__/
│       ├── usePagination.test.ts
│       └── useTeamMemberChores.test.ts
├── utils/
│   ├── choreFilters.ts
│   ├── pagination.ts
│   └── __tests__/
│       ├── choreFilters.test.ts
│       └── pagination.test.ts
├── test/
│   └── setup.ts
vitest.config.ts
```

**Modified Files** (4 total):
```
src/
├── types/index.ts              # Add isDeleted to TeamMember
├── context/AppContext.tsx      # Change DELETE_TEAM_MEMBER to soft delete
├── utils/storage.ts            # Add migration for isDeleted field
├── components/Layout/Header.tsx # Add "Team" nav link
└── App.tsx                     # Add routing with React Router
package.json                    # Add test scripts, new dependencies
```

**Total**: 20 files (16 new, 4 modified)

---

### Implementation Order

**Sequential Dependencies** (must follow order):

1. **Environment Setup** (15 min)
   - Install dependencies (vitest, react-router-dom, testing libraries)
   - Create vitest.config.ts
   - Create test setup file
   - Update package.json scripts

2. **Data Model Extensions** (30 min)
   - Update TeamMember type with `isDeleted`
   - Modify DELETE_TEAM_MEMBER reducer
   - Add storage migration
   - **Test**: storage migration unit tests

3. **Utility Layer** (1 hour)
   - Create `choreFilters.ts` (filterActiveChores, filterByTimeRange, filterByCompletionStatus)
   - Create `pagination.ts` (paginate, calculateTotalPages)
   - **Test**: 100% coverage on utils (pure functions, easy to test)

4. **Custom Hooks** (1.5 hours)
   - Create `usePagination` hook
   - Create `useTeamMemberChores` hook
   - **Test**: Hook behavior with @testing-library/react-hooks

5. **UI Components** (3-4 hours)
   - TimeRangeFilter (input validation)
   - PaginationControls (prev/next buttons)
   - TeamMemberCard (pastel colors, badge)
   - ChoreList (reusable, pagination)
   - **Test**: Component rendering, user interactions, accessibility

6. **Page Components** (2 hours)
   - TeamListPage (member grid)
   - TeamMemberPage (orchestrates filters, pagination, chore lists)
   - **Test**: Full user workflows, navigation, error states

7. **Routing Integration** (30 min)
   - Update App.tsx with React Router
   - Add "Team" link to Header
   - **Test**: Route navigation, 404 handling

8. **Final Validation** (2-3 hours)
   - Run full test suite (aim for 90%+ coverage)
   - Accessibility audit (axe DevTools, Lighthouse)
   - Manual testing across breakpoints (320px, 768px, 1024px+)
   - Constitution compliance check

---

### Testing Strategy

**Coverage Targets**:
- Utility functions: 100% (pure functions, straightforward)
- Custom hooks: 95%+ (focus on state transitions, edge cases)
- UI components: 90%+ (rendering, user interactions, a11y)
- Page components: 85%+ (integration tests, workflows)

**Overall Target**: 90%+ (constitution requirement)

**Test Pyramid**:
- **Unit tests** (60%): Utils, hooks, isolated component logic
- **Integration tests** (30%): Page components, hook + component combos
- **E2E** (10%): Manual testing (not automated in this phase)

**Critical Test Cases**:
1. Soft delete: Deleted members hidden from all views
2. Time range: Chores filtered correctly (boundary: today, today+N)
3. Pagination: Page transitions, size changes, boundary (page 1, last page)
4. Accessibility: Keyboard navigation, ARIA labels, contrast ratios
5. Responsive: Mobile (320px), tablet (768px), desktop (1024px+)

---

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Coverage < 90% | Medium | Focus on utils/hooks first (high leverage), allocate 2-3 hours for test writing |
| Accessibility failures | High | Use axe DevTools early, test with keyboard-only navigation before submitting |
| Router integration breaks existing calendar | Medium | Keep router minimal, wrap calendar view without changes, test navigation paths |
| Soft delete migration fails on existing data | Low | Test migration with mock localStorage data, add error handling |
| Pastel colors fail WCAG AA | Medium | Validate contrast before implementation, use WebAIM Contrast Checker |

---

### Dependencies Installation

**New Dependencies**:
```json
{
  "dependencies": {
    "react-router-dom": "^6.29.0"  // Routing (justified in Constitution Check)
  },
  "devDependencies": {
    "vitest": "^3.1.7",                           // Test runner
    "@vitest/ui": "^3.1.7",                       // Test UI
    "@testing-library/react": "^16.1.0",          // Component testing
    "@testing-library/jest-dom": "^6.7.0",        // DOM matchers
    "@testing-library/user-event": "^14.5.2",     // User interactions
    "jsdom": "^25.0.3"                            // DOM environment
  }
}
```

**Bundle Impact**: ~100KB gzipped (React Router 48KB, testing libs dev-only)  
**Within Budget**: Yes (500KB limit, currently ~200KB)

---

## Post-Phase 1 Constitution Re-Check

*Re-evaluate after design artifacts complete*

### I. Clean Code Discipline
**Status**: ✅ PASS  
**Evidence**: TypeScript interfaces in contracts/, named constants in quickstart (DEFAULT_TIME_RANGE = 3), pure utility functions (choreFilters.ts, pagination.ts)

### II. Ultra-Modern UX
**Status**: ✅ PASS  
**Evidence**: Pastel color palette defined, loading states in hook design (isLoading), empty states in ChoreList, micro-interactions (hover states on cards)

### III. Responsive & Fluid Design
**Status**: ✅ PASS  
**Evidence**: Grid layouts in TeamListPage (md:grid-cols-2 lg:grid-cols-3), mobile-first Tailwind classes, 320px breakpoint in testing plan

### IV. Minimal Dependencies
**Status**: ✅ PASS  
**Evidence**: React Router justified (48KB, standard solution), custom pagination hook (zero deps), no UI library (uses Tailwind)

### V. Balanced Testing
**Status**: ✅ PASS  
**Evidence**: 90%+ coverage thresholds in vitest.config.ts, test files for all components, focused testing strategy (utils 100%, components 90%)

### VI. Accessibility Priority
**Status**: ✅ PASS  
**Evidence**: Keyboard nav in testing checklist, ARIA labels in contracts comments, WCAG AA contrast validation for pastels, semantic HTML (nav, sections)

### VII. Easy Deployment
**Status**: ✅ PASS  
**Evidence**: No build process changes, Vite config unchanged, React Router works with static hosting, localStorage (no backend needed)

**Overall**: ✅ ALL PRINCIPLES COMPLIANT - Ready for implementation

---

## Summary

**Planning Phase Complete**: ✅

**Artifacts Generated**:
- ✅ plan.md (this file)
- ✅ research.md (8 decisions documented)
- ✅ data-model.md (4 entities, filtering logic, storage schema)
- ✅ contracts/TeamMemberView.ts (TypeScript interfaces)
- ✅ quickstart.md (10-step implementation guide)

**Next Steps**:
1. Update agent context with new technologies (React Router, Vitest)
2. Begin implementation following quickstart.md
3. Track progress via feature checklist

**Branch**: `001-team-member-view`  
**Spec Path**: `/Users/shireeshthota/code/choresapp/specs/001-team-member-view/spec.md`  
**Plan Path**: `/Users/shireeshthota/code/choresapp/specs/001-team-member-view/plan.md`

**Estimated Implementation Time**: 12-14 hours (8-10 coding, 2-3 testing, 1 validation)

---

**END OF PLANNING PHASE** - Ready to code! 🚀
