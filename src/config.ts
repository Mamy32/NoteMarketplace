/**
 * BombaNotes — single source of truth for business rules.
 * Change a value here and every screen (subscribe, sell, dashboard, copy) updates.
 */
export const BRAND = {
  name: 'BombaNotes',
  tagline: 'Your campus knowledge, all in one place.',
};

/** BombaNotes Pass: one subscription that unlocks reading and downloading of every Pass note. */
export const PASS_NAME = 'BombaNotes Pass';
export const PASS_PRICE = 15000; // Rp per month
export const PASS_DAYS = 30;

/** Share of Pass revenue kept by BombaNotes. The rest goes to the creator pool. */
export const COMMISSION_RATE = 0.15;
export const COMMISSION_PERCENT = Math.round(COMMISSION_RATE * 100);
export const CREATOR_PERCENT = 100 - COMMISSION_PERCENT;

/** Extra fee charged to the subscriber on top of the Pass price. Zero by design: no hidden fees. */
export const BUYER_SERVICE_FEE = 0;

/**
 * Illustrative assumption used to turn the creator pool into a per-download estimate:
 * a subscriber is assumed to download this many Pass notes per month.
 */
export const EST_PASS_DOWNLOADS_PER_SUBSCRIBER = 5;

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_MB = 10;

export const CURRENT_TERM = '2026/27 Odd';

export interface PassSplit {
  price: number;
  commission: number;
  creatorPool: number;
  perDownload: number;
}

export function passSplit(): PassSplit {
  const commission = Math.round(PASS_PRICE * COMMISSION_RATE);
  const creatorPool = PASS_PRICE - commission;
  return { price: PASS_PRICE, commission, creatorPool, perDownload: Math.round(creatorPool / EST_PASS_DOWNLOADS_PER_SUBSCRIBER) };
}

export const PER_DOWNLOAD_PAYOUT = passSplit().perDownload;
