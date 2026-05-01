import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { ScoreCard } from '../components/ScoreCard';
import { ArrowLeft, ExternalLink, Settings, ShieldAlert, Award } from 'lucide-react';

export function MatchScorer({ user }: { user: User | null }) {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, 'matches', matchId), (d) => {
      if (d.exists()) {
        const data = { id: d.id, ...d.data() } as any;
        setMatch(data);
        if (data.tournamentId && data.team1Id && data.team2Id && players.length === 0) {
            loadPlayers(data.team1Id, data.team2Id);
        }
      }
    });
    return unsub;
  }, [matchId, players.length]);

  const loadPlayers = async (t1: string, t2: string) => {
      try {
          const q1 = query(collection(db, 'players'), where('teamId', '==', t1));
          const q2 = query(collection(db, 'players'), where('teamId', '==', t2));
          const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
          setPlayers([...s1.docs.map(d=>({id:d.id, ...d.data()})), ...s2.docs.map(d=>({id:d.id, ...d.data()}))]);
      } catch (e) {
          console.error("Error loading players", e);
      }
  };

  if (!user) {
    return (
      <div className="text-center mt-20 p-8 card max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-slate-900">Unauthorized Access</h2>
        <p className="text-slate-500 mb-6">You must be logged in to access the scorer terminal.</p>
        <Link to="/login" className="btn-primary w-full inline-block text-center py-2 px-4 rounded-lg">Go to Login</Link>
      </div>
    );
  }

  if (!match) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const updateScore = async (field: string, delta: number) => {
    try {
      let newValue = (match.score[field] || 0) + delta;
      if (newValue < 0) newValue = 0;
      await updateDoc(doc(db, 'matches', match.id), {
        [`score.${field}`]: newValue
      });
    } catch (e) {
      console.error(e);
      alert("UPDATE FAILED");
    }
  };

  const setStatus = async (status: string) => {
    try {
      await updateDoc(doc(db, 'matches', match.id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  const setManOfMatch = async (playerId: string) => {
      try {
          await updateDoc(doc(db, 'matches', match.id), { manOfMatchId: playerId });
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <Link to={`/tournaments/${match.tournamentId}`} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Scorer Terminal</div>
            <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-xs">{match.team1Name} vs {match.team2Name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to={`/match/${match.id}`} target="_blank" className="flex items-center gap-1 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700">
            <ExternalLink size={16} /> <span className="hidden sm:inline">Public View</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 shadow-md border-t-4 border-t-blue-500">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-900">Live Control</h2>
               <div className="text-sm font-semibold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {match.sportType}
               </div>
            </div>
            
            <ScoreCard match={match} isScorer={true} updateScore={updateScore} />
          </div>
          
          {match.status === 'finished' && players.length > 0 && (
             <div className="card p-6 border-t-4 border-t-yellow-500">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Award size={20} className="text-yellow-500" /> Man of the Match</h3>
                <select 
                    className="input-field" 
                    value={match.manOfMatchId || ''} 
                    onChange={e => setManOfMatch(e.target.value)}
                >
                    <option value="">Select Man of the Match...</option>
                    {players.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.teamId === match.team1Id ? match.team1Name : match.team2Name})</option>
                    ))}
                </select>
                {match.manOfMatchId && <p className="text-sm text-green-600 mt-2 font-medium">Man of the Match updated and saved.</p>}
             </div>
          )}
        </div>
        
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 shadow-md border-t-4 border-t-amber-500">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
               <Settings size={20} className="text-amber-500" /> Match State
            </div>
            
            <div className="space-y-3">
              <button 
                className={`w-full py-3 rounded-xl font-medium transition-colors border ${match.status === 'scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setStatus('scheduled')}
              >
                Scheduled
              </button>
              <button 
                className={`w-full py-3 rounded-xl font-medium transition-colors border ${match.status === 'live' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm flex justify-center items-center gap-2' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setStatus('live')}
              >
                {match.status === 'live' && <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>}
                Live
              </button>
              <button 
                className={`w-full py-3 rounded-xl font-medium transition-colors border ${match.status === 'finished' ? 'bg-slate-800 text-white border-slate-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setStatus('finished')}
              >
                Finished
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
