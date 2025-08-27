"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: Date;
  xpReward: number;
  gradient: string;
}

function getAchievementsData(): Achievement[] {
  return [
    // Beginner Achievements
    {
      id: "first_steps",
      title: "First Steps",
      description: "Complete your first challenge",
      icon: "👶",
      category: "Getting Started",
      rarity: "common",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedDate: new Date('2024-01-15'),
      xpReward: 50,
      gradient: "from-green-400 to-emerald-500"
    },
    {
      id: "quick_learner",
      title: "Quick Learner",
      description: "Complete 5 challenges in a row",
      icon: "🧠",
      category: "Learning",
      rarity: "common",
      progress: 5,
      maxProgress: 5,
      unlocked: true,
      unlockedDate: new Date('2024-01-20'),
      xpReward: 100,
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      id: "css_warrior",
      title: "CSS Warrior",
      description: "Master 20 CSS challenges",
      icon: "⚔️",
      category: "CSS Mastery",
      rarity: "rare",
      progress: 18,
      maxProgress: 20,
      unlocked: false,
      xpReward: 250,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Complete a challenge in under 60 seconds",
      icon: "⚡",
      category: "Performance",
      rarity: "rare",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedDate: new Date('2024-02-01'),
      xpReward: 200,
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Get 100% accuracy on 10 challenges",
      icon: "💎",
      category: "Precision",
      rarity: "epic",
      progress: 7,
      maxProgress: 10,
      unlocked: false,
      xpReward: 500,
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      id: "marathon_runner",
      title: "Marathon Runner",
      description: "Complete challenges for 30 days straight",
      icon: "🏃‍♂️",
      category: "Dedication",
      rarity: "epic",
      progress: 22,
      maxProgress: 30,
      unlocked: false,
      xpReward: 750,
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      id: "layout_master",
      title: "Layout Master",
      description: "Complete all Flexbox and Grid challenges",
      icon: "📐",
      category: "CSS Mastery",
      rarity: "legendary",
      progress: 45,
      maxProgress: 50,
      unlocked: false,
      xpReward: 1000,
      gradient: "from-pink-500 via-purple-500 to-indigo-500"
    },
    {
      id: "animation_wizard",
      title: "Animation Wizard",
      description: "Master all CSS animation challenges",
      icon: "🎭",
      category: "Advanced CSS",
      rarity: "legendary",
      progress: 12,
      maxProgress: 25,
      unlocked: false,
      xpReward: 1200,
      gradient: "from-emerald-400 via-cyan-500 to-blue-600"
    },
    {
      id: "community_helper",
      title: "Community Helper",
      description: "Help 50 fellow learners",
      icon: "🤝",
      category: "Community",
      rarity: "rare",
      progress: 35,
      maxProgress: 50,
      unlocked: false,
      xpReward: 300,
      gradient: "from-rose-400 to-pink-500"
    },
    {
      id: "streak_master",
      title: "Streak Master",
      description: "Maintain a 100-day learning streak",
      icon: "🔥",
      category: "Dedication",
      rarity: "legendary",
      progress: 65,
      maxProgress: 100,
      unlocked: false,
      xpReward: 2000,
      gradient: "from-orange-400 via-red-500 to-pink-600"
    },
    {
      id: "explorer",
      title: "Explorer",
      description: "Try challenges from all categories",
      icon: "🗺️",
      category: "Exploration",
      rarity: "common",
      progress: 8,
      maxProgress: 10,
      unlocked: false,
      xpReward: 150,
      gradient: "from-teal-400 to-cyan-500"
    },
    {
      id: "night_owl",
      title: "Night Owl",
      description: "Complete 20 challenges after midnight",
      icon: "🦉",
      category: "Dedication",
      rarity: "rare",
      progress: 15,
      maxProgress: 20,
      unlocked: false,
      xpReward: 300,
      gradient: "from-violet-500 to-purple-600"
    }
  ];
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRarity, setSelectedRarity] = useState<string>("All");
  const router = useRouter();

  useEffect(() => {
    const data = getAchievementsData();
    setAchievements(data);
  }, []);

  const categories = ["All", ...Array.from(new Set(achievements.map(a => a.category)))];
  const rarities = ["All", "common", "rare", "epic", "legendary"];

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === "All" || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === "All" || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXpEarned = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-500 to-pink-600';
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/50';
      case 'rare': return 'border-blue-400/50';
      case 'epic': return 'border-purple-500/50';
      case 'legendary': return 'border-yellow-400/50 shadow-yellow-400/25';
      default: return 'border-gray-400/50';
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
        <div className="absolute top-60 left-1/3 w-10 h-10 bg-emerald-400/20 rounded-full blur-lg animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-1/2 w-6 h-6 bg-orange-400/35 rotate-45 animate-spin delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">
            🏆 Achievements
          </h1>
          <p className="text-xl text-white/70 mb-8">Celebrate your learning milestones and unlock new challenges</p>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {unlockedCount}
              </div>
              <div className="text-white/70 mt-1">Unlocked</div>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {achievements.length}
              </div>
              <div className="text-white/70 mt-1">Total Available</div>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {totalXpEarned}
              </div>
              <div className="text-white/70 mt-1">XP Earned</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 justify-center items-center">
          <div className="flex flex-wrap gap-3">
            <span className="text-white/70 font-medium">Category:</span>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <span className="text-white/70 font-medium">Rarity:</span>
            {rarities.map(rarity => (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${
                  selectedRarity === rarity
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`backdrop-blur-xl rounded-3xl p-6 border-2 transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                achievement.unlocked 
                  ? `bg-white/15 ${getRarityBorder(achievement.rarity)} shadow-lg hover:shadow-2xl` 
                  : "bg-white/5 border-white/10 grayscale hover:grayscale-0"
              }`}
            >
              {/* Rarity Glow Effect for Legendary */}
              {achievement.rarity === 'legendary' && achievement.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
              )}
              
              {/* Achievement Icon */}
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${achievement.gradient} flex items-center justify-center text-3xl shadow-lg mb-4 ${
                  achievement.unlocked ? "animate-pulse" : "opacity-50"
                }`}>
                  {achievement.icon}
                </div>

                {/* Achievement Title and Category */}
                <div className="mb-3">
                  <h3 className={`text-xl font-bold mb-1 ${
                    achievement.unlocked 
                      ? "text-white" 
                      : "text-white/60"
                  }`}>
                    {achievement.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white font-semibold uppercase tracking-wide`}>
                      {achievement.rarity}
                    </span>
                    <span className="text-xs text-white/60">{achievement.category}</span>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 ${
                  achievement.unlocked ? "text-white/80" : "text-white/50"
                }`}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                {!achievement.unlocked && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/60 mb-2">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${achievement.gradient} transition-all duration-500`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Unlocked Date or XP Reward */}
                <div className="flex justify-between items-center">
                  {achievement.unlocked ? (
                    <div className="text-xs text-green-400 font-medium">
                      ✅ Unlocked {achievement.unlockedDate?.toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-xs text-white/50">
                      🔒 Locked
                    </div>
                  )}
                  <div className={`text-xs font-bold ${
                    achievement.unlocked 
                      ? "text-yellow-400" 
                      : "text-white/50"
                  }`}>
                    +{achievement.xpReward} XP
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white/80 mb-2">No achievements found</h3>
            <p className="text-white/60">Try adjusting your filters to see more achievements</p>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => router.push("/dashboard")} 
            className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl px-8 py-4 border border-white/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                ←
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-white">Back to Dashboard</h4>
                <p className="text-white/60 text-sm">Return to your profile</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}