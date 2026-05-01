import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ArrowRight, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Tournaments({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    sportType: 'Kabaddi',
    date: '',
    venue: ''
  });

  useEffect(() => {
    if (!user) return;
    loadTournaments();
  }, [user]);

  const loadTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), where('ownerId', '==', user?.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTournaments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const tData = {
        ...form,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'tournaments'), tData);
      navigate(`/tournaments/${docRef.id}`);
    } catch (err) {
      alert("Error creating tournament");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20 p-8 card max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-6">Please log in to view tournaments.</p>
        <button onClick={() => navigate('/login')} className="btn-primary w-full">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-1/3 shrink-0">
        <div className="card p-6 sticky top-24">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
             <Plus className="text-blue-600" /> New Tournament
           </h2>
           <form onSubmit={createTournament} className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1 text-slate-700">Tournament Name</label>
               <input required className="input-field" placeholder="e.g. Grama Cup 2024" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-slate-700">Sport Type</label>
               <select 
                 className="input-field"
                 value={form.sportType} 
                 onChange={e => setForm({...form, sportType: e.target.value})}
               >
                 <option value="Kabaddi">Kabaddi</option>
                 <option value="Volleyball">Volleyball</option>
                 <option value="Cricket">Cricket</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-slate-700">Start Date</label>
               <input type="date" required className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-slate-700">Venue</label>
               <input required className="input-field" placeholder="e.g. Main Ground" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
             </div>
             <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6 py-2.5 flex justify-center">
               {isSubmitting ? 'Creating...' : 'Create Tournament'}
             </button>
           </form>
        </div>
      </div>

      <div className="w-full md:w-2/3">
         <div className="flex items-center gap-2 mb-6">
           <Trophy className="text-blue-600" />
           <h2 className="text-xl font-bold text-slate-900">My Tournaments</h2>
         </div>
         {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
         ) : (
           <div className="space-y-4">
             {tournaments.map(t => (
               <div key={t.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/tournaments/${t.id}`)}>
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                       {t.sportType}
                     </span>
                     <span className="text-xs text-slate-400">
                        {t.createdAt?.toMillis ? formatDistanceToNow(t.createdAt.toMillis(), { addSuffix: true }) : ''}
                     </span>
                   </div>
                   <div className="text-xl font-bold text-slate-900 mb-2">
                     {t.name}
                   </div>
                   <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                     <div className="flex items-center gap-1"><Calendar size={14} /> {t.date}</div>
                     <div className="flex items-center gap-1"><MapPin size={14} /> {t.venue}</div>
                   </div>
                 </div>
                 <button 
                  className="btn-secondary whitespace-nowrap flex items-center justify-center gap-2 group-hover:border-blue-300 group-hover:text-blue-700 transition-colors"
                 >
                   Manage <ArrowRight size={16} />
                 </button>
               </div>
             ))}
             {tournaments.length === 0 && (
               <div className="bg-white border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
                 No tournaments created yet. Use the form to start your first tournament.
               </div>
             )}
           </div>
         )}
      </div>
    </div>
  );
}
