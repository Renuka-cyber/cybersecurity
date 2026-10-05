import React from 'react';
import { Shield, Search, GraduationCap, Lock, Unlock, ShieldAlert, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onToggleAdmin,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="group flex items-center gap-2.5 text-left text-base font-bold tracking-tight text-white transition-opacity hover:opacity-90"
            title="Return to Department Landing Page"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-sm transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-100 sm:text-base">
                CSE Cyber Security
              </span>
              <span className="block text-xs font-normal text-slate-400">
                Department Portal
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden items-center gap-7 md:flex text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-cyan-400 ${
              currentView === 'home' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('academics')}
            className={`transition-colors hover:text-cyan-400 ${
              currentView === 'academics' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Academic Years & Notes
          </button>
          <button
            onClick={() => onNavigate('curriculum')}
            className={`transition-colors hover:text-cyan-400 ${
              currentView === 'curriculum' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Curriculum & Subjects
          </button>
          <button
            onClick={() => onNavigate('faculty')}
            className={`transition-colors hover:text-cyan-400 ${
              currentView === 'faculty' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Faculty & Labs
          </button>

          {/* Admin console link only visible to authenticated Admin */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 transition-colors hover:text-amber-400 ${
                currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-amber-300/80'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Role Indicator */}
        <div className="flex items-center gap-2.5">
          {/* Active Role Indicator */}
          <div className="hidden lg:flex items-center">
            {isAdmin ? (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Role: Department Admin
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Role: Student (View & Download)
              </span>
            )}
          </div>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-all shadow-sm"
            title="Search subjects and notes"
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 lg:inline font-mono">⌘K</kbd>
          </button>

          <button
            onClick={() => onNavigate('academics')}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              currentView === 'academics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Student Portal</span>
          </button>

          {/* Admin Mode Toggle / Auth */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isAdmin
                ? 'border border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 shadow-sm'
                : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title={isAdmin ? 'Switch back to Student Mode (Read-only)' : 'Authenticate as Faculty / Department Admin'}
          >
            {isAdmin ? (
              <>
                <LogOut className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Exit Admin Mode</span>
                <span className="inline sm:hidden">Logout</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Faculty / Admin Login</span>
                <span className="inline sm:hidden">Admin</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
