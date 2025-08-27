"use client";
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  Code, 
  Zap, 
  Star, 
  BookOpen, 
  Target,
  MapPin,
  ChevronRight,
  Play,
  Gift,
  ArrowLeft,
  Timer,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'challenge' | 'community' | 'special';
  status: 'active' | 'upcoming' | 'coming-soon';
  date: string;
  time: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  level: 'Beginner' | 'Intermediate' | 'Expert' | 'All';
  icon: React.ReactNode;
  color: string;
}

const EventsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeEventFrame, setActiveEventFrame] = useState<Event | null>(null);
  const [showSlotsFullPopup, setShowSlotsFullPopup] = useState(false);

  const currentEvents: Event[] = [
    {
      id: '1',
      title: 'Daily Tailwind Challenge',
      description: 'Quick 15-minute styling challenges to sharpen your Tailwind skills. New challenge every day!',
      type: 'challenge',
      status: 'active',
      date: 'Daily',
      time: '9:00 AM',
      duration: '15 min',
      participants: 234,
      maxParticipants: 500,
      level: 'All',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: '2',
      title: 'Weekend Component Workshop',
      description: 'Build reusable components together. This weekend: Creating a responsive navigation system.',
      type: 'workshop',
      status: 'upcoming',
      date: 'Dec 30, 2024',
      time: '2:00 PM',
      duration: '2 hours',
      participants: 100,
      maxParticipants: 100,
      level: 'Intermediate',
      icon: <Code className="w-5 h-5" />,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: '3',
      title: 'Show & Tell Friday',
      description: 'Present your latest Tailwind creations to the community and get feedback from peers.',
      type: 'community',
      status: 'active',
      date: 'Every Friday',
      time: '6:00 PM',
      duration: '1 hour',
      participants: 150,
      maxParticipants: 150,
      level: 'All',
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: '4',
      title: 'Speed Styling Sprint',
      description: 'Race against time to style components using only Tailwind utilities. Prizes for top performers!',
      type: 'challenge',
      status: 'active',
      date: 'Every Tuesday',
      time: '7:00 PM',
      duration: '45 min',
      participants: 200,
      maxParticipants: 200,
      level: 'All',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const comingSoonEvents: Event[] = [
    {
      id: '5',
      title: 'Global Design Battle',
      description: 'Compete with developers worldwide in real-time design challenges. Firebase-powered leaderboards.',
      type: 'challenge',
      status: 'coming-soon',
      date: 'Q1 2025',
      time: 'TBA',
      duration: '3 hours',
      participants: 0,
      maxParticipants: 1000,
      level: 'All',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: '6',
      title: 'Tailwind Masterclass Series',
      description: 'Deep-dive sessions with industry experts covering advanced Tailwind patterns and best practices.',
      type: 'workshop',
      status: 'coming-soon',
      date: 'Q1 2025',
      time: 'TBA',
      duration: '4 hours',
      participants: 0,
      maxParticipants: 500,
      level: 'Expert',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: '7',
      title: 'Community Template Library',
      description: 'Collaborative project to build the ultimate collection of Tailwind templates. Firebase integration.',
      type: 'community',
      status: 'coming-soon',
      date: 'Q2 2025',
      time: 'TBA',
      duration: 'Ongoing',
      participants: 0,
      maxParticipants: 999,
      level: 'All',
      icon: <Gift className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  const allEvents = [...currentEvents, ...comingSoonEvents];

  const filteredEvents = selectedFilter === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.type === selectedFilter);

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-400/10 text-green-300 ring-1 ring-green-500/30';
      case 'upcoming':
        return 'bg-blue-400/10 text-blue-300 ring-1 ring-blue-500/30';
      case 'coming-soon':
        return 'bg-purple-400/10 text-purple-300 ring-1 ring-purple-500/30';
      default:
        return 'bg-gray-400/10 text-gray-300 ring-1 ring-gray-500/30';
    }
  };

  const getLevelColor = (level: Event['level']) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-400/10 text-green-300';
      case 'Intermediate':
        return 'bg-yellow-400/10 text-yellow-300';
      case 'Expert':
        return 'bg-red-400/10 text-red-300';
      default:
        return 'bg-indigo-400/10 text-indigo-300';
    }
  };

  const handleJoinEvent = (event: Event) => {
    if (event.status === 'active') {
      if (event.id === '1') {
        // Daily Tailwind Challenge - always allow to join
        setActiveEventFrame(event);
      } else {
        // All other events - show slots full popup
        setShowSlotsFullPopup(true);
      }
    } else if (event.status === 'upcoming') {
      // For upcoming events (registration), show slots full popup
      setShowSlotsFullPopup(true);
    }
  };

  const renderEventFrame = (event: Event) => {
    switch (event.id) {
      case '1': // Daily Tailwind Challenge
        return <DailyTailwindChallengeFrame event={event} onBack={() => setActiveEventFrame(null)} />;
      case '3': // Show & Tell Friday
        return <ShowAndTellFrame event={event} onBack={() => setActiveEventFrame(null)} />;
      case '4': // Speed Styling Sprint
        return <SpeedStylingFrame event={event} onBack={() => setActiveEventFrame(null)} />;
      default:
        return <GenericEventFrame event={event} onBack={() => setActiveEventFrame(null)} />;
    }
  };

  if (activeEventFrame) {
    return renderEventFrame(activeEventFrame);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Nebula background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2e026d] via-[#15162c] to-[#0f172a]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-300 to-sky-300 mb-4">
            TailSpark Events
          </h1>
          <p className="text-indigo-200/80 text-lg max-w-2xl mx-auto">
            Join our vibrant community of Tailwind enthusiasts. Learn, compete, and grow together through interactive events and challenges.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'all', label: 'All Events', icon: <Target className="w-4 h-4" /> },
            { id: 'workshop', label: 'Workshops', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'challenge', label: 'Challenges', icon: <Trophy className="w-4 h-4" /> },
            { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" /> }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                selectedFilter === filter.id
                  ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/10 text-indigo-200 hover:bg-white/20 border border-white/10'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-105"
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(event.status)}`}>
                  {event.status === 'coming-soon' ? 'Coming Soon' : event.status === 'active' ? 'Live' : 'Upcoming'}
                </span>
              </div>

              {/* Full indicator for events except Daily Tailwind Challenge */}
              {event.id !== '1' && event.status !== 'coming-soon' && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-xs px-2 py-1 rounded-full bg-red-400/10 text-red-300 ring-1 ring-red-500/30">
                    Full
                  </span>
                </div>
              )}

              {/* Gradient header */}
              <div className={`h-20 bg-gradient-to-r ${event.color} opacity-80`} />

              {/* Content */}
              <div className="p-6 -mt-8 relative">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${event.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {event.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">
                  {event.title}
                </h3>
                <p className="text-indigo-200/80 text-sm mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-indigo-200">
                    <Calendar className="w-4 h-4 text-fuchsia-400" />
                    <span>{event.date}</span>
                    <Clock className="w-4 h-4 text-sky-400 ml-2" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-indigo-200">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Duration: {event.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-indigo-200">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>{event.participants}/{event.maxParticipants}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg ${getLevelColor(event.level)}`}>
                      {event.level}
                    </span>
                  </div>
                </div>

                {/* Progress bar for participants */}
                <div className="mb-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 bg-gradient-to-r ${event.color} rounded-full transition-all duration-300`}
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleJoinEvent(event)}
                    disabled={event.status === 'coming-soon'}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                      event.status === 'coming-soon'
                        ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                        : event.status === 'active'
                        ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg'
                    }`}
                  >
                    {event.status === 'coming-soon' ? (
                      <>
                        <Clock className="w-4 h-4" />
                        Soon
                      </>
                    ) : event.status === 'active' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Join Now
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Register
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Events', value: '4', icon: <Zap className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Participants', value: '684', icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
            { label: 'Events This Month', value: '12', icon: <Calendar className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
            { label: 'Coming Soon', value: '3', icon: <Star className="w-6 h-6" />, color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-indigo-200/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10">
            <div className={`h-24 bg-gradient-to-r ${selectedEvent.color} relative`}>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-8 -mt-6 relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${selectedEvent.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {selectedEvent.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">{selectedEvent.title}</h2>
              <p className="text-indigo-200/90 mb-6 leading-relaxed">{selectedEvent.description}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-300">Date:</span>
                  <span className="text-white font-medium">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-300">Time:</span>
                  <span className="text-white font-medium">{selectedEvent.time}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-300">Duration:</span>
                  <span className="text-white font-medium">{selectedEvent.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-300">Participants:</span>
                  <span className="text-white font-medium">{selectedEvent.participants}/{selectedEvent.maxParticipants}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleJoinEvent(selectedEvent);
                  }}
                  disabled={selectedEvent.status === 'coming-soon'}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedEvent.status === 'coming-soon'
                      ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white'
                  }`}
                >
                  {selectedEvent.status === 'coming-soon' ? 'Coming Soon' : 'Join Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slots Full Popup */}
      {showSlotsFullPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">Event Full</h2>
              <p className="text-indigo-200/90 mb-6 leading-relaxed">
                Sorry, this event has reached its maximum capacity. All slots are currently filled.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowSlotsFullPopup(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all"
                >
                  Got it
                </button>
                <p className="text-indigo-200/70 text-sm">
                  Follow us for updates on new event announcements!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;

// Event Frame Components
const DailyTailwindChallengeFrame: React.FC<{ event: Event; onBack: () => void }> = ({ event, onBack }) => {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const challenges = [
    {
      title: "Create a Card Component",
      description: "Build a responsive card with an image, title, and description using Tailwind utilities.",
      startingCode: '<div class="p-4">\n  <!-- Your card here -->\n</div>',
      expectedClasses: ['rounded', 'shadow', 'bg-white']
    },
    {
      title: "Style a Button",
      description: "Create a gradient button with hover effects and proper spacing.",
      startingCode: '<button class="">\n  Click Me\n</button>',
      expectedClasses: ['bg-gradient', 'hover:', 'px-', 'py-']
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2e026d] via-[#15162c] to-[#0f172a]" />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-indigo-200">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Challenge {currentChallenge + 1}/2</span>
              </div>
            </div>
          </div>
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        {!isCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Challenge Instructions */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${event.color} flex items-center justify-center text-white mb-4`}>
                {event.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{challenges[currentChallenge].title}</h2>
              <p className="text-indigo-200/80 mb-6">{challenges[currentChallenge].description}</p>
              
              <div className="bg-indigo-500/10 rounded-xl p-4 mb-6">
                <h3 className="text-white font-medium mb-2">Tips:</h3>
                <ul className="text-sm text-indigo-200 space-y-1">
                  <li>• Use responsive utilities (sm:, md:, lg:)</li>
                  <li>• Add hover effects for interactivity</li>
                  <li>• Consider accessibility with proper contrast</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (currentChallenge < challenges.length - 1) {
                    setCurrentChallenge(currentChallenge + 1);
                    setUserCode(challenges[currentChallenge + 1].startingCode);
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all"
              >
                {currentChallenge < challenges.length - 1 ? 'Next Challenge' : 'Complete Challenge'}
              </button>
            </div>

            {/* Code Editor & Preview */}
            <div className="space-y-6">
              {/* Code Editor */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-700/60 to-fuchsia-700/60 text-white font-medium">
                  Code Editor
                </div>
                <textarea
                  value={userCode || challenges[currentChallenge].startingCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-64 bg-slate-950/90 text-emerald-300 font-mono text-sm p-4 resize-none focus:outline-none"
                  placeholder="Write your Tailwind HTML here..."
                />
              </div>

              {/* Live Preview */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-700/60 to-fuchsia-700/60 text-white font-medium">
                  Live Preview
                </div>
                <div 
                  className="h-64 bg-white p-4 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: userCode || challenges[currentChallenge].startingCode }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Challenge Complete!</h2>
            <p className="text-indigo-200/80 mb-8 max-w-md mx-auto">
              Great job! You've completed today's Tailwind challenge. Come back tomorrow for a new one!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentChallenge(0);
                  setUserCode(challenges[0].startingCode);
                  setTimeLeft(900);
                }}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl transition-all"
              >
                Back to Events
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ShowAndTellFrame: React.FC<{ event: Event; onBack: () => void }> = ({ event, onBack }) => {
  const [submissions] = useState([
    { id: 1, author: 'Alex Chen', title: 'Animated Dashboard', likes: 24, preview: 'https://via.placeholder.com/300x200' },
    { id: 2, author: 'Sarah Kim', title: 'E-commerce Cards', likes: 18, preview: 'https://via.placeholder.com/300x200' },
    { id: 3, author: 'Mike Johnson', title: 'Landing Page Hero', likes: 31, preview: 'https://via.placeholder.com/300x200' }
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2e026d] via-[#15162c] to-[#0f172a]" />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-indigo-200">Share your latest Tailwind creations</p>
          </div>
          
          <div className="w-32" />
        </div>

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
              <img src={submission.preview} alt={submission.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-white font-bold mb-1">{submission.title}</h3>
                <p className="text-indigo-200/80 text-sm mb-3">by {submission.author}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-300 text-sm">{submission.likes} likes</span>
                  <button className="px-3 py-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white rounded-lg text-sm">
                    View Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Your Work */}
        <div className="mt-12 text-center">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Submit Your Work</h2>
            <p className="text-indigo-200/80 mb-6">Ready to show off your latest creation?</p>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all">
              Upload Project
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const SpeedStylingFrame: React.FC<{ event: Event; onBack: () => void }> = ({ event, onBack }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2e026d] via-[#15162c] to-[#0f172a]" />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-indigo-200">Race against time to style components</p>
          </div>
          
          <div className="w-32" />
        </div>

        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Speed Styling Sprint</h2>
          <p className="text-indigo-200/80 mb-8 max-w-md mx-auto">
            This is a placeholder for the Speed Styling Sprint event. The full implementation would include timed challenges and leaderboards.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl transition-all"
          >
            Back to Events
          </button>
        </div>
      </main>
    </div>
  );
};

const GenericEventFrame: React.FC<{ event: Event; onBack: () => void }> = ({ event, onBack }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2e026d] via-[#15162c] to-[#0f172a]" />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-indigo-200">{event.description}</p>
          </div>
          
          <div className="w-32" />
        </div>

        <div className="text-center py-16">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${event.color} flex items-center justify-center`}>
            {React.cloneElement(event.icon as React.ReactElement, { className: "w-12 h-12 text-white" })}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{event.title}</h2>
          <p className="text-indigo-200/80 mb-8 max-w-md mx-auto">
            This event frame is a placeholder. The full implementation would be customized for this specific event.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl transition-all"
          >
            Back to Events
          </button>
        </div>
      </main>
    </div>
  );
};