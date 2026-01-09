# Office Chores Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-08

## Active Technologies

**Language**: TypeScript 5.9.3 with strict mode enabled

**Frameworks & Libraries**:
- React 19.2.0
- React Router 6.x (to be added in 001-team-member-view)
- Vite 7.2.4
- Tailwind CSS 4.1.18

**Storage**: LocalStorage via existing `utils/storage.ts` (client-side persistence)

**Testing**:
- Vitest 3.x (to be added in 001-team-member-view)
- React Testing Library 16.x
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

**Project Type**: Single-page web application (React SPA)

**Target Platform**: Modern web browsers (ES2022+)

## Project Structure

```text
src/
├── components/
│   ├── Calendar/
│   │   ├── CalendarView.tsx
│   │   └── EventModal.tsx
│   ├── Chores/
│   │   ├── ChoreForm.tsx
│   │   └── RecurrenceBuilder.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── TeamMembers/
│   │   ├── TeamMemberForm.tsx
│   │   └── TeamMemberList.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Select.tsx
├── context/
│   └── AppContext.tsx
├── hooks/
│   ├── useChoreExpansion.ts
│   └── useNotifications.ts
├── types/
│   └── index.ts
└── utils/
    ├── notifications.ts
    ├── rruleHelpers.ts
    └── storage.ts
```

## Commands

**Development**:
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Testing** (after 001-team-member-view implementation):
```bash
npm run test         # Run Vitest tests
npm run test:ui      # Open Vitest UI
npm run coverage     # Generate coverage report
```

**Code Quality**:
```bash
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Code Style

**TypeScript/React**:
- Use TypeScript strict mode (no `any` types unless justified)
- Functional components with hooks (no class components)
- Named exports for components
- Props interfaces defined inline or in types/
- Single responsibility principle for components and functions
- Extract complex logic into custom hooks or utility functions
- Use semantic HTML (buttons, nav, sections, etc.)

**Tailwind CSS**:
- Mobile-first approach (sm:, md:, lg: breakpoints)
- Use Tailwind utility classes over custom CSS
- Group related utilities (layout, spacing, colors)
- Maintain WCAG AA contrast standards
- Minimum touch target size: 44×44px on mobile

**Testing** (when implemented):
- 90%+ coverage target for critical paths
- Focus on user workflows, not implementation details
- Test accessibility (keyboard navigation, screen readers)
- Use React Testing Library best practices
- Avoid testing framework internals

## Recent Changes

### 001-team-member-view (In Planning - 2026-01-08)
**Added**:
- React Router v6 for navigation
- Vitest + React Testing Library for testing
- Team member view pages and components
- Soft delete pattern for team members (isDeleted field)
- Time range filtering (1, 3, 7, 14 days)
- Pagination utilities (25-50 items/page)
- Pastel color theme for light mode

**Constitution Compliance**: All 7 principles validated ✅

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
