"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

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

  if (!user) return <div className="text-center mt-12 text-white">Loading...</div>;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-gray-300 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-gray-800 bg-opacity-80 rounded-2xl shadow-lg p-8 flex flex-col items-center backdrop-blur-sm border border-gray-700 relative">
          {/* Edit button in top right corner */}
          <button
            onClick={handleEditToggle}
            className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 text-sm font-medium focus:outline-none transition-colors duration-200"
            aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          >
            {isEditMode ? "Done" : "Edit"}
          </button>

          <div className="relative w-40 h-40 rounded-full border-2 border-gray-600 shadow-md overflow-hidden">
            <Image
              src={user.avatar}
              alt={`${user.name} avatar`}
              fill
              sizes="160px"
              className="object-cover rounded-full"
            />
          </div>
          <div className="mt-4 w-full flex flex-col items-center gap-2">
            {isEditMode && !isEditingAvatar ? (
              <button
                onClick={() => setIsEditingAvatar(true)}
                className="w-full text-sm font-semibold text-indigo-400 hover:text-indigo-600 focus:outline-none"
                aria-label="Edit avatar"
              >
                Edit
              </button>
            ) : isEditMode && isEditingAvatar ? (
              <div className="flex flex-col w-full gap-2">
                <label
                  htmlFor="avatar-upload"
                  className="w-full text-center text-sm font-semibold text-white bg-indigo-600 rounded-full py-2 cursor-pointer hover:bg-indigo-700"
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
                  className="w-full text-sm font-semibold text-red-500 hover:text-red-600 focus:outline-none"
                >
                  Remove Picture
                </button>
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  className="w-full text-sm font-semibold text-gray-400 hover:text-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
          <div className="mt-6 w-full flex items-center justify-center gap-2">
            {!isEditingName ? (
              <>
                <h1 className="text-3xl font-semibold text-white">{user.name}</h1>
                {isEditMode && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-indigo-400 hover:text-indigo-600 text-sm font-medium focus:outline-none"
                    aria-label="Edit name"
                  >
                    Edit
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
                className="text-3xl font-semibold text-white bg-transparent border border-gray-600 rounded-md px-3 py-1 w-full text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your name"
              />
            )}
          </div>
          <p className="mt-1 text-sm text-gray-400">Level {user.level}</p>

          <textarea
            value={user.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Enter bio"
            className="mt-4 w-full bg-gray-700 bg-opacity-50 rounded-md p-2 text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            disabled={!isEditMode}
            style={{ opacity: isEditMode ? 1 : 0.7 }}
          />

          <div className="mt-8 w-full space-y-6 border-t border-gray-700 pt-6">
            <div className="flex justify-between items-center text-sm px-4 py-2 rounded-lg hover:bg-gray-700 hover:shadow-md transition-all duration-300 cursor-default select-none">
              <span className="font-medium text-gray-400">🎮 Games Played</span>
              <span className="font-semibold text-white">{user.gamesPlayed}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-4 py-2 rounded-lg hover:bg-gray-700 hover:shadow-md transition-all duration-300 cursor-default select-none">
              <span className="font-medium text-gray-400">🏆 Wins</span>
              <span className="font-semibold text-white">{user.wins}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-4 py-2 rounded-lg hover:bg-gray-700 hover:shadow-md transition-all duration-300 cursor-default select-none">
              <span className="font-medium text-gray-400">💔 Losses</span>
              <span className="font-semibold text-white">{user.losses}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-4 py-2 rounded-lg hover:bg-gray-700 hover:shadow-md transition-all duration-300 cursor-default select-none">
              <span className="font-medium text-gray-400">📊 Win Rate</span>
              <span className="font-semibold text-white">{winRate}%</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-10 border-l border-gray-700 pl-6">
          {/* Stats Cards */}
          {[
            { label: "Games Played", value: user.gamesPlayed, icon: "🎮" },
            { label: "Wins", value: user.wins, icon: "🏆" },
            { label: "Losses", value: user.losses, icon: "💔" },
            { label: "Win Rate", value: `${winRate}%`, icon: "📊" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col justify-center transform transition-transform duration-300 hover:scale-[1.05] hover:shadow-xl cursor-default select-none"
            >
              <p className="text-sm uppercase tracking-wide text-gray-400 flex items-center gap-2">
                <span>{stat.icon}</span> {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}

          {/* XP Progress Card */}
          <div className="bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col cursor-default select-none">
            <p className="text-sm uppercase tracking-wide text-gray-400 mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              ⏳ XP Progress
            </p>
            <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="h-6 rounded-full transition-all duration-500"
                style={{
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-right font-mono">
              {user.xp} / {user.nextLevelXp} XP
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}