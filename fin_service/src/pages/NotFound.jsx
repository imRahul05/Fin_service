import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-card p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-muted border border-border flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-8 h-8 text-foreground animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            404
          </span>
          <h1 className="text-lg font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            The financial model or destination you are searching for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-semibold shadow-xs transition cursor-pointer w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;