// src/components/Leaderboard.jsx

import { useState } from 'react';
import { PUBG_VN_STANDINGS } from '../data/pubgArenaData.js';
import styles from './Leaderboard.module.css';

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState('total-desc');

  // Derive the sorted standings during render without mutating source data.
  const sortedTeams = [...PUBG_VN_STANDINGS].toSorted((a, b) => {
    const totalA = a.placementPts + a.killPts;
    const totalB = b.placementPts + b.killPts;

    if (sortBy === 'total-desc') {
      return totalB - totalA;
    }

    if (sortBy === 'wwcd-desc') {
      return b.wwcd - a.wwcd;
    }

    return 0;
  });

  return (
    <section
      className={styles.container}
      aria-label="PUBG VN Leaderboard"
    >
      <header className={styles.header}>
        <h2>PVS Standings</h2>

        <label htmlFor="sort-select">Sort by</label>

        <select
          id="sort-select"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="total-desc">
            Total Points (High to Low)
          </option>

          <option value="wwcd-desc">
            WWCD (High to Low)
          </option>
        </select>
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Team</th>
            <th scope="col">WWCD</th>
            <th scope="col">Placement Pts</th>
            <th scope="col">Kill Pts</th>
            <th scope="col">Total</th>
          </tr>
        </thead>

        <tbody>
          {sortedTeams.map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.wwcd}</td>
              <td>{team.placementPts}</td>
              <td>{team.killPts}</td>
              <td>{team.placementPts + team.killPts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
