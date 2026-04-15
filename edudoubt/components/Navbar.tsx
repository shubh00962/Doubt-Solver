'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const role = (session?.user as any)?.role;

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') { setDark(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-xl text-[#6C63FF]">EduDoubt</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/doubt" className="text-gray-600 dark:text-gray-300 hover:text-[#6C63FF] font-medium transition-colors">Ask Doubt</Link>
            <Link href="/experts" className="text-gray-600 dark:text-gray-300 hover:text-[#6C63FF] font-medium transition-colors">Experts</Link>
            {session && (
              <Link href={role === 'expert' ? '/dashboard/expert' : role === 'admin' ? '/admin' : '/dashboard/student'}
                className="text-gray-600 dark:text-gray-300 hover:text-[#6C63FF] font-medium transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme">
              {dark ? '☀️' : '🌙'}
            </button>

            {session ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <img
                    src={(session.user as any)?.image || `https://ui-avatars.com/api/?name=${session.user?.name}&background=6C63FF&color=fff`}
                    alt="avatar" className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-sm font-medium">{session.user?.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                    <Link href={role === 'expert' ? '/dashboard/expert' : '/dashboard/student'}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                <Link href="/signup" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
