import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, Timestamp, increment, updateDoc } from 'firebase/firestore';
import { ForumThread, ForumPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Send, User, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const ForumThreadDetail = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!threadId) return;

    const fetchData = async () => {
      try {
        const threadDoc = await getDoc(doc(db, 'forumThreads', threadId));
        if (threadDoc.exists()) {
          setThread({ id: threadDoc.id, ...threadDoc.data() } as ForumThread);
          
          const postsQuery = query(collection(db, 'forumThreads', threadId, 'posts'), orderBy('createdAt', 'asc'));
          const postsSnapshot = await getDocs(postsQuery);
          setPosts(postsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumPost)));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `forumThreads/${threadId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [threadId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReply.trim() || !threadId) return;

    setSubmitting(true);
    try {
      const postData: Omit<ForumPost, 'id'> = {
        threadId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhoto: user.photoURL || undefined,
        content: newReply,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'forumThreads', threadId, 'posts'), postData);
      
      // Update reply count
      await updateDoc(doc(db, 'forumThreads', threadId), {
        replyCount: increment(1)
      });

      setPosts([...posts, { id: docRef.id, ...postData } as ForumPost]);
      setNewReply('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `forumThreads/${threadId}/posts`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-zinc-500" />
      <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">Connecting to Theory Hub...</p>
    </div>
  );

  if (!thread) return <div className="p-20 text-center">Topic not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/forum" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-8 text-sm uppercase tracking-widest font-mono">
        <ChevronLeft size={16} /> Back to Forum
      </Link>

      <div className="mb-12">
        <p className="text-zinc-500 uppercase tracking-[0.2em] font-mono text-[10px] mb-2">Discussion Topic</p>
        <h1 className="text-4xl font-bold text-white tracking-tight italic serif font-serif leading-tight">{thread.title}</h1>
        <div className="flex items-center gap-4 mt-4 text-[10px] uppercase tracking-widest font-mono text-zinc-500">
          <span className="flex items-center gap-1"><User size={12} /> {thread.authorName}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {thread.createdAt?.toDate?.()?.toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><MessageSquare size={12} /> {thread.replyCount} Replies</span>
        </div>
      </div>

      <div className="space-y-6 mb-16">
        {posts.map((post, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={post.id} 
            className={`p-8 rounded border ${idx === 0 ? 'bg-zinc-900 border-zinc-700' : 'bg-transparent border-zinc-900'}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                {post.authorPhoto ? <img src={post.authorPhoto} className="rounded" /> : <User size={20} className="text-zinc-600" />}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-100">{post.authorName}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  {post.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                </p>
              </div>
            </div>
            <div className="prose prose-invert max-w-none text-zinc-300 font-serif leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </motion.div>
        ))}
      </div>

      {user ? (
        <div className="bg-zinc-950 p-8 rounded border border-zinc-900">
          <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Share your thoughts</h3>
          <form onSubmit={handleReply}>
            <textarea 
              className="w-full bg-black border border-zinc-800 rounded p-4 text-zinc-100 min-h-[150px] focus:outline-none focus:border-zinc-500 mb-6 font-serif leading-relaxed"
              placeholder="Join the collaboration..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-zinc-100 text-black px-8 py-3 rounded font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 hover:bg-zinc-300 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              Post Reply
            </button>
          </form>
        </div>
      ) : (
        <div className="p-8 text-center border border-zinc-900 rounded border-dashed">
          <p className="text-zinc-500 italic font-serif">Sign in to participate in the scientific community.</p>
        </div>
      )}
    </div>
  );
};

export default ForumThreadDetail;
