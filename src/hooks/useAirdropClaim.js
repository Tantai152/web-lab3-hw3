// src/hooks/useAirdropClaim.js

import { useState, useCallback } from 'react';
import { mockClaimCrate } from '../data/pubgArenaData.js';

export function useAirdropClaim(initialCrates) {
  const [crates, setCrates] = useState(initialCrates);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState(null);

  const claim = useCallback(
    async (crateId) => {
      // Prevent duplicate claims and simultaneous requests.
      if (claimingId !== null) {
        return;
      }

      const crate = crates.find((item) => item.id === crateId);

      // Ignore invalid crates or items that are out of stock.
      if (!crate || crate.stock <= 0) {
        return;
      }

      setClaimingId(crateId);
      setError(null);

      // Optimistic UI: decrease stock immediately for responsiveness.
      setCrates((prevCrates) =>
        prevCrates.map((item) =>
          item.id === crateId
            ? { ...item, stock: item.stock - 1 }
            : item
        )
      );

      try {
        await mockClaimCrate(crateId);

        // Keep the optimistic update when the claim succeeds.
        setClaimingId(null);
      } catch (err) {
        // An aborted request should not display an error.
        if (err.name === 'AbortError') {
          setClaimingId(null);
          return;
        }

        // Rollback: restore the stock when the API rejects the claim,
        // including a simulated 409 Conflict (out of stock).
        setCrates((prevCrates) =>
          prevCrates.map((item) =>
            item.id === crateId
              ? { ...item, stock: item.stock + 1 }
              : item
          )
        );

        setError(err.message);
        setClaimingId(null);
      }
    },
    [claimingId, crates]
  );

  return {
    crates,
    claimingId,
    error,
    claim,
  };
}
