'use client';

import { useState, useEffect } from 'react';
import { calculateRating, calculateScore, calculateScoreTolerance, RatingResult, ScoreResult, ToleranceResult } from '@/lib/lanota';
import { cn } from '@/lib/utils';
import NumberPad from '@/components/NumberPad';


function CountUp({ value, duration = 1000 }: { value: number, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(ease * (end - start) + start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}


function SegmentedControl<T extends string>({ 
  options, 
  value, 
  onChange 
}: { 
  options: { label: string, value: T }[], 
  value: T, 
  onChange: (val: T) => void 
}) {
  const activeIndex = options.findIndex(o => o.value === value);

  return (
    <div className="relative flex bg-surface-container-high rounded-full p-1 shadow-inner overflow-hidden border border-outline/5 select-none w-full">
      <div 
        className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.2,0.0,0,1.0)]"
        style={{ 
          left: `calc(${activeIndex * (100 / options.length)}% + 4px)`, 
          width: `calc(${100 / options.length}% - 8px)` 
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 text-center rounded-full active:scale-95 tap-highlight-transparent",
            value === option.value ? "text-on-primary" : "text-outline hover:text-on-surface"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}


function Switch({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none tap-highlight-transparent">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={cn(
          "w-14 h-8 rounded-full transition-colors duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] border-2 box-border",
          checked ? "bg-primary border-primary" : "bg-surface-container-highest border-outline"
        )}></div>
        <div className={cn(
          "absolute top-1.5 left-1.5 bg-white w-5 h-5 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] group-active:w-7",
          checked ? "translate-x-6 group-active:translate-x-4" : "translate-x-0",
          checked ? "bg-on-primary" : "bg-outline"
        )}></div>
      </div>
      <span className="text-sm font-bold text-on-surface/80 group-hover:text-primary transition-colors">{label}</span>
    </label>
  );
}


function InputButton({ 
  label, 
  value, 
  isActive, 
  onClick, 
  colorClass = "bg-surface-container-high text-on-surface",
  ringClass = "ring-primary"
}: { 
  label?: string, 
  value: string | number | React.ReactNode, 
  isActive: boolean, 
  onClick: () => void,
  colorClass?: string,
  ringClass?: string
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative w-full rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] border border-transparent select-none overflow-hidden group tap-highlight-transparent",
        colorClass,
        isActive 
          ? `ring-2 ${ringClass} scale-[1.02] shadow-md z-10` 
          : "hover:brightness-95 hover:shadow-sm active:scale-[0.98]"
      )}
    >
       {label && (
         <span className={cn(
           "text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 transition-colors group-hover:opacity-80",
           isActive ? "text-primary" : "text-inherit"
         )}>
           {label}
         </span>
       )}
       <span className="text-2xl font-bold tracking-tight">{value}</span>
    </button>
  );
}



