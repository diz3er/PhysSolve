import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CORE_BOOKS } from '../constants';
import { CheckCircle, Book, Trophy, LogOut, Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import { auth, signInWithGoogle } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { seedDatabase } from '../lib/seed';

const Profile = () => {
  const { profile, loading, user } = useAuth();
  const [seeding, setSeeding] = React.useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      alert("Database indexed with standard textbooks!");
    } catch (e) {
      alert("Error seeding: " + e);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-zinc-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">Retrieving Research Data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <UserIcon className="mx-auto text-zinc-800 mb-6" size={48} />
        <h2 className="text-3xl font-bold text-white mb-4 italic serif font-serif">Research Account Required</h2>
        <p className="text-zinc-500 mb-8 leading-relaxed">Please sign in to track your progress, solve problems, and join the discussion forum.</p>
        <button 
          onClick={signInWithGoogle}
          className="bg-zinc-100 text-black px-8 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-zinc-300 transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-24 border-b border-zinc-900 pb-16 relative">
        {/* Progress Atom Visualization */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none hidden lg:block">
          <svg width="300" height="300" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="2" fill="white" className="animate-pulse" />
            {[15, 25, 35].map((r, i) => (
              <circle 
                key={i} 
                cx="50" cy="50" r={r} 
                fill="none" 
                stroke="white" 
                strokeWidth="0.2" 
                strokeDasharray="2 2"
                className={`animate-[spin_${10 + i * 5}s_linear_infinite${i % 2 === 0 ? '' : '_reverse'}] origin-center`}
              />
            ))}
            {/* Electrons representing solved count */}
            {Array.from({ length: Math.min(profile?.solvedCount || 0, 12) }).map((_, i) => {
              const ring = (i % 3) * 10 + 15;
              const angle = (i * 137.5) % 360;
              return (
                <motion.circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="1.5"
                  fill="white"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    transformOrigin: '50px 50px',
                    transform: `rotate(${angle}deg) translateX(${ring}px)`
                  }}
                />
              );
            })}
          </svg>
        </div>

        <img 
          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
          alt="Avatar" 
          className="w-32 h-32 rounded border-2 border-zinc-800 p-1 relative z-10"
        />
        <div className="text-center md:text-left flex-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-mono mb-2">Physicist Profile</p>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight italic serif font-serif">{profile?.displayName}</h1>
          <p className="text-zinc-500 font-mono text-xs">{user.email}</p>
          
          <div className="flex gap-4 mt-8 flex-wrap justify-center md:justify-start">
            <div className="bg-zinc-900 px-6 py-3 rounded border border-zinc-800 flex items-center gap-3">
              <Trophy className="text-zinc-100" size={18} />
              <div className="text-left leading-tight">
                <span className="block text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Rank</span>
                <span className="block text-sm font-bold text-white uppercase italic tracking-tighter">Undergraduate</span>
              </div>
            </div>
            <div className="bg-zinc-900 px-6 py-3 rounded border border-zinc-800 flex items-center gap-3">
              <CheckCircle className="text-zinc-100" size={18} />
              <div className="text-left leading-tight">
                <span className="block text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Mastery</span>
                <span className="block text-sm font-bold text-white uppercase italic tracking-tighter">{profile?.solvedCount || 0} Problems</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors uppercase font-mono text-[10px] tracking-widest"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Progress Section */}
      <h2 className="text-2xl font-bold text-white mb-12 uppercase tracking-tight flex items-center gap-4">
        <span className="w-12 h-px bg-zinc-800"></span> Library Progress
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CORE_BOOKS.map((book) => {
          const solvedInBook = Object.keys(profile?.progress || {}).filter(k => k.startsWith(book.id)).length;
          // Dummy total problems for progress bar visualization
          const totalProblems = 200; 
          const progressPercent = Math.min((solvedInBook / totalProblems) * 100, 100);

          return (
            <div key={book.id} className="bg-zinc-900/50 p-8 rounded border border-zinc-900 group hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:italic transition-all">{book.title}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-widest">{book.author}</p>
                </div>
                <Book className="text-zinc-800 group-hover:text-zinc-100 transition-colors" size={24} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono text-zinc-500 mb-2">
                  <span>Progress</span>
                  <span className="text-zinc-300">{solvedInBook} / {totalProblems}</span>
                </div>
                <div className="h-1 bg-black rounded-full overflow-hidden border border-zinc-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-zinc-100"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievments placeholder */}
      <div className="mt-24 bg-zinc-900/20 p-12 rounded border border-zinc-900 border-dashed text-center">
        <Sparkles className="mx-auto text-zinc-800 mb-4" size={32} />
        <h4 className="text-zinc-100 font-bold mb-2 uppercase tracking-tighter">Physics Fellowships</h4>
        <p className="text-zinc-500 text-sm italic font-serif mb-8">Earn badges and reputation by contributing highly-rated solutions to the community.</p>
        
        <button 
          onClick={handleSeed}
          disabled={seeding}
          className="text-[10px] font-mono tracking-widest uppercase py-2 px-4 border border-zinc-800 rounded hover:bg-zinc-900 transition-colors disabled:opacity-50"
        >
          {seeding ? "Indexing..." : "Seed Library Data"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
