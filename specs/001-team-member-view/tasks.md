# Tasks: Team Member View

**Input**: Design documents from `/Users/shireeshthota/code/choresapp/specs/001-team-member-view/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests ARE required - spec.md explicitly requests "90% or above unit test coverage" (FR-016)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single project structure - all paths relative to repository root: `/Users/shireeshthota/code/choresapp/office-chores/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and testing infrastructure

- [ ] T001 Install Vitest testing framework: `npm install -D vitest@latest @vitest/ui@latest jsdom@latest`
- [ ] T002 [P] Install React testing libraries: `npm install -D @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest`
- [ ] T003 [P] Install React Router: `npm install react-router-dom@latest`
- [ ] T004 Create Vitest configuration in vitest.config.ts
- [ ] T005 [P] Create test setup file in src/test/setup.ts
- [ ] T006 [P] Add test scripts to package.json ("test", "test:ui", "coverage")

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Add isDeleted field to TeamMember interface in src/types/index.ts
- [ ] T008 Update DELETE_TEAM_MEMBER reducer to soft delete in src/context/AppContext.tsx
- [ ] T009 Add storage migration function for isDeleted field in src/utils/storage.ts
- [ ] T010 [P] Create choreFilters utility module in src/utils/choreFilters.ts
- [ ] T011 [P] Create pagination utility module in src/utils/pagination.ts
- [ ] T012 [P] Write unit tests for choreFilters in src/utils/__tests__/choreFilters.test.ts
- [ ] T013 [P] Write unit tests for pagination in src/utils/__tests__/pagination.test.ts
- [ ] T014 Create usePagination custom hook in src/hooks/usePagination.ts
- [ ] T015 [P] Create useTeamMemberChores custom hook in src/hooks/useTeamMemberChores.ts
- [ ] T016 [P] Write tests for usePagination in src/hooks/__tests__/usePagination.test.ts
- [ ] T017 [P] Write tests for useTeamMemberChores in src/hooks/__tests__/useTeamMemberChores.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Team Member Pending Chores (Priority: P1) 🎯 MVP

**Goal**: Users can navigate to a team member's view and see all their pending chores in a paginated list

**Independent Test**: Navigate from main app → Team link → select member → verify pending chores displayed with pagination

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US1] Write PaginationControls component test in src/components/TeamMembers/__tests__/PaginationControls.test.tsx
- [ ] T019 [P] [US1] Write ChoreList component test in src/components/TeamMembers/__tests__/ChoreList.test.tsx
- [ ] T020 [P] [US1] Write TeamMemberCard component test in src/components/TeamMembers/__tests__/TeamMemberCard.test.tsx
- [ ] T021 [P] [US1] Write TeamListPage component test in src/components/TeamMembers/__tests__/TeamListPage.test.tsx
- [ ] T022 [P] [US1] Write TeamMemberPage component test in src/components/TeamMembers/__tests__/TeamMemberPage.test.tsx

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create PaginationControls component in src/components/TeamMembers/PaginationControls.tsx
- [ ] T024 [P] [US1] Create TeamMemberCard component in src/components/TeamMembers/TeamMemberCard.tsx
- [ ] T025 [US1] Create ChoreList component in src/components/TeamMembers/ChoreList.tsx (depends on T023)
- [ ] T026 [US1] Create TeamListPage component in src/components/TeamMembers/TeamListPage.tsx (depends on T024)
- [ ] T027 [US1] Create TeamMemberPage component in src/components/TeamMembers/TeamMemberPage.tsx (depends on T025)
- [ ] T028 [US1] Update App.tsx to add React Router with routes for /team and /team/:memberId
- [ ] T029 [US1] Add "Team" navigation link to Header component in src/components/Layout/Header.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can navigate to team list, select a member, and view their pending chores with pagination

---

## Phase 4: User Story 2 - View Upcoming Chores with Adjustable Time Range (Priority: P2)

**Goal**: Users can filter chores to see only those coming up in the next N days (default 3 days) with adjustable time range

**Independent Test**: Navigate to team member view → verify default 3-day filter → adjust time range → verify chores update correctly

### Tests for User Story 2

- [ ] T030 [P] [US2] Write TimeRangeFilter component test in src/components/TeamMembers/__tests__/TimeRangeFilter.test.tsx

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create TimeRangeFilter component in src/components/TeamMembers/TimeRangeFilter.tsx
- [ ] T032 [US2] Integrate TimeRangeFilter into TeamMemberPage component in src/components/TeamMembers/TeamMemberPage.tsx
- [ ] T033 [US2] Add time range state management to useTeamMemberChores hook in src/hooks/useTeamMemberChores.ts
- [ ] T034 [US2] Implement filterByTimeRange logic in choreFilters utility in src/utils/choreFilters.ts
- [ ] T035 [US2] Add validation for time range input (reject ≤ 0 days) in TimeRangeFilter component

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can filter chores by time range while maintaining all pending chores functionality

---

## Phase 5: User Story 3 - Expand to View Completed Chores (Priority: P3)

