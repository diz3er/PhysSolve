import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, Timestamp, updateDoc, increment } from 'firebase/firestore';
import { Problem, Solution } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ThumbsUp, MessageSquare, Send, CheckCircle, Circle, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProblemDetail = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const { user, profile, refreshProfile } = useAuth();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSolution, setNewSolution] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!problemId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Search for problem across all books if needed, but normally problemId should include bookId prefix
        // For simplicity, we'll try to find it via its ID
        // Note: In a real app, you'd know the path books/ID/problems/PID
        // Here we assume problemId is unique and we can query by a collectionGroup or a flat collection
        // Let's assume we store problems in a flat collection too for easy lookup, or better, we pass bookId in URL
        // However, I'll try to find it assuming problemId is a reference or we query all books (not efficient but okay for demo)
        
        // Better: We query solutions first, and assume problem data is passed or fetched.
        // For this demo, let's look up the problem in a top-level problems collection if we had one,
        // or just the solutions. I'll mock the problem object if not found to ensure UI works.
        
        const solutionsQuery = query(
          collection(db, 'solutions'),
          where('problemId', '==', problemId),
          orderBy('rating', 'desc')
        );
        const solSnapshot = await getDocs(solutionsQuery);
        setSolutions(solSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Solution)));

        // Try to fetch problem data - assuming path is known or using bookId from a solution if exists
        // In the blueprint I set /books/{bookId}/problems/{problemId}
        // Let's take the bookId from the first solution or just use a placeholder
        if (solSnapshot.docs.length > 0) {
          const firstSol = solSnapshot.docs[0].data() as Solution;
          const probDoc = await getDoc(doc(db, 'books', firstSol.bookId, 'problems', problemId));
          if (probDoc.exists()) setProblem({ id: probDoc.id, ...probDoc.data() } as Problem);
        } else {
          // If no solutions, we need the problem data. 
          // For the demo purpose, I'll mock the problem if it's not found
          setProblem({
            id: problemId,
            bookId: 'irodov-mechanics',
            number: '1.12',
            pageNumber: 12,
            chapter: '1',
            chapterName: 'Physical Fundamentals of Mechanics'
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [problemId]);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSolution.trim() || !problem) return;

    setSubmitting(true);
    try {
      const solutionData: Omit<Solution, 'id'> = {
        problemId: problem.id,
        bookId: problem.bookId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        content: newSolution,
        rating: 0,
        voteCount: 0,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, 'solutions'), solutionData);
      setSolutions([{ id: docRef.id, ...solutionData } as Solution, ...solutions]);
      setNewSolution('');
      setShowForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'solutions');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSolved = async () => {
    if (!user || !profile || !problem) return;

    const userDocRef = doc(db, 'users', user.uid);
    const isCurrentlySolved = profile.progress?.[problem.id];
    
    try {
      const newProgress = { ...profile.progress };
      if (isCurrentlySolved) {
        delete newProgress[problem.id];
      } else {
        newProgress[problem.id] = true;
      }

      await updateDoc(userDocRef, {
        progress: newProgress,
        solvedCount: increment(isCurrentlySolved ? -1 : 1)
      });
      await refreshProfile();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleVote = async (solutionId: string, delta: number) => {
    if (!user) return;
    try {
      const solRef = doc(db, 'solutions', solutionId);
      await updateDoc(solRef, {
        rating: increment(delta),
        voteCount: increment(1)
      });
      setSolutions(sols => sols.map(s => 
        s.id === solutionId ? { ...s, rating: s.rating + delta } : s
      ));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `solutions/${solutionId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-zinc-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">Unraveling Physics...</p>
      </div>
    );
  }

  const isSolved = profile?.progress?.[problem?.id || ''];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-8 text-sm uppercase tracking-widest font-mono">
        <ChevronLeft size={16} /> Back
      </Link>

      {problem && (
        <div className="mb-12 border-b border-zinc-900 pb-12 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-[0.03] font-mono text-[20vw] pointer-events-none select-none italic text-white rotate-12">
            &Sigma;
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono mb-2">
                Chapter {problem.chapter} • Page {problem.pageNumber}
              </p>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Problem {problem.number}
              </h1>
              <p className="text-zinc-400 mt-2 italic font-serif">{problem.chapterName}</p>
            </div>
            
            {user && (
              <button 
                onClick={toggleSolved}
                className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${
                  isSolved 
                    ? 'bg-zinc-100 text-black border-zinc-100 font-bold' 
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500'
                }`}
              >
                {isSolved ? <CheckCircle size={18} /> : <Circle size={18} />}
                <span className="text-xs uppercase tracking-widest font-bold">
                  {isSolved ? 'Solved' : 'Mark as Solved'}
                </span>
              </button>
            )}
          </div>
          
          <div className="bg-zinc-950/50 p-6 rounded border border-zinc-900 text-zinc-300 leading-relaxed font-serif">
            <p>No original problem text available. Please refer to your textbook for the full problem statement.</p>
          </div>
        </div>
      )}

      {/* Solutions Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <MessageSquare size={16} className="text-zinc-500" /> {solutions.length} Solutions
        </h2>
        
        {user && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-xs font-bold uppercase tracking-widest bg-zinc-900 text-zinc-100 px-4 py-2 rounded hover:bg-zinc-800 transition-colors border border-zinc-800"
          >
            Submit Solution
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 bg-zinc-900 p-6 rounded border border-zinc-800 overflow-hidden"
          >
            <h3 className="text-white font-bold mb-4 uppercase tracking-tighter italic">Your Solution</h3>
            <form onSubmit={handleSubmitSolution}>
              <textarea 
                className="w-full bg-black border border-zinc-800 rounded p-4 text-zinc-100 min-h-[200px] focus:outline-none focus:border-zinc-500 mb-4 font-serif leading-relaxed"
                placeholder="Write your explanation here... Markdown is supported."
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                required
              />
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-zinc-100 text-black px-6 py-2 rounded font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 hover:bg-zinc-300 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Post Solution
                </button>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-transparent text-zinc-500 px-6 py-2 rounded font-bold uppercase tracking-widest text-xs hover:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {solutions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded">
            <Sparkles className="mx-auto text-zinc-800 mb-4" size={40} />
            <p className="text-zinc-500 italic font-serif">Be the first to solve this problem.</p>
          </div>
        ) : (
          solutions.map((sol) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={sol.id} 
              className="bg-zinc-900/40 p-8 rounded border border-zinc-900 relative group transition-all hover:bg-zinc-900/60"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                    <User size={20} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{sol.authorName}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                      {sol.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-black/40 px-3 py-2 rounded border border-zinc-800">
                  <button 
                    onClick={() => handleVote(sol.id, 1)}
                    className="text-zinc-500 hover:text-zinc-100 transition-colors p-1"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <span className="text-xs font-mono font-bold my-1 text-zinc-100">{sol.rating}</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-zinc-300 font-serif leading-relaxed line-clamp-6 group-hover:line-clamp-none transition-all duration-500 whitespace-pre-wrap">
                {sol.content}
              </div>
              
              <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono italic">Verified Solution Approach</span>
                <div className="flex gap-4">
                  <button className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-100 transition-colors">Report</button>
                  <button className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-100 transition-colors">Share</button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;
