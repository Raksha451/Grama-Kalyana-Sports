import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Users, Plus, ArrowRight, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function TournamentDetail({ user }: { user: User | null }) {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'teams' | 'matches'>('teams');

  const [teamForm, setTeamForm] = useState({ name: '' });
  const [matchForm, setMatchForm] = useState({ team1Id: '', team2Id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tournamentId || !user) return;
    loadData();
  }, [tournamentId, user]);

  const loadData = async () => {
    if(!tournamentId) return;
    try {
      const tDoc = await getDoc(doc(db, 'tournaments', tournamentId));
      if (tDoc.exists()) {
        setTournament({ id: tDoc.id, ...tDoc.data() });
      }

      const qTeams = query(collection(db, 'teams'), where('tournamentId', '==', tournamentId));
      const snapTeams = await getDocs(qTeams);
      setTeams(snapTeams.docs.map(d => ({ id: d.id, ...d.data() })));

      const qMatches = query(collection(db, 'matches'), where('tournamentId', '==', tournamentId), orderBy('createdAt', 'desc'));
      const snapMatches = await getDocs(qMatches);
      setMatches(snapMatches.docs.map(d => ({ id: d.id, ...d.data() })));
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tournamentId) return;
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'teams'), {
        name: teamForm.name,
        tournamentId,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setTeams([...teams, { id: docRef.id, name: teamForm.name }]);
      setTeamForm({ name: '' });
    } catch (err) {
      alert("Error adding team: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tournamentId || !tournament) return;
    if (matchForm.team1Id === matchForm.team2Id) {
      alert("Please select different teams");
      return;
    }
    setIsSubmitting(true);
    try {
      const t1 = teams.find(t => t.id === matchForm.team1Id);
      const t2 = teams.find(t => t.id === matchForm.team2Id);
      
      const matchData = {
        tournamentId,
        team1Id: t1.id,
        team2Id: t2.id,
        team1Name: t1.name,
        team2Name: t2.name,
        sportType: tournament.sportType,
        status: 'scheduled',
        score: tournament.sportType === 'Kabaddi' ? { t1: 0, t2: 0 } 
             : tournament.sportType === 'Volleyball' ? { t1Sets: 0, t2Sets: 0, t1: 0, t2: 0 }
             : { t1Runs: 0, t1Wickets: 0, t1Overs: 0, t2Runs: 0, t2Wickets: 0, t2Overs: 0, currentInning: 1 },
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'matches'), matchData);
      setMatches([{ id: docRef.id, ...matchData }, ...matches]);
      navigate(`/match/${docRef.id}/score`);
    } catch (err) {
      alert("Error creating match");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="text-center mt-20 p-8 card max-w-md mx-auto">Access Denied</div>;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!tournament) return <div>Tournament not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card p-6 md:p-8 mb-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">
                 {tournament.sportType}
               </span>
             </div>
             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{tournament.name}</h1>
             <div className="flex flex-wrap gap-4 text-sm font-medium text-blue-100">
               <div className="flex items-center gap-1.5"><Calendar size={16} /> {tournament.date}</div>
               <div className="flex items-center gap-1.5"><MapPin size={16} /> {tournament.venue}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button 
          className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'teams' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams & Players Management
        </button>
        <button 
          className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'matches' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('matches')}
        >
          Match Schedule
        </button>
      </div>

      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Add Team</h3>
              <form onSubmit={createTeam} className="space-y-4">
                <div>
                  <input required className="input-field" placeholder="Team Name" value={teamForm.name} onChange={e => setTeamForm({name: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full shadow-sm text-sm py-2">Add Team</button>
              </form>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {teams.map(team => (
                 <Link to={`/teams/${team.id}`} key={team.id} className="card p-5 hover:border-blue-300 transition-colors group block">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                       <Users size={24} />
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{team.name}</h4>
                       <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                         Manage Players <ArrowRight size={12} />
                       </span>
                     </div>
                   </div>
                 </Link>
               ))}
               {teams.length === 0 && (
                 <div className="col-span-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                   No teams added yet. Add a team to start registering players.
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Schedule Match</h3>
              <form onSubmit={createMatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Team 1</label>
                  <select required className="input-field text-sm" value={matchForm.team1Id} onChange={e => setMatchForm({...matchForm, team1Id: e.target.value})}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Team 2</label>
                  <select required className="input-field text-sm" value={matchForm.team2Id} onChange={e => setMatchForm({...matchForm, team2Id: e.target.value})}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting || teams.length < 2} className="btn-primary w-full shadow-sm text-sm py-2 mt-2">
                  Create Fixture
                </button>
                {teams.length < 2 && <p className="text-xs text-red-500 text-center">At least 2 teams required to schedule a match.</p>}
              </form>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-3">
               {matches.map(m => (
                 <div key={m.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       {m.status === 'live' && <span className="badge badge-live">Live</span>}
                       {m.status === 'scheduled' && <span className="badge badge-scheduled">Scheduled</span>}
                       {m.status === 'finished' && <span className="badge badge-finished">Finished</span>}
                     </div>
                     <div className="text-base font-bold text-slate-900">
                       {m.team1Name} <span className="text-slate-400 font-medium px-2">vs</span> {m.team2Name}
                     </div>
                   </div>
                   <button 
                    onClick={() => navigate(`/match/${m.id}/score`)} 
                    className="btn-secondary text-sm whitespace-nowrap flex items-center justify-center gap-2"
                   >
                     Update Score
                   </button>
                 </div>
               ))}
               {matches.length === 0 && (
                 <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                   No matches scheduled yet.
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