export default function Home() {
  const [mode, setMode] = useState<'calculator' | 'tolerance'>('calculator');

  
  const [level, setLevel] = useState<number>(0);
  const [levelSuffix, setLevelSuffix] = useState<'none' | '+'>('none');
  const [harmony, setHarmony] = useState<number>(0);
  const [tune, setTune] = useState<number>(0);
  const [fail, setFail] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [targetScore, setTargetScore] = useState<number>(0);
  const [totalNotes, setTotalNotes] = useState<number>(0);

  
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [ratingResult, setRatingResult] = useState<RatingResult | null>(null);
  const [toleranceResult, setToleranceResult] = useState<ToleranceResult | null>(null);

  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'calculator') {
       if (level > 0 && (harmony + tune + fail > 0)) {
          setScoreResult(calculateScore({ harmony, tune, fail }, maxCombo));
          setRatingResult(calculateRating({ harmony, tune, fail }, level, levelSuffix === '+'));
       } else if (harmony + tune + fail === 0) {
          setScoreResult(null);
          setRatingResult(null);
       }
    } else {
       if (level > 0 && targetScore > 0 && totalNotes > 0) {
          setToleranceResult(calculateScoreTolerance(targetScore, totalNotes, level, levelSuffix === '+'));
       } else {
          setToleranceResult(null);
       }
    }
  }, [mode, level, levelSuffix, harmony, tune, fail, maxCombo, targetScore, totalNotes]);

  const getActiveFieldLabel = () => {
    switch (activeField) {
        case 'level': return { label: '谱面定数', value: level };
        case 'harmony': return { label: 'HARMONY', value: harmony };
        case 'tune': return { label: 'TUNE', value: tune };
        case 'fail': return { label: 'FAIL', value: fail };
        case 'maxCombo': return { label: 'MAX COMBO', value: maxCombo };
        case 'totalNotes': return { label: '物量总数', value: totalNotes };
        case 'targetScore': return { label: '目标分数', value: targetScore };
        default: return { label: '', value: '' };
    }
  };
  const { label: activeLabel, value: activeValue } = getActiveFieldLabel();

  const handleInput = (num: number) => {
    if (!activeField) return;
    let currentValue = 0;
    let setter: (val: number) => void = () => {};
    switch (activeField) {
      case 'level': currentValue = level; setter = setLevel; break;
      case 'harmony': currentValue = harmony; setter = setHarmony; break;
      case 'tune': currentValue = tune; setter = setTune; break;
      case 'fail': currentValue = fail; setter = setFail; break;
      case 'maxCombo': currentValue = maxCombo; setter = setMaxCombo; break;
      case 'totalNotes': currentValue = totalNotes; setter = setTotalNotes; break;
      case 'targetScore': currentValue = targetScore; setter = setTargetScore; break;
    }
    const newValue = Number(`${currentValue}${num}`);
    if (activeField === 'level' && newValue > 16) return;
    if (activeField === 'targetScore' && newValue > 1000000) return; 
    setter(newValue);
  };

  const handleDelete = () => {
    if (!activeField) return;
    let currentValue = 0;
    let setter: (val: number) => void = () => {};
    switch (activeField) {
      case 'level': currentValue = level; setter = setLevel; break;
      case 'harmony': currentValue = harmony; setter = setHarmony; break;
      case 'tune': currentValue = tune; setter = setTune; break;
      case 'fail': currentValue = fail; setter = setFail; break;
      case 'maxCombo': currentValue = maxCombo; setter = setMaxCombo; break;
      case 'totalNotes': currentValue = totalNotes; setter = setTotalNotes; break;
      case 'targetScore': currentValue = targetScore; setter = setTargetScore; break;
    }
    const strVal = String(currentValue);
    if (strVal.length <= 1) setter(0);
    else setter(Number(strVal.slice(0, -1)));
  };

  const handleClear = () => {
     if (!activeField) return;
     switch (activeField) {
        case 'level': setLevel(0); break;
        case 'harmony': setHarmony(0); break;
        case 'tune': setTune(0); break;
        case 'fail': setFail(0); break;
        case 'maxCombo': setMaxCombo(0); break;
        case 'totalNotes': setTotalNotes(0); break;
        case 'targetScore': setTargetScore(0); break;
    }
  };
  
  const handleDone = () => setActiveField(null);

  const getR5Status = () => {
    const total = harmony + tune + fail;
    if (total === 0) return false;
    const harmonyRate = harmony / total;
    return isNewRecord || harmonyRate >= 0.95;
  };

  return (
    <main className="min-h-screen bg-background text-on-background font-sans transition-colors duration-500 overflow-x-hidden flex flex-col items-center pb-safe" style={{ fontFamily: "'Google Sans', 'Noto Sans SC', sans-serif" }}>
      
      <header className="w-full max-w-5xl mx-auto p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
         <div className="flex items-center gap-3 self-start md:self-auto">
             <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
             </div>
             <h1 className="text-xl font-bold tracking-tight text-on-surface">Lanota 分数计算器</h1>
         </div>
         <div className="w-full md:w-56">
            <SegmentedControl 
                options={[{ label: '分数计算', value: 'calculator' }, { label: '容错查询', value: 'tolerance' }]}
                value={mode}
                onChange={setMode}
            />
         </div>
      </header>

      <div className="w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-700 delay-100 items-start">
          
          <div className="md:col-span-5 space-y-6">
              <div className="bg-surface-container-low p-6 rounded-[28px] border border-outline/5 shadow-sm space-y-4">
                 <h2 className="text-xs font-bold text-primary uppercase tracking-widest ml-1">基础信息</h2>
                 <div className="flex gap-4">
                    <div className="w-24 shrink-0">
                         <InputButton 
                             isActive={activeField === 'level'}
                             onClick={() => setActiveField('level')}
                             value={level === 0 ? <span className="text-outline/50">Level</span> : level}
                         />
                    </div>
                    <div className="flex-1 flex items-center">
                         <SegmentedControl 
                            options={[{ label: 'Flat', value: 'none' }, { label: '+ Plus', value: '+' }]}
                            value={levelSuffix}
                            onChange={setLevelSuffix}
                         />
                    </div>
                 </div>
              </div>

              {mode === 'calculator' ? (
                  <div className="bg-surface-container-low p-6 rounded-[28px] border border-outline/5 shadow-sm space-y-6">
                      <div className="flex items-center justify-between px-1">
                         <h2 className="text-xs font-bold text-primary uppercase tracking-widest">判定数据</h2>
                         <Switch checked={isNewRecord} onChange={setIsNewRecord} label="新记录" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                          <InputButton 
                              label="Harmony"
                              value={harmony} 
                              isActive={activeField === 'harmony'} 
                              onClick={() => setActiveField('harmony')}
                              colorClass="bg-harmony-container text-on-harmony-container"
                              ringClass="ring-harmony"
                          />
                          <InputButton 
                              label="Tune"
                              value={tune} 
                              isActive={activeField === 'tune'} 
                              onClick={() => setActiveField('tune')}
                              colorClass="bg-tune-container text-on-tune-container"
                              ringClass="ring-tune"
                          />
                          <InputButton 
                              label="Fail"
                              value={fail} 
                              isActive={activeField === 'fail'} 
                              onClick={() => setActiveField('fail')}
                              colorClass="bg-fail-container text-on-fail-container"
                              ringClass="ring-fail"
                          />
                      </div>

                      <InputButton 
                          label="Max Combo"
                          value={maxCombo} 
                          isActive={activeField === 'maxCombo'} 
                          onClick={() => setActiveField('maxCombo')}
                      />
                  </div>
              ) : (
                  <div className="bg-surface-container-low p-6 rounded-[28px] border border-outline/5 shadow-sm space-y-6">
                      <h2 className="text-xs font-bold text-primary uppercase tracking-widest px-1">目标设定</h2>
                      <InputButton label="物量总数" value={totalNotes} isActive={activeField === 'totalNotes'} onClick={() => setActiveField('totalNotes')} />
                      <InputButton label="目标分数" value={targetScore.toLocaleString()} isActive={activeField === 'targetScore'} onClick={() => setActiveField('targetScore')} />
                  </div>
              )}
          </div>

          <div className="md:col-span-7 flex flex-col h-full min-h-[400px]">
              <div className={cn(
                  "relative flex-1 rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-500 border border-outline/5",
                  (mode === 'calculator' ? scoreResult : toleranceResult) ? "bg-surface-container shadow-xl" : "bg-surface-container/30 border-dashed"
              )}>
                 
                 {!(mode === 'calculator' ? scoreResult : toleranceResult) ? (
                     <div className="opacity-30 flex flex-col items-center gap-4 animate-pulse">
                         <div className="w-16 h-16 rounded-full bg-outline/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                         </div>
                         <p className="font-bold text-xl tracking-tight">等待输入数据...</p>
                     </div>
                 ) : mode === 'calculator' && scoreResult && ratingResult ? (
                     <div className="animate-in zoom-in-95 fade-in duration-500 w-full relative z-10 space-y-8">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-container/30 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
                         
                         <div>
                            <div className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-2">Total Score</div>
                            <div className="text-7xl md:text-8xl font-black text-on-surface tracking-tighter tabular-nums mb-2 font-google-sans drop-shadow-sm">
                                <CountUp value={scoreResult.score} />
                            </div>
                         </div>

                         <div className="flex flex-col items-center gap-4">
                            <div className="inline-flex items-center bg-secondary-container text-on-secondary-container rounded-full pl-2 pr-5 py-2 gap-3 shadow-md border border-outline/5 transition-transform hover:scale-105">
                                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary font-black text-sm">R</div>
                                <div className="text-3xl font-black tabular-nums tracking-tight font-google-sans">
                                    {ratingResult.rating.toFixed(2)}
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-outline tracking-wider">预测单曲 Rating</span>
                         </div>
                         
                         <div className="flex flex-wrap gap-2 justify-center pt-4 min-h-[2rem]">
                            {isNewRecord && <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container border border-outline/10">B30 可能提升</span>}
                            {getR5Status() && <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary-container text-on-primary-container border border-outline/10">可计入 R5</span>}
                         </div>

                         <div className="pt-8 grid grid-cols-2 gap-4 max-w-xs mx-auto opacity-50 border-t border-outline/10">
                             <div className="space-y-1">
                                 <div className="text-[9px] font-black uppercase tracking-widest">基础得分</div>
                                 <div className="font-mono text-xs">{scoreResult.baseScore.toLocaleString()}</div>
                             </div>
                             <div className="space-y-1">
                                 <div className="text-[9px] font-black uppercase tracking-widest">连击得分</div>
                                 <div className="font-mono text-xs">{scoreResult.comboScore.toLocaleString()}</div>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="animate-in zoom-in-95 fade-in duration-500 w-full relative z-10 space-y-10">
                          {toleranceResult?.maxTunesFC === -1 ? (
                              <div className="text-error font-black text-2xl">目标分数超出理论极限</div>
                          ) : (
                              <>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black tracking-[0.3em] text-tune uppercase">Max Tunes (FC)</div>
                                    <div className="text-8xl md:text-9xl font-black text-tune tracking-tighter tabular-nums font-google-sans">
                                        {toleranceResult?.maxTunesFC}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-3">
                                     <div className="px-6 py-3 rounded-2xl bg-primary-container/20 border border-primary/10 flex flex-col items-center">
                                         <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">预测单曲 Rating</span>
                                         <span className="text-4xl font-black text-on-surface tabular-nums font-google-sans">
                                             {toleranceResult?.estimatedRating.toFixed(4)}
                                         </span>
                                     </div>
                                </div>
                              </>
                          )}
                     </div>
                 )}
              </div>
          </div>
      </div>

      <footer className="w-full max-w-5xl mx-auto mt-20 py-12 border-t border-outline/10 text-center space-y-4">
          <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-bold text-outline tracking-tight transition-colors hover:text-primary">
                  2026 © <span className="opacity-80">Chongxi & CEPATO</span>
              </p>
              <p className="text-[10px] font-black text-outline/50 uppercase tracking-[0.3em]">
                  Powered by CEPATECH v4 & Cloudflare
              </p>
          </div>
          <div className="flex justify-center gap-6 pt-2">
              <a href="https://github.com/ChongxiSama/lanota-score-calculator" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-outline/60 hover:text-primary transition-all tracking-widest uppercase flex items-center gap-1.5 group">
                  <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.011-1.04-.015-2.038-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
              </a>
              <a href="https://afdian.com/a/CEPATO" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-outline/60 hover:text-primary transition-all tracking-widest uppercase opacity-80 hover:opacity-100 border border-outline/20 px-3 py-1 rounded-full">
                  Support us
              </a>
          </div>
      </footer>

      <div className={cn(
        "fixed inset-0 bg-black/40 z-40 transition-opacity duration-500 backdrop-blur-sm",
        activeField ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setActiveField(null)} />
      
      <NumberPad isVisible={!!activeField} label={activeLabel} value={activeValue} onInput={handleInput} onDelete={handleDelete} onClear={handleClear} onDone={handleDone} />

    </main>
  );
}
