import type { Block, Category, Creator, DocPage } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'programming', name: 'Programming', blurb: 'Python, Java, web and data structures' },
  { id: 'database', name: 'Database Systems', blurb: 'SQL, normalization, transactions' },
  { id: 'networking', name: 'Networking', blurb: 'TCP/IP, routing, subnetting' },
  { id: 'math', name: 'Mathematics', blurb: 'Discrete math, linear algebra, statistics' },
  { id: 'ai', name: 'Artificial Intelligence', blurb: 'Machine learning and search' },
  { id: 'se', name: 'Software Engineering', blurb: 'UML, Agile, testing' },
  { id: 'business', name: 'Business', blurb: 'Entrepreneurship and information systems' },
  { id: 'design', name: 'UI/UX Design', blurb: 'HCI, wireframing, usability' },
];

export const UNIVERSITIES = [
  'BINUS University',
  'Universitas Indonesia',
  'Institut Teknologi Bandung',
  'Universitas Gadjah Mada',
  'Telkom University',
  'Universitas Multimedia Nusantara',
  'Universitas Brawijaya',
];

export const ME_ID = 'me';

export const CREATORS: Creator[] = [
  { id: ME_ID, name: 'Nadia Pramesti', university: 'BINUS University', program: 'Computer Science', semester: 5 },
  { id: 'c-alya', name: 'Alya Pratiwi', university: 'BINUS University', program: 'Computer Science', semester: 5 },
  { id: 'c-rizky', name: 'Rizky Maulana', university: 'Universitas Indonesia', program: 'Computer Science', semester: 6 },
  { id: 'c-dewi', name: 'Dewi Kartika', university: 'BINUS University', program: 'Information Systems', semester: 5 },
  { id: 'c-bagas', name: 'Bagas Santoso', university: 'Institut Teknologi Bandung', program: 'Informatics', semester: 7 },
  { id: 'c-farhan', name: 'Farhan Alfarizi', university: 'Universitas Gadjah Mada', program: 'Computer Science', semester: 5 },
  { id: 'c-kevin', name: 'Kevin Tanuwijaya', university: 'BINUS University', program: 'Computer Science (AI)', semester: 7 },
  { id: 'c-sinta', name: 'Sinta Maharani', university: 'Universitas Multimedia Nusantara', program: 'Informatics', semester: 6 },
  { id: 'c-yoga', name: 'Yoga Pradipta', university: 'Universitas Brawijaya', program: 'Computer Science', semester: 6 },
  { id: 'c-michael', name: 'Michael Hartono', university: 'BINUS University', program: 'Computer Science', semester: 4 },
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function creatorById(id: string): Creator | undefined {
  return CREATORS.find((c) => c.id === id);
}

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

// ---- tiny builders used by the note data files ----
export const H = (text: string): Block => ({ t: 'h', text });
export const P = (text: string): Block => ({ t: 'p', text });
export const UL = (...items: string[]): Block => ({ t: 'ul', items });
export const CODE = (lang: string, code: string): Block => ({ t: 'code', lang, code: code.replace(/^\n/, '').replace(/\s+$/, '') });
export const MATH = (...lines: string[]): Block => ({ t: 'math', lines });
export const TABLE = (head: string[], ...rows: string[][]): Block => ({ t: 'table', head, rows });
export const FLOW = (steps: string[], caption?: string, vertical = false): Block => ({ t: 'flow', steps, caption, vertical });
export const TREE = (levels: string[][], caption?: string): Block => ({ t: 'tree', levels, caption });
export const TIP = (title: string, text: string, tone: 'coral' | 'mint' | 'sun' = 'mint'): Block => ({ t: 'callout', title, text, tone });
export const PAGE = (title: string, ...blocks: Block[]): DocPage => ({ title, blocks });
