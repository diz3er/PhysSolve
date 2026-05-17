import React, { useState } from 'react';
import { CORE_BOOKS } from '../constants';
import { motion, useScroll, useTransform } from 'motion/react';
import { BookOpen, Search, ArrowRight, TrendingUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = CORE_BOOKS.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full min-h-screen">
      {/* Galaxy Background (Static) - Full screen width */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2111&auto=format&fit=crop" 
          alt="Galaxy"
          className="w-full h-full object-cover opacity-60 mix-blend-screen scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
        {/* Hero */}
      <section className="mb-24 relative">
        <div className="absolute -top-20 -left-20 opacity-10 select-none pointer-events-none font-mono text-xl space-y-4">
          <p>E = mc²</p>
          <p>∇ × E = -∂B/∂t</p>
          <p>F = G(m₁m₂)/r²</p>
          <p>iℏ ∂/∂t Ψ = Ĥ Ψ</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl relative z-10"
        >
          <div className="flex items-center gap-3 mb-6 bg-zinc-900/50 w-fit px-3 py-1 rounded-full border border-zinc-800">
            <span className="w-2 h-2 bg-zinc-100 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">Experimental Access Beta</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-bold tracking-tight text-white mb-6 leading-[0.8] font-serif italic">
            Solve the <span className="text-zinc-500">Unsolvable.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-serif">
            A collaborative repository for theoretical and experimental physics. Find step-by-step blueprints for the physical world.
          </p>

          <div className="relative group max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-100 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search for a problem or book..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-4 pl-12 pr-4 text-zinc-100 focus:outline-none focus:border-zinc-400 transition-all font-mono text-sm uppercase tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
      </section>

      {/* Grid */}
      <section className="mb-32">
        <div className="flex items-end justify-between mb-12 border-b border-zinc-900 pb-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-2">Collection</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Core Library</h2>
          </div>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">{filteredBooks.length} ITEMS</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/book/${book.slug}`} className="group relative block aspect-[3/4] bg-black/40 overflow-hidden hover:bg-zinc-950 transition-colors">
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-px bg-zinc-700" />
                      <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-mono">{book.category}</p>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight leading-tight mb-2 serif font-serif italic">
                      {book.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-4 h-4 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center">
                          <User size={6} className="text-zinc-600" />
                        </div>
                      ))}
                    </div>
                    <ArrowRight size={16} className="text-zinc-700 group-hover:text-zinc-100 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
                
                {/* Background Decor: Orbitals */}
                <div className="absolute inset-0 z-10 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity duration-700">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-zinc-100 rounded-full scale-110 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-zinc-100 rounded-full scale-100 group-hover:rotate-180 transition-all duration-1000" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats/Info */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-zinc-900 pt-20">
        <div className="space-y-4">
          <TrendingUp className="text-zinc-500" size={24} />
          <h4 className="font-bold text-white text-lg">Active Community</h4>
          <p className="text-zinc-500 text-sm leading-relaxed">Join thousands of students and educators contributing to the world's largest physics repository.</p>
        </div>
        <div className="space-y-4">
          <BookOpen className="text-zinc-500" size={24} />
          <h4 className="font-bold text-white text-lg">Vetted Solutions</h4>
          <p className="text-zinc-500 text-sm leading-relaxed">Each solution is Peer-reviewed and rated based on clarity, accuracy, and depth of explanation.</p>
        </div>
        <div className="col-span-1 md:col-span-2 bg-zinc-900/40 p-8 rounded border border-zinc-800/50">
          <h4 className="text-zinc-100 font-bold mb-4">Request a Book</h4>
          <p className="text-zinc-500 text-sm mb-6">Don't see your textbook? Submit a request to the forum and our community will start populating solutions.</p>
          <Link to="/forum" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-100 hover:gap-4 transition-all">
            Join the Discussion <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  </div>
  );
};

export default Home;
