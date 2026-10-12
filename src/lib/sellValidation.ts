import { MAX_PDF_BYTES, MAX_PDF_MB } from '../config';
import { formatBytes } from './format';
import type { SellDraft } from '../types';

export const emptyDraft = (): SellDraft => ({
  step: 0,
  title: '',
  university: '',
  courseName: '',
  courseCode: '',
  semester: '',
  category: '',
  description: '',
  topics: [],
  pages: '',
  file: null,
  palette: 0,
  access: 'pass',
  rights: false,
});

export type Errors = Record<string, string>;

export function validateStep(step: number, d: SellDraft): Errors {
  const e: Errors = {};
  if (step === 0) {
    const t = d.title.trim();
    if (t.length < 8) e.title = 'Give your note a descriptive title (at least 8 characters).';
    else if (t.length > 100) e.title = 'Keep the title under 100 characters.';
    if (!d.university) e.university = 'Choose your university.';
    if (d.courseName.trim().length < 3) e.courseName = 'Enter the course name, e.g. Database Systems.';
    if (!/^[A-Za-z]{2,5}\d{3,5}$/.test(d.courseCode.trim().replace(/\s+/g, ''))) e.courseCode = 'Use a course code like COMP6799 (letters, then digits).';
    if (!d.semester) e.semester = 'Choose the semester you took the course.';
    if (!d.category) e.category = 'Choose a subject category.';
  }
  if (step === 1) {
    const len = d.description.trim().length;
    if (len < 40) e.description = `Describe what is inside (at least 40 characters, you have ${len}).`;
    else if (len > 600) e.description = 'Keep the description under 600 characters.';
    if (d.topics.length < 3) e.topics = 'Add at least 3 topics so students can find your note.';
    const pages = Number(d.pages);
    if (!Number.isInteger(pages) || pages < 1 || pages > 500) e.pages = 'Enter the number of pages (1 to 500).';
    if (!d.file) e.file = 'Choose the PDF you want to list.';
  }
  if (step === 2) {
    if (!d.rights) e.rights = 'Please confirm you have the right to distribute these notes.';
  }
  return e;
}

export function firstInvalidStep(d: SellDraft): number {
  for (let s = 0; s < 3; s++) if (Object.keys(validateStep(s, d)).length) return s;
  return -1;
}

export function checkPdf(file: { name: string; type: string; size: number }): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Only PDF files are accepted. Export your notes as a PDF and try again.';
  if (file.size === 0) return 'That file is empty.';
  if (file.size > MAX_PDF_BYTES) return `That file is ${formatBytes(file.size)}. The limit is ${MAX_PDF_MB} MB.`;
  return null;
}
