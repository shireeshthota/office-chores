import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { TeamMemberCard } from './TeamMemberCard';

export const TeamListPage: React.FC = () => {
  const { state } = useContext(AppContext);

  const activeTeamMembers = useMemo(() => {
    return state.teamMembers.filter((member) => !member.isDeleted);
  }, [state.teamMembers]);

  // Don't filter chores by members for now - just count all chores
  const activeChores = useMemo(() => {
    return state.chores;
  }, [state.chores]);

  const getPendingChoresCount = (memberId: string): number => {
    return activeChores.filter(
      (chore) => chore.assigneeId === memberId && !chore.isCompleted
    ).length;
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="container mx-auto">
        <nav className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Calendar
          </Link>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Members</h1>

      {activeTeamMembers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No team members found</p>
          <p className="text-sm mt-2">Add team members to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTeamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              pendingChores={getPendingChoresCount(member.id)}
            />
          ))}
        </div>
      )}
      </div>
    </main>
  );
};
