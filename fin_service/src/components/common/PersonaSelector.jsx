import { PERSONA_LIST } from "../../constants/personas.constants";
import { Sparkles, RotateCcw } from "lucide-react";

export default function PersonaSelector({
  activePersonaId,
  onSelectPersona,
  onReset,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`rounded-3xl border border-border/80 bg-card p-5 shadow-card ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-foreground text-background shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Interactive Persona Sandbox
              </h3>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                Zero-Friction Demo
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch Indian financial life stages instantly with pre-calculated portfolios & transactions.
            </p>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            type="button"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-card rounded-full border border-border/80 shadow-2xs hover:bg-muted transition cursor-pointer"
            title="Reset sandbox numbers to default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
        )}
      </div>

      {/* Persona Pill Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PERSONA_LIST.map((persona) => {
          const isSelected = activePersonaId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              type="button"
              className={`group text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-foreground text-background border-foreground shadow-2xs"
                  : "bg-muted/30 border-border/60 hover:bg-muted/70 hover:border-border text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {persona.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-background" : "text-foreground"}`}>
                      {persona.name}
                    </p>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className={`text-[11px] truncate ${isSelected ? "text-background/80" : "text-muted-foreground"}`}>
                    {persona.role}
                  </p>
                </div>
              </div>

              {!compact && (
                <div className={`mt-2.5 pt-2 border-t ${isSelected ? "border-background/20" : "border-border/60"}`}>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                  }`}>
                    {persona.badge}
                  </span>
                  <p className={`text-[10px] line-clamp-1 mt-1 ${isSelected ? "text-background/80" : "text-muted-foreground"}`}>
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
