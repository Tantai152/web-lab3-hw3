// src/components/AirdropArena.jsx

import { AIRDROP_CRATES, formatVnd } from '../data/pubgArenaData.js';
import { usePubgAirdropTimer } from '../hooks/usePubgAirdropTimer.js';
import { useAirdropClaim } from '../hooks/useAirdropClaim.js';
import styles from './AirdropArena.module.css';

// Set the target once so the deadline remains stable across renders.
const targetEpochMs = Date.now() + 1000 * 60 * 60;

// Format milliseconds into HH:MM:SS with zero-padding.
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value) => String(value).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function AirdropArena() {
  const { remainingMs, isLive } = usePubgAirdropTimer(targetEpochMs);

  const { crates, claimingId, error, claim } =
    useAirdropClaim(AIRDROP_CRATES);

  return (
    <section
      className={styles.container}
      aria-label="Airdrop Arena"
    >
      <header className={styles.header}>
        <h2>Airdrop Arena</h2>

        <p aria-live="polite">
          {isLive
            ? 'Airdrop is Live!'
            : `Time remaining: ${formatTime(remainingMs)}`}
        </p>
      </header>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <ul className={styles.crateList}>
        {crates.map((crate) => (
          <li
            key={crate.id}
            className={styles.crateCard}
          >
            <h3>{crate.name}</h3>

            <p>Price: {formatVnd(crate.price)}</p>

            <p>Stock: {crate.stock}</p>

            <button
              type="button"
              onClick={() => claim(crate.id)}
              disabled={
                crate.stock <= 0 ||
                claimingId !== null ||
                isLive
              }
            >
              {crate.stock <= 0
                ? 'Sold Out'
                : claimingId === crate.id
                  ? 'Claiming...'
                  : 'Claim Now'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
