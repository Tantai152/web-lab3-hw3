// src/data/pubgArenaData.js

export const AIRDROP_CRATES = [
  {
    id: 'crate-vip',
    name: 'PVS Finals VIP Pass',
    price: 500000,
    stock: 5,
  },
  {
    id: 'crate-coin',
    name: '5,000 G-Coin',
    price: 150000,
    stock: 3,
  },
];

export const PUBG_VN_STANDINGS = [
  {
    id: 'te',
    name: 'The Expendables',
    wwcd: 4,
    placementPts: 45,
    killPts: 62,
  },
  {
    id: 'ces',
    name: 'Cerberus Esports',
    wwcd: 3,
    placementPts: 38,
    killPts: 55,
  },
  {
    id: 'ge',
    name: 'Genius Esports',
    wwcd: 2,
    placementPts: 30,
    killPts: 41,
  },
  {
    id: 'agg',
    name: 'Aggressive',
    wwcd: 1,
    placementPts: 20,
    killPts: 35,
  },
];

/**
 * Mock API claim airdrop crate.
 * Supports AbortSignal to cancel pending requests.
 *
 * @param {string} crateId
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function mockClaimCrate(crateId, { signal } = {}) {
  // Reject immediately if the request was already aborted.
  if (signal?.aborted) {
    throw new DOMException('Request aborted', 'AbortError');
  }

  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, 800);

    const handleAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Request aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
  });

  // Simulate a 30% chance of HTTP 409 Conflict (out of stock),
  // allowing the UI to roll back optimistic stock or claim updates.
  if (Math.random() < 0.3) {
    throw new Error('409 Conflict: Out of stock');
  }

  return {
    success: true,
    message: 'Claim successful',
  };
}

/**
 * Format a numeric amount as Vietnamese currency (VND).
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
