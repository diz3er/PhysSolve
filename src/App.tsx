import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Book, Search, MessageSquare, User, Layout, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { signInWithGoogle, auth } from './lib/firebase';

// Pages (to be implemented)
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import ProblemDetail from './pages/ProblemDetail';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import ForumThreadDetail from './pages/ForumThreadDetail';
import { PhysicsBackground } from './components/PhysicsBackground';

const Navbar = () => {
  const { user, profile } = useAuth();

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="font-mono font-bold text-black text-xl">Φ</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-zinc-100">PhysSolve</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link to="/" className="hover:text-zinc-100 transition-colors">Library</Link>
          <Link to="/forum" className="hover:text-zinc-100 transition-colors">Forum</Link>
          <Link to="/profile" className="hover:text-zinc-100 transition-colors">Progress</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-zinc-100 leading-none">{profile?.displayName}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">
                  {profile?.solvedCount || 0} SOLVED
                </p>
              </div>
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                alt="Profile" 
                className="w-8 h-8 rounded border border-zinc-800 group-hover:border-zinc-400 transition-colors"
              />
            </Link>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="bg-zinc-100 text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-zinc-300 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="border-t border-zinc-800 py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <h3 className="text-zinc-100 font-bold mb-4">PhysSolve</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          The ultimate platform for physicists. Dedicated to providing free, high-quality solutions to classical and modern physics problems.
        </p>
      </div>
      <div>
        <h4 className="text-zinc-100 font-bold mb-4 text-xs uppercase tracking-widest">Library</h4>
        <ul className="text-zinc-500 text-sm space-y-2">
          <li><Link to="/book/irodov-mechanics" className="hover:text-zinc-300">Irodov - Mechanics</Link></li>
          <li><Link to="/book/irodov-electromagnetism" className="hover:text-zinc-300">Irodov - Electromagnetism</Link></li>
          <li><Link to="/book/morin-classical-mechanics" className="hover:text-zinc-300">David Morin - Classical Mechanics</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-zinc-100 font-bold mb-4 text-xs uppercase tracking-widest">Connect</h4>
        <ul className="text-zinc-500 text-sm space-y-2">
          <li><Link to="/forum" className="hover:text-zinc-300">Discussion Forum</Link></li>
          <li><a href="#" className="hover:text-zinc-300">Contribute Solutions</a></li>
          <li><a href="#" className="hover:text-zinc-300">About the Project</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
      <p>© 2026 PhysSolve. For science.</p>
      <div className="flex gap-4">
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </div>
  </footer>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/book/:bookSlug" element={<PageWrapper><BookDetail /></PageWrapper>} />
        <Route path="/problem/:problemId" element={<PageWrapper><ProblemDetail /></PageWrapper>} />
        <Route path="/forum" element={<PageWrapper><Forum /></PageWrapper>} />
        <Route path="/forum/:threadId" element={<PageWrapper><ForumThreadDetail /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="relative min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-100 selection:text-black">
          <PhysicsBackground />
          <ScrollToTop />
          <div className="relative z-10">
            <Navbar />
            <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}
