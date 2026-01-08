import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { TeamMember } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TeamMemberForm } from './TeamMemberForm';

interface TeamMemberListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamMemberList({ isOpen, onClose }: TeamMemberListProps) {
  const { state, addTeamMember, updateTeamMember, deleteTeamMember } = useApp();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const handleAdd = (member: Omit<TeamMember, 'id'>) => {
    addTeamMember(member);
    setShowAddForm(false);
  };

  const handleUpdate = (member: TeamMember) => {
    updateTeamMember(member);
    setEditingMember(null);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteTeamMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const choreCount = (memberId: string) =>
    state.chores.filter((c) => c.assigneeId === memberId).length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Team Members" size="lg">
        {showAddForm ? (
          <TeamMemberForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        ) : editingMember ? (
          <TeamMemberForm
            member={editingMember}
            onSave={(m) => handleUpdate(m as TeamMember)}
            onCancel={() => setEditingMember(null)}
          />
        ) : (
          <div className="space-y-4">
            <Button onClick={() => setShowAddForm(true)} className="w-full" size="lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add Team Member
            </Button>

            {state.teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No team members yet</p>
                <p className="text-sm text-gray-400 mt-1">Add someone to get started!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {state.teamMembers.map((member) => (
                  <li
                    key={member.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                          style={{
                            backgroundColor: member.color,
                            boxShadow: `0 4px 14px ${member.color}40`
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          {member.email && (
                            <p className="text-sm text-gray-500">{member.email}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {choreCount(member.id)} chore{choreCount(member.id) !== 1 ? 's' : ''} assigned
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMember(member)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMemberToDelete(member)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Delete Team Member"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-2">
            Delete <span className="font-bold">{memberToDelete?.name}</span>?
          </p>
          {memberToDelete && choreCount(memberToDelete.id) > 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">
              This will unassign {choreCount(memberToDelete.id)} chore{choreCount(memberToDelete.id) !== 1 ? 's' : ''} from this member.
            </p>
          )}
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button variant="secondary" onClick={() => setMemberToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
