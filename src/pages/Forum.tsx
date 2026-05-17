import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { ForumThread } from '../types';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Plus, User, Clock, ChevronRight, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const Forum = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const q = query(collection(db, 'forumThreads'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setThreads(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumThread)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'forumThreads');
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const threadData: Omit<ForumThread, 'id'> = {
        title: newTitle,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: Timestamp.now(),
        tags: [],
        replyCount: 0,
      };
      
      const threadDoc = await addDoc(collection(db, 'forumThreads'), threadData);
      
      // Also add the first post
      await addDoc(collection(db, 'forumThreads', threadDoc.id, 'posts'), {
        threadId: threadDoc.id,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        content: newContent,
        createdAt: Timestamp.now(),
      });

      setThreads([{ id: threadDoc.id, ...threadData } as ForumThread, ...threads]);
      setNewTitle('');
      setNewContent('');
      setShowCreate(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'forumThreads');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formulas = [
    "E = h\u03BD", "\u2207 \u00B7 E = \u03C1/\u03B5\u2080", "pV = nRT", 
    "S = k ln W", "F = dp/dt", "L = I\u03C9", 
    "e^{i\u03C0} + 1 = 0", "R_{\u03BC\u03BD} - 1/2 Rg_{\u03BC\u03BD} = 8\u03C0GT_{\u03BC\u03BD}"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative overflow-hidden">
      {/* Floating Formulas Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {formulas.map((f, i) => (
          <motion.div
            key={i}
            initial={{ 
              left: `${(i * (100 / formulas.length)) + Math.random() * 10}%`, 
              top: `${110 + Math.random() * 20}%`,
              opacity: 0.03
            }}
            animate={{ 
              top: `${-20 - Math.random() * 20}%`,
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [0.03, 0.08, 0.03]
            }}
            transition={{ 
              duration: 25 + Math.random() * 25, 
              repeat: Infinity, 
              delay: i * 1.5,
              ease: "linear"
            }}
            className="absolute font-mono text-xl md:text-5xl whitespace-nowrap text-white italic select-none"
          >
            {f}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-zinc-900 pb-8">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-mono mb-2">Discussion</p>
          <h1 className="text-4xl font-bold text-white tracking-tight">Theory & Practice</h1>
          <p className="text-zinc-500 mt-2 text-sm italic font-serif">A place to discuss physics, textbooks, and edge cases.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded py-2 pl-9 pr-4 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {user && (
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="whitespace-nowrap bg-zinc-100 text-black px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-300 transition-colors flex items-center gap-2"
            >
              <Plus size={14} /> New Topic
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-12 bg-zinc-900/50 p-8 rounded border border-zinc-800 border-dashed"
          >
            <h2 className="text-xl font-bold text-white mb-6 italic serif font-serif">Start a new discussion</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2">Topic Title</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Problems with Irodov 1.45 logic..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2">Message</label>
                <textarea 
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-zinc-100 min-h-[150px] focus:outline-none focus:border-zinc-500"
                  placeholder="Describe your question or observation..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-zinc-100 text-black px-6 py-2 rounded text-xs font-bold uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <MessageSquare size={14} />}
                  Publish Topic
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-zinc-500 hover:text-zinc-100 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Discard
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-zinc-500" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-500">Loading synchronised thoughts...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-20 text-center italic font-serif text-zinc-500">
            The silence is deafening. Start a conversation.
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <Link 
              key={thread.id} 
              to={`/forum/${thread.id}`}
              className="flex items-center gap-6 p-6 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="hidden sm:flex flex-col items-center justify-center bg-black/40 w-16 h-16 rounded border border-zinc-800/50">
                <MessageSquare className="text-zinc-600 group-hover:text-zinc-300" size={18} />
                <span className="text-[10px] font-mono font-bold mt-1 text-zinc-400">{thread.replyCount}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors mb-2 leading-snug">
                  {thread.title}
                </h3>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-mono text-zinc-500">
                  <span className="flex items-center gap-1"><User size={12} /> {thread.authorName}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {thread.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                </div>
              </div>
              
              <ChevronRight className="text-zinc-800 group-hover:text-zinc-100 group-hover:translate-x-1 transition-all" size={20} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;
