import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-700 text-sm hidden sm:inline-block">
          Chào mừng trở lại, <span className="text-indigo-600 font-bold">{user?.username}</span> 👋
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 text-slate-700 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold uppercase">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium hidden md:inline-block">{user?.username}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
