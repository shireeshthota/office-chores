import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenTeamMembers: () => void;
}

export function Header({ onOpenTeamMembers }: HeaderProps) {
  return (
    <header className="glass border-b border-white/20 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Office Chores
              </h1>
              <p className="text-xs text-gray-500">Keep your workspace organized</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/team"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Team
          </Link>
          <button
            onClick={onOpenTeamMembers}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Member
          </button>
        </div>
      </div>
    </header>
  );
}
