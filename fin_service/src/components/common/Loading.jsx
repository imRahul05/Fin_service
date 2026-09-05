export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-foreground/5 duration-1000"></div>
        
        {/* Inner rotating ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-border/60 border-t-foreground"></div>
        
        {/* Dot placeholder inside */}
        <div className="absolute h-8 w-8 rounded-full bg-card border border-border/80 shadow-card flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-foreground animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading Text */}
      <h3 className="mt-6 text-xs font-semibold tracking-wider text-muted-foreground animate-pulse uppercase">
        Securing session...
      </h3>
    </div>
  );
}
