import { DEMO_PERSONAS, PERSONA_LIST } from "../../constants/personas.constants";
import { Sparkles, Users, RotateCcw } from "lucide-react";

export default function PersonaSelector({
  activePersonaId,
  onSelectPersona,
  onReset,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-cyan-50/60 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-cyan-950/30 p-4 shadow-sm backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive Persona Sandbox
              </h3>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Zero-Friction Demo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch Indian financial life stages instantly with pre-calculated portfolios & transactions.
            </p>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            type="button"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow transition"
            title="Reset sandbox numbers to default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
        )}
      </div>

      {/* Persona Pill Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {PERSONA_LIST.map((persona) => {
          const isSelected = activePersonaId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              type="button"
              className={`group text-left p-2.5 rounded-xl border transition-all relative ${
                isSelected
                  ? "bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {persona.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {persona.name}
                    </p>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {persona.role}
                  </p>
                </div>
              </div>

              {!compact && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {persona.badge}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {persona.tagline}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
