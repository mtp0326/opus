import React, { useEffect, useState } from 'react';
import { getLeaderboard } from 'client/src/Projects/api.ts';
import { IUser } from 'server/src/models/user.model.ts';
import styles from './Leaderboard.module.css';
import Navigation from '../components/Navigation2';
// import { getData } from '../util/api';
// import IUser from '../util/types/user'; // Ensure this import is correct

function Leaderboard() {
  // const [users, setUsers] = useState([]);
  const [users, setUsers] = useState<IUser[]>([]); // Use IUser type for users

  useEffect(() => {
    // Fetch leaderboard data from the server
    async function fetchLeaderboardData() {
      try {
        const response = await fetch('/api/leaderboard'); // Example API endpoint
        // const data = await response.json();
        const data = await getLeaderboard();
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
}

export default Leaderboard;