**Goal**: Users can expand a section to view completed chores for the team member with pagination

**Independent Test**: Navigate to team member view → expand "Show Completed" section → verify completed chores appear with pagination → collapse section

### Implementation for User Story 3

- [ ] T036 [P] [US3] Add completed chores section state to TeamMemberPage in src/components/TeamMembers/TeamMemberPage.tsx
- [ ] T037 [US3] Implement expand/collapse UI in TeamMemberPage for completed chores section
- [ ] T038 [US3] Add filterByCompletionStatus logic to choreFilters utility in src/utils/choreFilters.ts
- [ ] T039 [US3] Integrate completed chores filtering into useTeamMemberChores hook in src/hooks/useTeamMemberChores.ts
- [ ] T040 [US3] Add empty state handling for zero completed chores in ChoreList component
- [ ] T041 [US3] Display completion date in ChoreList for completed chores

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional - users can view pending chores, filter by time range, and expand to see completed chores

---

## Phase 6: User Story 4 - Navigate Between Team Members and Calendar (Priority: P3)

**Goal**: Users can easily switch between team members and navigate back to calendar view with smooth transitions

**Independent Test**: Navigate team member → switch to different member → verify no page reload → navigate to calendar → verify context preserved

### Implementation for User Story 4

- [ ] T042 [P] [US4] Add team member dropdown selector to TeamMemberPage in src/components/TeamMembers/TeamMemberPage.tsx
- [ ] T043 [US4] Implement team member switching logic with React Router navigate in TeamMemberPage
- [ ] T044 [US4] Add "Back to Calendar" navigation button in TeamMemberPage component
- [ ] T045 [US4] Implement calendar navigation state preservation in App.tsx routing
- [ ] T046 [US4] Add smooth transition animations between team member views using CSS transitions
- [ ] T047 [US4] Update Header component to preserve current route state when navigating

**Checkpoint**: All 4 user stories should now work seamlessly together with fluid navigation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T048 [P] Implement pastel color theme with WCAG AA contrast validation in Tailwind config
- [ ] T049 [P] Add visual distinction for overdue chores (red highlight) in ChoreList component
- [ ] T050 [P] Add loading states to TeamListPage and TeamMemberPage components
- [ ] T051 [P] Add error boundary handling for invalid member IDs in TeamMemberPage
- [ ] T052 Add keyboard navigation support (Tab, Enter, Escape) to all interactive components
- [ ] T053 [P] Add ARIA labels and semantic HTML throughout team member components
- [ ] T054 [P] Test responsive layouts at 320px, 768px, 1024px+ breakpoints
- [ ] T055 Run full test suite and verify 90%+ coverage: `npm run coverage`
- [ ] T056 Perform accessibility audit using axe DevTools and fix any WCAG AA violations
- [ ] T057 Manual testing of all user stories following quickstart.md validation steps
- [ ] T058 [P] Update documentation with team member view usage instructions
- [ ] T059 Final constitution compliance check against all 7 principles
- [ ] T060 Code cleanup and refactoring for readability and maintainability

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed)
  - OR sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 components but independently testable ✅ Independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 components but independently testable ✅ Independent
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Enhances navigation but independently testable ✅ Independent

### Within Each User Story

1. Write tests FIRST (all [P] tests can run in parallel)
2. Verify tests FAIL before implementation
3. Create components marked [P] in parallel
4. Sequential components build on parallel components
5. Integration tasks complete the story
6. Test story independently before moving to next

### Parallel Opportunities

**Phase 1: Setup**
- T002, T003, T005, T006 can all run in parallel

**Phase 2: Foundational**
- T010, T011 (utilities) can run in parallel
- T012, T013 (utility tests) can run in parallel
- T015, T016, T017 (hooks and tests) can run in parallel after T014

**Phase 3: User Story 1**
- T018, T019, T020, T021, T022 (all tests) can run in parallel
- T023, T024 (PaginationControls, TeamMemberCard) can run in parallel
- After foundation: T026 and T027 use different files, can potentially overlap

**Phase 4-6: User Stories**
- If team has capacity, US2, US3, US4 can all start in parallel after Phase 2 completes

**Phase 7: Polish**
- T048, T049, T050, T051, T053, T054, T058 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (T018-T022):
Task T018: "Write PaginationControls component test in src/components/TeamMembers/__tests__/PaginationControls.test.tsx"
Task T019: "Write ChoreList component test in src/components/TeamMembers/__tests__/ChoreList.test.tsx"
Task T020: "Write TeamMemberCard component test in src/components/TeamMembers/__tests__/TeamMemberCard.test.tsx"
Task T021: "Write TeamListPage component test in src/components/TeamMembers/__tests__/TeamListPage.test.tsx"
Task T022: "Write TeamMemberPage component test in src/components/TeamMembers/__tests__/TeamMemberPage.test.tsx"

