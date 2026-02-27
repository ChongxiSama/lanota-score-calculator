import { cn } from "@/lib/utils";

interface NumberPadProps {
  isVisible: boolean;
  label?: string;
  value?: string | number;
  onInput: (num: number) => void;
  onDelete: () => void;
  onDone: () => void;
  onClear: () => void;
}

export default function NumberPad({ isVisible, label, value, onInput, onDelete, onDone, onClear }: NumberPadProps) {
  const easeEmphasized = "cubic-bezier(0.2, 0.0, 0, 1.0)";

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-surface-container-low rounded-t-[32px] shadow-2xl z-50 border-t border-outline/10 overflow-hidden transition-transform duration-400",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ transitionTimingFunction: easeEmphasized }}
    >
      <div className="bg-surface-container px-6 py-4 flex justify-between items-center border-b border-outline/5">
         <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-widest opacity-80">
              {label || "Edit"}
            </span>
            <span className="text-2xl font-medium text-on-surface tabular-nums tracking-tight">
              {value?.toString() || "0"}
              <span className="animate-pulse text-primary ml-0.5">|</span>
            </span>
         </div>
         <button 
            onClick={onDone}
            className="p-2 -mr-2 text-outline hover:text-on-surface transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
         </button>
      </div>

      <div className="p-4 pb-8 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2">
          {keys.map((num) => (
            <button
              key={num}
              onClick={() => onInput(num)}
              className="h-14 rounded-full bg-surface-container-high text-on-surface text-2xl font-medium shadow-sm active:bg-primary-container active:text-on-primary-container active:scale-90 transition-all duration-200 flex items-center justify-center select-none"
              style={{ transitionTimingFunction: easeEmphasized }}
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={onClear}
            className="h-14 rounded-full bg-error-container text-on-error-container font-medium text-sm shadow-sm active:scale-90 transition-all duration-200 flex items-center justify-center select-none hover:opacity-80"
            style={{ transitionTimingFunction: easeEmphasized, backgroundColor: 'var(--color-fail-container)', color: 'var(--color-on-fail-container)' }}
          >
            CLR
          </button>
          
          <button
            onClick={() => onInput(0)}
            className="h-14 rounded-full bg-surface-container-high text-on-surface text-2xl font-medium shadow-sm active:bg-primary-container active:text-on-primary-container active:scale-90 transition-all duration-200 flex items-center justify-center select-none"
            style={{ transitionTimingFunction: easeEmphasized }}
          >
            0
          </button>

          <button
            onClick={onDelete}
            className="h-14 rounded-full bg-surface-container-high text-on-surface shadow-sm active:bg-secondary-container active:text-on-secondary-container active:scale-90 transition-all duration-200 flex items-center justify-center select-none"
            style={{ transitionTimingFunction: easeEmphasized }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
          </button>
        </div>

        <button
          onClick={onDone}
          className="w-full mt-4 h-14 rounded-full bg-primary text-on-primary font-bold text-lg shadow-md active:shadow-none active:scale-[0.98] transition-all duration-200 flex items-center justify-center select-none"
          style={{ transitionTimingFunction: easeEmphasized }}
        >
          完成
        </button>
      </div>
    </div>
  );
}
