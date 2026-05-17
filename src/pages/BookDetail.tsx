import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CORE_BOOKS } from '../constants';
import { Book, Problem } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, CheckCircle, Circle, Search, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const BookDetail = () => {
  const { bookSlug } = useParams<{ bookSlug: string }>();
  const { profile } = useAuth();
  const book = CORE_BOOKS.find(b => b.slug === bookSlug);
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!book) return;

    const fetchProblems = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'books', book.id, 'problems'),
          orderBy('pageNumber', 'asc'),
          orderBy('number', 'asc')
        );
        const snapshot = await getDocs(q);
        const problemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Problem));
        setProblems(problemList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `books/${book.id}/problems`);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [book]);

  if (!book) {
    return <div className="p-20 text-center">Book not found.</div>;
  }

  const filteredProblems = problems.filter(p => 
    p.number.includes(searchQuery) || 
    p.chapterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by chapter
  const chapters = filteredProblems.reduce((acc, p) => {
    if (!acc[p.chapter]) {
      acc[p.chapter] = { name: p.chapterName, problems: [] };
    }
    acc[p.chapter].problems.push(p);
    return acc;
  }, {} as Record<string, { name: string, problems: Problem[] }>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-8 text-sm uppercase tracking-widest font-mono">
        <ChevronLeft size={16} /> Back to Library
      </Link>

      <div className="flex flex-col md:flex-row gap-12 items-start mb-20 relative">
        <div className="absolute -z-10 top-0 right-0 opacity-5 font-mono text-[12vw] pointer-events-none select-none italic text-white leading-none">
          {book.title.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-zinc-500 uppercase tracking-[0.3em] font-bold text-[10px] mb-2">{book.category}</p>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tighter leading-tight italic serif font-serif">
            {book.title}
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl">{book.description}</p>
          
          {profile && (
            <div className="inline-flex items-center gap-4 bg-zinc-900 px-6 py-4 rounded border border-zinc-800">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <CheckCircle className="text-zinc-100" size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Your Progress</p>
                <p className="text-zinc-100 font-bold">
                  {Object.keys(profile.progress || {}).filter(k => k.startsWith(book.id)).length} Problems Solved
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-80">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter problems..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded py-3 pl-12 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={32} />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading solutions guide...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-lg py-20 text-center">
            <p className="text-zinc-500 mb-4 italic font-serif">No problems indexed for this book yet.</p>
            <button className="text-xs font-bold uppercase tracking-widest bg-zinc-100 text-black px-6 py-3 rounded hover:bg-zinc-300">
              Contribute Initial Data
            </button>
          </div>
        ) : (
          Object.entries(chapters).map(([chapterId, data]) => (
            <section key={chapterId} className="border-t border-zinc-900 pt-8">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-600 uppercase">Chapter {chapterId}</span>
                <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">{data.name}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
                {data.problems.map((problem) => {
                  const isSolved = profile?.progress?.[problem.id];
                  return (
                    <motion.div whileHover={{ scale: 1.02 }} key={problem.id} className="relative z-10">
                      <Link 
                        to={`/problem/${problem.id}`} 
                        className={`block h-full p-6 transition-colors ${isSolved ? 'bg-zinc-900/50' : 'bg-black'} group`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-xs font-mono tracking-widest ${isSolved ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            #{problem.number}
                          </span>
                          {isSolved ? (
                            <CheckCircle size={16} className="text-zinc-100" />
                          ) : (
                            <Circle size={16} className="text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                          )}
                        </div>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 italic">Page {problem.pageNumber}</p>
                        <div className="flex items-center justify-between text-zinc-100 group-hover:text-white font-bold transition-all">
                          <span>View Solutions</span>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default BookDetail;
