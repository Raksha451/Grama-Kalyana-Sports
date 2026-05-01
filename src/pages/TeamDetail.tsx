import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where, doc, getDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Plus } from 'lucide-react';

export function TeamDetail({ user }: { user: User | null }) {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [playerForm, setPlayerForm] = useState({ name: '', position: '', jerseyNumber: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId || !user) return;
    loadData();
  }, [teamId, user]);

  const loadData = async () => {
    if(!teamId) return;
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (teamDoc.exists()) {
        const teamData = { id: teamDoc.id, ...teamDoc.data() } as any;
        setTeam(teamData);
        
        if(teamData.tournamentId) {
            const tDoc = await getDoc(doc(db, 'tournaments', teamData.tournamentId));
            if(tDoc.exists()) setTournament({id: tDoc.id, ...tDoc.data()});
        }
      }

      const qPlayers = query(collection(db, 'players'), where('teamId', '==', teamId));
      const snapPlayers = await getDocs(qPlayers);
      setPlayers(snapPlayers.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const registerPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teamId || !team?.tournamentId) return;
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'players'), {
        ...playerForm,
        teamId,
        tournamentId: team.tournamentId,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        careerStats: { matchesPlayed: 0 }
      });
      setPlayers([...players, { id: docRef.id, ...playerForm }]);
      setPlayerForm({ name: '', position: '', jerseyNumber: '' });
    } catch (err) {
      alert("Error adding player: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="text-center mt-20">Access Denied</div>;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!team) return <div>Team not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link to={`/tournaments/${team.tournamentId}`} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Back to Tournament
        </Link>
      </div>

      <div className="card shadow-sm p-6 mb-8 flex items-center gap-4">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl">
          {team.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{team.name}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Tournament: {tournament?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus size={18} /> Register Player</h3>
              <form onSubmit={registerPlayer} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input required className="input-field text-sm" placeholder="Player Name" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Position / Role</label>
                  <input required className="input-field text-sm" placeholder="e.g. Raider / Batsman" value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Jersey Number</label>
                  <input type="number" required className="input-field text-sm" placeholder="e.g. 10" value={playerForm.jerseyNumber} onChange={e => setPlayerForm({...playerForm, jerseyNumber: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full shadow-sm text-sm py-2 mt-2">Add Player</button>
              </form>
            </div>
        </div>
        
        <div className="md:col-span-2">
            <h3 className="font-bold text-slate-900 mb-4 ml-1 flex items-center gap-2 text-lg"><UserIcon size={20} /> Team Roster ({players.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {players.map(p => (
                  <div key={p.id} className="card p-4 flex flex-row items-center gap-4 group hover:border-blue-300 transition-colors">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {p.jerseyNumber}
                     </div>
                     <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.position}</div>
                     </div>
                  </div>
                ))}
                {players.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                    No players registered yet.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
