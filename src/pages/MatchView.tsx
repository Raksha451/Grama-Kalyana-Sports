import React, { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useParams, Link } from 'react-router-dom';
import { ScoreCard } from '../components/ScoreCard';
import html2canvas from 'html2canvas';
import { Share2, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export function MatchView() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, 'matches', matchId), (d) => {
      if (d.exists()) {
        setMatch({ id: d.id, ...d.data() });
      }
    });
    return unsub;
  }, [matchId]);

  const handleShare = async () => {
    if (!match) return;
    let text = `🏆 *GRAMA KALYANA SPORTS* 🏆\n${match.sportType} Match\n\n`;
    text += `*${match.team1Name}* vs *${match.team2Name}*\n`;
    text += `Status: ${match.status.toUpperCase()}\n\n`;
    
    if (match.sportType === 'Kabaddi' || match.sportType === 'Volleyball') {
      text += `Score: ${match.score.t1} - ${match.score.t2}\n`;
      if (match.sportType === 'Volleyball') {
        text += `Sets: ${match.score.t1Sets} - ${match.score.t2Sets}\n`;
      }
    } else if (match.sportType === 'Cricket') {
      text += `${match.team1Name}: ${match.score.t1Runs}/${match.score.t1Wickets} (${match.score.t1Overs} ov)\n`;
      text += `${match.team2Name}: ${match.score.t2Runs}/${match.score.t2Wickets} (${match.score.t2Overs} ov)\n`;
    }
    
    text += `\nFollow live stats at: ${window.location.href}`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: '#ffffff',
        scale: 2 // High resolution
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `grama_kalyana_${match?.team1Name.replace(/\s+/g,'_')}_vs_${match?.team2Name.replace(/\s+/g,'_')}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      alert('Failed to export image.');
    }
  };

  if (!match) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Back to Live Feed
        </Link>
      </div>

      <div className="card shadow-md overflow-visible relative">
        {/* Actual content to image cap */}
        <div ref={cardRef} className="p-6 sm:p-10 bg-white rounded-xl">
          
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {match.sportType}
              </span>
              {match.status === 'live' && (
                <span className="badge badge-live animate-pulse flex items-center gap-1.5 px-3 py-1 text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> LIVE
                </span>
              )}
              {match.status === 'scheduled' && <span className="badge badge-scheduled px-3 py-1 text-sm">Scheduled</span>}
              {match.status === 'finished' && <span className="badge badge-finished px-3 py-1 text-sm">Finished</span>}
            </div>

            <div className="flex w-full justify-between items-center">
              <div className="w-[40%] text-right">
                 <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 truncate tracking-tight">{match.team1Name}</h2>
              </div>
              <div className="w-[20%] text-center px-4">
                 <span className="text-lg sm:text-xl font-semibold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">VS</span>
              </div>
              <div className="w-[40%] text-left">
                 <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 truncate tracking-tight">{match.team2Name}</h2>
              </div>
            </div>
          </div>

          <ScoreCard match={match} />
          
          <div className="mt-8 pt-6 text-center text-slate-400 text-xs font-medium uppercase tracking-widest border-t border-slate-50 flex items-center justify-center gap-2">
            Grama Kalyana Sports Network
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
        <button 
          onClick={handleShare} 
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <Share2 size={18} /> Share to WhatsApp
        </button>
        <button 
          onClick={handleExportPng} 
          className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <ImageIcon size={18} /> Download Scorecard
        </button>
      </div>
    </div>
  );
}
