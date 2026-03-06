import { useEffect, useState } from 'react';

const API_BASE = 'https://eco-exchange-api.onrender.com';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const res = await fetch(`${API_BASE}/api/leaderboard`, { credentials: 'include' });
      const data = await res.json();
      setLeaders(Array.isArray(data) ? data : []);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
      <p className="text-sm text-slate-500 mb-4">Ranked by Successful Transaction Points</p>
      <div className="space-y-3">
        {leaders.map((leader) => (
          <div key={leader.rank} className={`rounded-xl border p-4 flex items-center justify-between ${leader.rank <= 3 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
            <div className="font-bold">#{leader.rank} {leader.username}</div>
            <div className="text-emerald-700 font-semibold">{leader.successfulTransactionPoints} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}