"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getUserData() {
  return {
    name: "PlayerOne",
    level: 15,
    xp: 3500,
    nextLevelXp: 5000,
    gamesPlayed: 120,
    wins: 85,
    losses: 35,
    avatar: "/avatar.png",
    bio: "",
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // TODO: Fetch user data from Firebase here and setUser with the result
    // For now, use default data
    const data = getUserData();
    setUser(data);
  }, []);

  // TODO: Add Firebase update calls when user state changes if needed
  // For now, no persistence

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white text-xl">Loading...</div>
    </div>
  );

  const winRate = ((user.wins / user.gamesPlayed) * 100).toFixed(1);
  const xpProgress = (user.xp / user.nextLevelXp) * 100;

  const handleInputChange = (field: string, value: string) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      [field]: value,
    }));
    // TODO: Update user field in Firebase here
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prevUser: any) => ({
          ...prevUser,
          avatar: reader.result as string,
        }));
        setIsEditingAvatar(false);
        // TODO: Update avatar in Firebase here
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setUser((prevUser: any) => ({
      ...prevUser,
      avatar: "/avatar.png",
    }));
    setIsEditingAvatar(false);
    // TODO: Update avatar removal in Firebase here
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    // Reset editing states when exiting edit mode
    if (isEditMode) {
      setIsEditingName(false);
      setIsEditingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-sans relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-cyan-400/30 rotate-45 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-purple-400/25 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-blue-300/40 rotate-12 animate-spin"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-indigo-500/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-10 w-4 h-4 bg-pink-300/50 rotate-45 animate-bounce delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/20 relative">
          {/* Edit button in top right corner */}
          <button
            onClick={handleEditToggle}
            className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isEditMode 
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-green-400/25" 
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25"
            } hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50`}
            aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          >
            {isEditMode ? "Done" : "Edit"}
          </button>

          {/* Avatar Section */}
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
              <Image
                src={user.avatar}
                alt={`${user.name} avatar`}
                fill
                sizes="160px"
                className="object-cover rounded-full"
              />
            </div>
          </div>

          {/* Avatar Edit Controls */}
          <div className="mt-6 w-full flex flex-col items-center gap-3">
            {isEditMode && !isEditingAvatar ? (
              <button
                onClick={() => setIsEditingAvatar(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 focus:outline-none"
                aria-label="Edit avatar"
              >
                Change Avatar
              </button>
            ) : isEditMode && isEditingAvatar ? (
              <div className="flex flex-col w-full gap-3">
                <label
                  htmlFor="avatar-upload"
                  className="w-full text-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  Choose New Picture
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleRemoveAvatar}
                  className="w-full px-6 py-2 bg-red-500/80 backdrop-blur text-white rounded-full text-sm font-semibold hover:bg-red-600/80 transition-all duration-300 focus:outline-none"
                >
                  Remove Picture
                </button>
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  className="w-full px-6 py-2 bg-white/20 backdrop-blur text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-all duration-300 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>

          {/* Name Section */}
          <div className="mt-8 w-full flex items-center justify-center gap-3">
            {!isEditingName ? (
              <>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {user.name}
                </h1>
                {isEditMode && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium focus:outline-none transition-colors duration-200"
                    aria-label="Edit name"
                  >
                    ✏️
                  </button>
                )}
              </>
            ) : (
              <input
                type="text"
                value={user.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="text-3xl font-bold text-white bg-white/10 backdrop-blur border border-white/30 rounded-xl px-4 py-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="Enter your name"
              />
            )}
          </div>

          {/* Level Badge */}
          <div className="mt-3 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
            <p className="text-sm font-bold text-white">Level {user.level}</p>
          </div>

          {/* Bio Section */}
          <textarea
            value={user.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell us about yourself..."
            className={`mt-6 w-full bg-white/10 backdrop-blur rounded-xl p-4 text-white resize-none border border-white/20 transition-all duration-300 ${
              isEditMode ? "focus:ring-2 focus:ring-cyan-400 focus:border-transparent" : "cursor-default"
            }`}
            rows={3}
            disabled={!isEditMode}
            style={{ opacity: isEditMode ? 1 : 0.8 }}
          />

          {/* Stats Sidebar */}
          <div className="mt-8 w-full space-y-4">
            {[
              { label: "Games Played", value: user.gamesPlayed, icon: "🎮", gradient: "from-blue-400 to-purple-500" },
              { label: "Wins", value: user.wins, icon: "🏆", gradient: "from-green-400 to-emerald-500" },
              { label: "Losses", value: user.losses, icon: "💔", gradient: "from-red-400 to-pink-500" },
              { label: "Win Rate", value: `${winRate}%`, icon: "📊", gradient: "from-yellow-400 to-orange-500" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="font-medium text-white/90">{stat.label}</span>
                </div>
                <span className={`font-bold text-lg bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">
              Player Dashboard
            </h2>
            <p className="text-xl text-white/70">Track your progress and achievements</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                label: "Games Played", 
                value: user.gamesPlayed, 
                icon: "🎮", 
                gradient: "from-blue-400 to-purple-500",
                description: "Total matches"
              },
              { 
                label: "Victories", 
                value: user.wins, 
                icon: "🏆", 
                gradient: "from-green-400 to-emerald-500",
                description: "Games won"
              },
              { 
                label: "Defeats", 
                value: user.losses, 
                icon: "💔", 
                gradient: "from-red-400 to-pink-500",
                description: "Learning experiences"
              },
              { 
                label: "Win Rate", 
                value: `${winRate}%`, 
                icon: "📊", 
                gradient: "from-yellow-400 to-orange-500",
                description: "Success percentage"
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-3xl group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{stat.label}</h3>
                <p className="text-white/60 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* XP Progress Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                ⚡
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Experience Progress</h3>
                <p className="text-white/60">Level {user.level} → Level {user.level + 1}</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden shadow-inner backdrop-blur">
                <div
                  className="h-6 rounded-full transition-all duration-1000 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 shadow-lg"
                  style={{ width: `${xpProgress}%` }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-white/80 font-mono text-sm">{user.xp} XP</span>
                <span className="text-white/60 text-sm">{Math.round(xpProgress)}% Complete</span>
                <span className="text-white/80 font-mono text-sm">{user.nextLevelXp} XP</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/70 text-sm text-center">
                🎯 <span className="font-semibold">{user.nextLevelXp - user.xp} XP</span> needed to reach Level {user.level + 1}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  🚀
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-white">Start New Quest</h4>
                  <p className="text-white/60 text-sm">Begin your next adventure</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => router.push("/achievement")} 
              className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  🏅
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-white">View Achievements</h4>
                  <p className="text-white/60 text-sm">See your accomplishments</p>
                </div>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
