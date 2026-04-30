import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Sun, Moon } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen font-sans text-text-main flex flex-col transition-all duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-card-bg backdrop-blur-lg border-b border-card-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-xl font-medium tracking-tight text-text-main flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <CheckSquare className="w-4 h-4" />
              </div>
              TeamTaskScheduler
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-[15px] font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-card-border text-text-main' 
                        : 'text-text-muted hover:text-text-main hover:bg-card-border/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-muted hover:bg-card-border/50 hover:text-text-main transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-text-main leading-none">{user?.name}</span>
                <span className="text-xs text-text-muted mt-1">{user?.role}</span>
              </div>
              <div className="w-9 h-9 bg-card-bg border border-card-border rounded-full flex items-center justify-center text-xs font-bold text-text-main shadow-sm">
                {user?.name?.substring(0,2).toUpperCase()}
              </div>
            </div>
            <div className="w-px h-6 bg-card-border hidden sm:block mx-1"></div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 rounded-full text-[15px] font-medium text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut className="w-[18px] h-[18px] sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
}
