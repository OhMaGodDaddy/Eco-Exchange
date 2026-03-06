import { useEffect, useState } from 'react';

const API_BASE = 'https://eco-exchange-api.onrender.com';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [successfulExchanges, setSuccessfulExchanges] = useState(0);

  useEffect(() => {
    const fetchLeaders = async () => {
      const res = await fetch(`${API_BASE}/api/leaderboard`, { credentials: 'include' });
      const data = await res.json();
      setLeaders(Array.isArray(data) ? data : []);
    };

    const fetchStats = async () => {
      const res = await fetch(`${API_BASE}/api/platform-stats`, { credentials: 'include' });
      const data = await res.json();
      setSuccessfulExchanges(Number(data?.successfulExchanges) || 0);
    };

    fetchLeaders();
    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Leaderboard</h1>
      <p className="mb-4 text-sm text-slate-500">Ranked by Successful Transaction Points</p>

      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-sm font-semibold text-emerald-900">Items Reused Through EcoExchange</div>
        <div className="mt-1 text-2xl font-bold text-emerald-700">
          {successfulExchanges.toLocaleString()} Items Saved From Waste ♻️
        </div>
      </div>

      <div className="space-y-3">
        {leaders.map((leader) => (
          <div key={leader.rank} className={`flex items-center justify-between rounded-xl border p-4 ${leader.rank <= 3 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <div>
              <div className="font-bold">#{leader.rank} {leader.username}</div>
              <div className="text-xs text-slate-500">Trust Score: {leader.trustScore ?? 50}%</div>
            </div>
            <div className="font-semibold text-emerald-700">{leader.successfulTransactionPoints} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
