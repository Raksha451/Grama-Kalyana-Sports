import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Tournaments } from './pages/Tournaments';
import { TournamentDetail } from './pages/TournamentDetail';
import { TeamDetail } from './pages/TeamDetail';
import { MatchView } from './pages/MatchView';
import { MatchScorer } from './pages/MatchScorer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Trophy, Activity, LogIn, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                <Trophy size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Grama Kalyana</span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md transition-colors hover:bg-slate-100">
                <Activity size={18} />
                <span className="hidden sm:inline">Live Matches</span>
              </Link>
              {user ? (
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors shadow-sm">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Scorer Login</span>
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Tournaments user={user} />} />
            <Route path="/tournaments/:tournamentId" element={<TournamentDetail user={user} />} />
            <Route path="/teams/:teamId" element={<TeamDetail user={user} />} />
            <Route path="/match/:matchId" element={<MatchView />} />
            <Route path="/match/:matchId/score" element={<MatchScorer user={user} />} />
          </Routes>
        </main>
        
        <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 mt-auto bg-white">
          <p>© {new Date().getFullYear()} Grama Kalyana Sports. Village-level tournament tracker.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
