import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { reloadFromStorage } from '../store/store';

beforeEach(() => {
  localStorage.clear();
  reloadFromStorage();
  window.location.hash = '#/';
});

afterEach(() => {
  cleanup();
});

// jsdom lacks scrollTo
window.scrollTo = (() => {}) as typeof window.scrollTo;
