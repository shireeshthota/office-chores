import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ChoreForm } from '../Chores/ChoreForm';

interface EventModalProps {
  choreId: string | null;
  initialDate?: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({
  choreId,
  initialDate,
  isOpen,
  onClose,
}: EventModalProps) {
  const { state, deleteChore, toggleChoreCompletion } = useApp();
  const [isEditing, setIsEditing] = useState(!choreId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const chore = choreId ? state.chores.find((c) => c.id === choreId) : undefined;
  const assignee = chore?.assigneeId
    ? state.teamMembers.find((m) => m.id === chore.assigneeId)
    : undefined;

  const handleDelete = () => {
    if (chore) {
      deleteChore(chore.id);
      onClose();
    }
  };

  const handleToggleCompletion = () => {
    if (chore) {
      toggleChoreCompletion(chore.id);
    }
  };

  const handleClose = () => {
    setIsEditing(!choreId);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  const title = choreId
    ? isEditing
      ? 'Edit Chore'
      : 'Chore Details'
    : 'Add Chore';

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
        {isEditing || !choreId ? (
          <ChoreForm
            chore={chore}
            initialDate={initialDate}
            onSave={handleClose}
            onCancel={handleClose}
            onDelete={chore ? () => setShowDeleteConfirm(true) : undefined}
          />
        ) : chore ? (
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${chore.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {chore.title}
                  </h3>
                  {chore.description && (
                    <p className={chore.isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'}>{chore.description}</p>
                  )}
                </div>
                {chore.isCompleted && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned to</span>
                <div className="mt-2">
                  {assignee ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</span>
                <p className="mt-2 font-medium text-gray-900">
                  {new Date(chore.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {chore.isRecurring && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-700">Recurring Chore</p>
                  <p className="text-xs text-indigo-600/70">This chore repeats on a schedule</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={handleToggleCompletion}
              >
                {chore.isCompleted ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark Complete
                  </>
                )}
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit Chore</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Chore"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-2">
            Delete "<span className="font-bold">{chore?.title}</span>"?
          </p>
          {chore?.isRecurring && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              This will delete all occurrences of this recurring chore.
            </p>
          )}
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