# After tests fail, launch base components in parallel (T023-T024):
Task T023: "Create PaginationControls component in src/components/TeamMembers/PaginationControls.tsx"
Task T024: "Create TeamMemberCard component in src/components/TeamMembers/TeamMemberCard.tsx"
```

---

## Parallel Example: Multiple User Stories

```bash
# After Phase 2 completes, if you have 3 developers:
Developer A: Work on User Story 1 (Phase 3: T018-T029)
Developer B: Work on User Story 2 (Phase 4: T030-T035)
Developer C: Work on User Story 3 (Phase 5: T036-T041)

# Each developer can complete their story independently and test it
# Stories integrate seamlessly because they all extend the same base components
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Timeline**: ~6-8 hours

1. Complete Phase 1: Setup (30 min)
2. Complete Phase 2: Foundational (2-3 hours)
3. Complete Phase 3: User Story 1 (3-4 hours)
4. **STOP and VALIDATE**: 
   - Run tests: `npm run test`
   - Manual testing: Navigate team → select member → verify pending chores
   - Accessibility check
5. Deploy/demo MVP

**Deliverable**: Core team member view with pending chores - provides immediate value

### Incremental Delivery

**Total Timeline**: 12-14 hours

1. **Foundation** (Phase 1-2): ~3 hours → Testing infrastructure + utilities ready
2. **MVP** (Phase 3): ~4 hours → User Story 1 → Test → Deploy/Demo (Core value! ✅)
3. **Enhancement 1** (Phase 4): ~1.5 hours → User Story 2 → Test → Deploy/Demo (Time filtering ✅)
4. **Enhancement 2** (Phase 5): ~1.5 hours → User Story 3 → Test → Deploy/Demo (Completed chores ✅)
5. **Enhancement 3** (Phase 6): ~1 hour → User Story 4 → Test → Deploy/Demo (Navigation polish ✅)
6. **Polish** (Phase 7): ~2-3 hours → Accessibility, testing, validation → Final deploy 🚀

Each deployment adds value without breaking previous functionality.

### Parallel Team Strategy

**Timeline**: ~8-10 hours with 3 developers

With multiple developers:

1. **All team**: Complete Phase 1-2 together (3 hours)
2. **Parallel development** after Foundational:
   - Developer A: User Story 1 (4 hours)
   - Developer B: User Story 2 (1.5 hours)
   - Developer C: User Story 3 (1.5 hours)
3. **Sequential**: User Story 4 (1 hour) - depends on US1 completion
4. **All team**: Phase 7 Polish (2-3 hours)

Stories complete independently, integrate at the end.

---

## Success Metrics

### Coverage Targets (Per FR-016: 90%+ required)

- **Utilities** (choreFilters, pagination): 100% coverage ✅
- **Hooks** (usePagination, useTeamMemberChores): 95%+ coverage ✅
- **Components** (ChoreList, PaginationControls, etc.): 90%+ coverage ✅
- **Pages** (TeamListPage, TeamMemberPage): 85%+ coverage ✅
- **Overall**: 90%+ coverage ✅

### Functional Requirements Validation

All 23 functional requirements from spec.md must pass:
- FR-001 to FR-023 ✅

### Success Criteria Validation

All 11 success criteria from spec.md must pass:
- SC-001: Navigation within 2 clicks ✅
- SC-002: Load time < 1s for 100 chores ✅
- SC-003: Time range filter updates without reload ✅
- SC-004: Smooth expand/collapse ✅
- SC-005: 90%+ test coverage ✅
- SC-006: Context-preserving navigation ✅
- SC-007: Responsive at 320px, 768px, 1024px+ ✅
- SC-008: Keyboard accessible, WCAG AA ✅
- SC-009: Pagination < 500ms ✅
- SC-010: Pastel colors meet WCAG AA contrast ✅
- SC-011: Team list < 500ms for 50 members ✅

### Constitution Compliance

- ✅ Clean Code Discipline: TypeScript strict mode, single responsibility
- ✅ Ultra-Modern UX: Pastel theme, micro-interactions, empty states
- ✅ Responsive & Fluid Design: Mobile-first, 320px-1920px support
- ✅ Minimal Dependencies: React Router justified (48KB)
- ✅ Balanced Testing: 90%+ coverage, focused on critical paths
- ✅ Accessibility Priority: WCAG AA, keyboard nav, semantic HTML
- ✅ Easy Deployment: No build changes, static hosting compatible

---

## Notes

- **[P] tasks** = Different files, no dependencies, can run in parallel
- **[Story] label** = Maps task to specific user story for traceability
- **Test-first approach**: Write failing tests before implementation (T018-T022, T030)
- **Independent stories**: Each user story can be completed, tested, and deployed independently
- **Commit frequency**: After each task or logical group
- **Checkpoints**: Validate each story independently before proceeding
- **90%+ coverage**: Required by FR-016, track with `npm run coverage`
- **Accessibility**: WCAG AA compliance required by SC-008, validate with axe DevTools

---

**Total Tasks**: 60 (Setup: 6, Foundational: 11, US1: 12, US2: 6, US3: 6, US4: 6, Polish: 13)

**Estimated Effort**: 12-14 hours (sequential) or 8-10 hours (parallel with 3 developers)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = ~6-8 hours for core value delivery
