import React from 'react';
import { Minus, Plus } from 'lucide-react';

export function ScoreCard({ match, isScorer = false, updateScore }: { match: any, isScorer?: boolean, updateScore?: (key: string, delta: number) => void }) {
  if (!match) return null;
  const { sportType, score } = match;

  const ScorerButton = ({ onClick, children, className = "" }: { onClick?: () => void, children: React.ReactNode, className?: string }) => (
    <button 
      onClick={onClick}
      className={`bg-slate-100 hover:bg-slate-200 text-slate-700 active:bg-slate-300 transition-colors rounded-lg font-medium shadow-sm border border-slate-200 ${className}`}
    >
      {children}
    </button>
  );

  const renderPointControls = (label: string, field: string) => {
    if (!isScorer) return null;
    return (
      <div className="flex items-center justify-center gap-3 mt-4">
        <ScorerButton className="p-3 rounded-full" onClick={() => updateScore && updateScore(field, -1)}>
          <Minus size={20} />
        </ScorerButton>
        <div className="text-sm font-semibold uppercase tracking-wider text-slate-400 w-16 text-center">{label}</div>
        <ScorerButton className="p-3 shadow-md border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 rounded-full" onClick={() => updateScore && updateScore(field, 1)}>
          <Plus size={20} />
        </ScorerButton>
      </div>
    );
  };

  const scoreDisplayClass = "text-6xl sm:text-8xl md:text-9xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none";

  if (sportType === 'Kabaddi') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-8 text-center mt-6">
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
           <div className={scoreDisplayClass}>{score.t1}</div>
           {renderPointControls('POINTS', 't1')}
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
           <div className={scoreDisplayClass}>{score.t2}</div>
           {renderPointControls('POINTS', 't2')}
        </div>
      </div>
    );
  }

  if (sportType === 'Volleyball') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-8 text-center mt-6">
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-10 border border-slate-100 shadow-sm relative">
           <div className="absolute top-4 left-0 right-0 flex justify-center">
               <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-700">
                 SETS {score.t1Sets}
               </div>
           </div>
           
           <div className="mt-8">
             <div className={scoreDisplayClass}>{score.t1}</div>
             {renderPointControls('POINTS', 't1')}
           </div>
           
           {isScorer && (
             <div className="flex justify-center gap-2 mt-6 pt-6 border-t border-slate-200">
               <ScorerButton className="px-3 py-1.5 text-xs flex items-center gap-1" onClick={() => updateScore && updateScore('t1Sets', -1)}><span>-</span> Set</ScorerButton>
               <ScorerButton className="px-3 py-1.5 text-xs flex items-center gap-1 bg-white" onClick={() => updateScore && updateScore('t1Sets', 1)}><span>+</span> Set</ScorerButton>
             </div>
           )}
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-10 border border-slate-100 shadow-sm relative">
           <div className="absolute top-4 left-0 right-0 flex justify-center">
               <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-700">
                 SETS {score.t2Sets}
               </div>
           </div>
           
           <div className="mt-8">
             <div className={scoreDisplayClass}>{score.t2}</div>
             {renderPointControls('POINTS', 't2')}
           </div>
           
           {isScorer && (
             <div className="flex justify-center gap-2 mt-6 pt-6 border-t border-slate-200">
               <ScorerButton className="px-3 py-1.5 text-xs flex items-center gap-1" onClick={() => updateScore && updateScore('t2Sets', -1)}><span>-</span> Set</ScorerButton>
               <ScorerButton className="px-3 py-1.5 text-xs flex items-center gap-1 bg-white" onClick={() => updateScore && updateScore('t2Sets', 1)}><span>+</span> Set</ScorerButton>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (sportType === 'Cricket') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mt-6 text-center">
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
           <div className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-tighter tabular-nums mb-2">
             {score.t1Runs}<span className="text-3xl sm:text-4xl text-slate-400 font-light mx-1">/</span>{score.t1Wickets}
           </div>
           <div className="text-xl font-medium text-slate-500 mb-6 bg-white inline-block px-4 py-1 rounded-full border border-slate-200 shadow-sm">
             Overs: {(score.t1Overs || 0).toFixed(1)}
           </div>
           
           {isScorer && (
             <div className="grid grid-cols-3 gap-2">
               <ScorerButton className="py-3 px-2 text-sm bg-blue-50 text-blue-700 border-blue-200" onClick={() => updateScore && updateScore('t1Runs', 1)}>+1 Run</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm bg-blue-50 text-blue-700 border-blue-200" onClick={() => updateScore && updateScore('t1Runs', 4)}>+4 Runs</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm bg-blue-50 text-blue-700 border-blue-200" onClick={() => updateScore && updateScore('t1Runs', 6)}>+6 Runs</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm bg-red-50 text-red-700 border-red-200" onClick={() => updateScore && updateScore('t1Wickets', 1)}>+Wicket</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm" onClick={() => updateScore && updateScore('t1Overs', 0.1)}>+Ball</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm text-slate-500" onClick={() => updateScore && updateScore('t1Runs', -1)}>-1 Undo</ScorerButton>
             </div>
           )}
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
           <div className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-tighter tabular-nums mb-2">
             {score.t2Runs}<span className="text-3xl sm:text-4xl text-slate-400 font-light mx-1">/</span>{score.t2Wickets}
           </div>
           <div className="text-xl font-medium text-slate-500 mb-6 bg-white inline-block px-4 py-1 rounded-full border border-slate-200 shadow-sm">
             Overs: {(score.t2Overs || 0).toFixed(1)}
           </div>
           
           {isScorer && (
             <div className="grid grid-cols-3 gap-2">
               <ScorerButton className="py-3 px-2 text-sm bg-blue-50 text-blue-700 border-blue-200" onClick={() => updateScore && updateScore('t2Runs', 1)}>+1 Run</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm bg-blue-50 text-blue-700 border-blue-200" onClick={() => updateScore && updateScore('t2Runs', 4)}>+4 Runs</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm bg-blue-50 text-blue-700 border-blue-200" onClick={() => updateScore && updateScore('t2Runs', 6)}>+6 Runs</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm bg-red-50 text-red-700 border-red-200" onClick={() => updateScore && updateScore('t2Wickets', 1)}>+Wicket</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm" onClick={() => updateScore && updateScore('t2Overs', 0.1)}>+Ball</ScorerButton>
               <ScorerButton className="py-3 px-2 text-sm text-slate-500" onClick={() => updateScore && updateScore('t2Runs', -1)}>-1 Undo</ScorerButton>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center text-slate-500 mt-6">
      Unknown Sport Type Configuration.
    </div>
  );
}
