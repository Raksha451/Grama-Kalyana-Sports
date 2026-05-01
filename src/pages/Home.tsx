import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      
      // Sort: Live matches first, then Scheduled, then Finished
      const sorted = data.sort((a, b) => {
          const rank = { live: 1, scheduled: 2, finished: 3 } as any;
          return (rank[a.status] || 4) - (rank[b.status] || 4);
      });
      
      setMatches(sorted);
      setLoading(false);
    });
    
    return unsub;
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center justify-center sm:justify-start gap-2">
          <Activity className="text-blue-600" /> Live & Recent Matches
        </h1>
        <p className="text-slate-500 mt-2">Follow real-time scores from village tournaments.</p>
      </div>

      {loading ? (
         <div className="flex justify-center items-center h-48">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {matches.map(m => (
            <Link to={`/match/${m.id}`} key={m.id} className="card hover:border-blue-300 hover:shadow-md transition-all group relative block">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {m.sportType}
                  </span>
                  {m.status === 'live' && (
                    <span className="badge badge-live animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Live
                    </span>
                  )}
                  {m.status === 'scheduled' && <span className="badge badge-scheduled">Scheduled</span>}
                  {m.status === 'finished' && <span className="badge badge-finished">Finished</span>}
                </div>
                
                <div className="flex justify-between items-center text-center">
                  <div className="w-2/5">
                    <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{m.team1Name}</div>
                  </div>
                  <div className="w-1/5 text-sm font-medium text-slate-400">VS</div>
                  <div className="w-2/5">
                    <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{m.team2Name}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-400">
                  <Clock size={14} className="mr-1" />
                  {m.createdAt?.toMillis ? formatDistanceToNow(m.createdAt.toMillis(), { addSuffix: true }) : 'Recently'}
                </div>
              </div>
            </Link>
          ))}
          {matches.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              No matches found. Check back later or create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
