import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CalendarView } from './components/Calendar/CalendarView';
import { EventModal } from './components/Calendar/EventModal';
import { TeamMemberList } from './components/TeamMembers/TeamMemberList';
import { useNotifications } from './hooks/useNotifications';
import { Button } from './components/ui/Button';

function AppContent() {
  const { state } = useApp();
  const { permission, requestPermission } = useNotifications(
    state.chores,
    state.teamMembers
  );

  const [showTeamMembers, setShowTeamMembers] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedChoreId, setSelectedChoreId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showNotificationBanner, setShowNotificationBanner] = useState(
    permission === 'default'
  );

  const handleDateSelect = (date: Date) => {
    setSelectedChoreId(null);
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleEventClick = (choreId: string) => {
    setSelectedChoreId(choreId);
    setSelectedDate(undefined);
    setShowEventModal(true);
  };

  const handleAddChore = () => {
    setSelectedChoreId(null);
    setSelectedDate(new Date());
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedChoreId(null);
    setSelectedDate(undefined);
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
    setShowNotificationBanner(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {showNotificationBanner && (
        <div className="glass-dark text-white px-6 py-3 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-sm font-medium">
              Enable notifications to get reminders for your chores
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNotificationBanner(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="bg-white text-indigo-600 hover:bg-white/90"
            >
              Enable
            </Button>
          </div>
        </div>
      )}

      <Header onOpenTeamMembers={() => setShowTeamMembers(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddChore={handleAddChore} />

        <main className="flex-1 overflow-auto p-6">
          <div className="h-full glass rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
            <CalendarView
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          </div>
        </main>
      </div>

      <TeamMemberList
        isOpen={showTeamMembers}
        onClose={() => setShowTeamMembers(false)}
      />

      <EventModal
        choreId={selectedChoreId}
        initialDate={selectedDate}
        isOpen={showEventModal}
        onClose={handleCloseEventModal}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
