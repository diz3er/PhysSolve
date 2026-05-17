import { Book } from './types';

export const CORE_BOOKS: Book[] = [
  {
    id: 'irodov-mechanics',
    title: 'Problems in General Physics - Mechanics',
    author: 'I.E. Irodov',
    slug: 'irodov-mechanics',
    description: 'The fundamental mechanics problems from Irodov.',
    category: 'Mechanics'
  },
  {
    id: 'irodov-electromagnetism',
    title: 'Problems in General Physics - Electromagnetism',
    author: 'I.E. Irodov',
    slug: 'irodov-electromagnetism',
    description: 'Classic electromagnetism problems.',
    category: 'Electromagnetism'
  },
  {
    id: 'morin-classical-mechanics',
    title: 'Introduction to Classical Mechanics',
    author: 'David Morin',
    slug: 'morin-classical-mechanics',
    description: 'With Problems and Solutions.',
    category: 'Mechanics'
  }
];
