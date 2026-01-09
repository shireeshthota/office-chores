import React, { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useTeamMemberChores } from '../../hooks/useTeamMemberChores';
import { usePagination } from '../../hooks/usePagination';
import { ChoreList } from './ChoreList';
import { PaginationControls } from './PaginationControls';

export const TeamMemberPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const { state } = useContext(AppContext);

  const teamMember = useMemo(() => {
    return state.teamMembers.find(
      (member) => member.id === memberId && !member.isDeleted
    );
  }, [state.teamMembers, memberId]);

  const { pendingChores, completedChores } = useTeamMemberChores(
    state.chores,
    memberId || '',
    'all'
  );

  const {
    currentPage: pendingPage,
    pageSize: pendingPageSize,
    paginatedItems: paginatedPendingChores,
    totalPages: pendingTotalPages,
    nextPage: nextPendingPage,
    prevPage: prevPendingPage,
  } = usePagination(pendingChores, 25);

  const {
    currentPage: completedPage,
    pageSize: completedPageSize,
    paginatedItems: paginatedCompletedChores,
    totalPages: completedTotalPages,
    nextPage: nextCompletedPage,
    prevPage: prevCompletedPage,
  } = usePagination(completedChores, 25);

  if (!teamMember) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          <nav className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mr-4"
            >
              ← Calendar
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/team"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium ml-4"
            >
              Team
            </Link>
          </nav>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Member Not Found</h1>
            <p className="text-gray-600 mb-6">
              The team member you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/team"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Team List
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="container mx-auto">
      <nav className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mr-4"
        >
          ← Calendar
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          to="/team"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium ml-4"
        >
          Team
        </Link>
      </nav>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{teamMember.name}</h1>
      </div>

      <div className="space-y-8">
        {/* Pending Chores Section */}
        <section aria-label="Pending Chores" role="region">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Pending Chores ({pendingChores.length})
          </h2>
          {pendingChores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending chores</p>
            </div>
          ) : (
            <>
              <ChoreList chores={paginatedPendingChores} />
              {pendingTotalPages > 1 && (
                <PaginationControls
                  currentPage={pendingPage}
                  totalPages={pendingTotalPages}
                  pageSize={pendingPageSize}
                  totalItems={pendingChores.length}
                  onNextPage={nextPendingPage}
                  onPrevPage={prevPendingPage}
                />
              )}
            </>
          )}
        </section>

        {/* Completed Chores Section */}
        <section aria-label="Completed Chores" role="region">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Completed Chores ({completedChores.length})
          </h2>
          {completedChores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No completed chores</p>
            </div>
          ) : (
            <>
              <ChoreList chores={paginatedCompletedChores} />
              {completedTotalPages > 1 && (
                <PaginationControls
                  currentPage={completedPage}
                  totalPages={completedTotalPages}
                  pageSize={completedPageSize}
                  totalItems={completedChores.length}
                  onNextPage={nextCompletedPage}
                  onPrevPage={prevCompletedPage}
                />
              )}
            </>
          )}
        </section>
      </div>
      </div>
    </main>
  );
};
