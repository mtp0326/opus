import React, { useEffect, useState } from 'react';

//This is a placeholder for the actual leaderboard @Vikram
type Player = {
  rank: number;
  name: string;
  score: number;
};

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);

  // Sample data for demonstration
  const sampleData = [
    { rank: 1, name: 'Alice', score: 150 },
    { rank: 2, name: 'Bob', score: 120 },
    { rank: 3, name: 'Charlie', score: 100 },
  ];

  useEffect(() => {
    // Simulate fetching data from an API
    setLeaderboardData(sampleData);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Leaderboard</h1>
      <table style={{ margin: '0 auto', border: '1px solid black' }}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((player) => (
            <tr key={player.rank}>
              <td>{player.rank}</td>
              <td>{player.name}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardPage;
