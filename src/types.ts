export type CategoryId =
  | 'programming'
  | 'database'
  | 'networking'
  | 'math'
  | 'ai'
  | 'se'
  | 'business'
  | 'design';

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
}

export interface Creator {
  id: string;
  name: string;
  university: string;
  program: string;
  semester: number;
}

export type Block =
  | { t: 'h'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'code'; lang: string; code: string }
  | { t: 'math'; lines: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'flow'; steps: string[]; vertical?: boolean; caption?: string }
  | { t: 'tree'; levels: string[][]; caption?: string }
  | { t: 'callout'; title: string; text: string; tone: 'coral' | 'mint' | 'sun' };

export interface DocPage {
  title: string;
  blocks: Block[];
}

export type Access = 'free' | 'pass';

export type ListingStatus = 'Active' | 'Pending review' | 'Draft';

export interface Note {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  category: CategoryId;
  university: string;
  semester: number;
  term: string;
  creatorId: string;
  pages: number;
  format: 'PDF';
  access: Access;
  rating: number; // 0 = no reviews yet
  reviewCount: number;
  downloads: number;
  weeklyDownloads: number;
  publishedAt: string; // ISO date
  palette: number;
  description: string;
  topics: string[];
  keywords: string[];
  preview: DocPage[];
  /** How many preview pages anyone can read before owning the note. */
  openPages: number;
  /** Set for notes created by the current user in this browser. */
  listingStatus?: ListingStatus;
}

export type LibraryKind = 'seeded' | 'free' | 'pass';

export interface LibraryEntry {
  noteId: string;
  kind: LibraryKind;
  acquiredAt: string;
  orderId?: string;
}

export interface RecentEntry {
  noteId: string;
  openedAt: string;
  lastPage: number; // 0-based
}

export interface Order {
  id: string;
  plan: 'pass';
  /** The note the subscriber was unlocking when they paid, if any. */
  noteId?: string;
  price: number;
  serviceFee: number;
  total: number;
  method: string;
  createdAt: string;
}

export interface Subscription {
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  orderId: string;
}

export interface UserListing {
  id: string;
  status: Exclude<ListingStatus, 'Active'>;
  title: string;
  university: string;
  courseName: string;
  courseCode: string;
  semester: number;
  category: CategoryId;
  description: string;
  topics: string[];
  pages: number;
  fileName: string;
  fileSize: number;
  palette: number;
  access: Access;
  createdAt: string;
  updatedAt: string;
}

export interface SellDraft {
  editingId?: string;
  step: number; // 0..3
  title: string;
  university: string;
  courseName: string;
  courseCode: string;
  semester: string;
  category: string;
  description: string;
  topics: string[];
  pages: string;
  file: { name: string; size: number } | null;
  palette: number;
  access: Access;
  rights: boolean;
}

export interface Profile {
  name: string;
  university: string;
  program: string;
  semester: number;
}

export interface AppState {
  v: number;
  library: LibraryEntry[];
  bookmarks: string[];
  recent: RecentEntry[];
  orders: Order[];
  subscription: Subscription | null;
  listings: UserListing[];
  draft: SellDraft | null;
  profile: Profile;
}
