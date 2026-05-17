import { db } from './firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { CORE_BOOKS } from '../constants';
import { Problem } from '../types';

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  // 1. Seed Books
  for (const book of CORE_BOOKS) {
    const bookRef = doc(db, 'books', book.id);
    batch.set(bookRef, book);

    // 2. Seed some problems for each book
    const problems: Partial<Problem>[] = [
      { id: `${book.id}-1-1`, number: '1.1', pageNumber: 5, chapter: '1', chapterName: 'Fundamentals' },
      { id: `${book.id}-1-2`, number: '1.2', pageNumber: 7, chapter: '1', chapterName: 'Fundamentals' },
      { id: `${book.id}-1-3`, number: '1.3', pageNumber: 8, chapter: '1', chapterName: 'Fundamentals' },
      { id: `${book.id}-1-4`, number: '1.4', pageNumber: 12, chapter: '1', chapterName: 'Fundamentals' },
      { id: `${book.id}-2-1`, number: '2.1', pageNumber: 45, chapter: '2', chapterName: 'Advanced Topics' },
      { id: `${book.id}-2-2`, number: '2.2', pageNumber: 48, chapter: '2', chapterName: 'Advanced Topics' },
    ];

    for (const prob of problems) {
      const probRef = doc(db, 'books', book.id, 'problems', prob.id!);
      batch.set(probRef, { ...prob, bookId: book.id });
    }
  }

  await batch.commit();
  console.log("Database seeded successfully!");
};
