import React from 'react';
import { Link } from 'react-router-dom';
import type { TeamMember } from '../../types';

interface TeamMemberCardProps {
  member: TeamMember;
  pendingChores: number;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, pendingChores }) => {
  const choreText = pendingChores === 1 ? 'pending chore' : 'pending chores';

  return (
    <Link
      to={`/team/${member.id}`}
      className="block p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-3">{member.name}</h3>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
          {pendingChores} {choreText}
        </span>
      </div>
    </Link>
  );
};
