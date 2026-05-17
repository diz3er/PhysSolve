export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  solvedCount: number;
  progress: Record<string, boolean>; // problemId -> isSolved
}

export interface Book {
  id: string;
  title: string;
  author: string;
  slug: string;
  description: string;
  category: string;
  coverImage?: string;
}

export interface Problem {
  id: string;
  bookId: string;
  number: string;
  pageNumber: number;
  chapter: string;
  chapterName: string;
}

export interface Solution {
  id: string;
  problemId: string;
  bookId: string;
  authorId: string;
  authorName: string;
  content: string;
  rating: number;
  voteCount: number;
  createdAt: any; // Firestore Timestamp
}

export interface ForumThread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  tags: string[];
  replyCount: number;
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: any;
}
