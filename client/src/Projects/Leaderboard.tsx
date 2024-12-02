import React, { useEffect, useState } from 'react';
import styles from './Leaderboard.module.css';
import Navigation from '../components/Navigation';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data from the server
    async function fetchLeaderboardData() {
      try {
        const response = await fetch('/api/leaderboard'); // Example API endpoint
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    }

    fetchLeaderboardData();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Navigation />
      <div className={styles.container}>
        <h2>Leaderboard</h2>
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
              <th>League</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.points}</td>
                <td>{user.league}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
