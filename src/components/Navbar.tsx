import { NavLink } from 'react-router-dom';
import { Home, Flag, CalendarClock, FileTerminal, Terminal } from 'lucide-react';

const items = [
  { to: '/', label: 'home', icon: Home },
  { to: '/ctfs', label: 'ctfs', icon: Flag },
  { to: '/upcoming', label: 'upcoming', icon: CalendarClock },
  { to: '/blog', label: 'blog', icon: FileTerminal },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#07090c]/70 border-b border-[#1a222d]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
        <NavLink to="/" className="flex items-center gap-2 group">
          <Terminal className="w-5 h-5 text-[#22ff9c] group-hover:flicker" />
          <span className="font-mono text-sm tracking-wider">
            <span className="text-[#22ff9c] glow-neon">hypn0s</span>
            <span className="text-[#8a96a3]">@kali</span>
            <span className="text-[#b061ff]">:~$</span>
          </span>
        </NavLink>

        <nav className="flex items-center gap-1 sm:gap-2 font-mono text-[13px]">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                  isActive
                    ? 'border-[#22ff9c]/60 text-[#22ff9c] bg-[#22ff9c]/5 border-neon-glow'
                    : 'border-transparent text-[#8a96a3] hover:text-[#d7e0e8] hover:border-[#1a222d] hover:bg-white/2'
                }`
              }
            >
              <Icon className="w-4 h-4" strokeWidth={1.6} />
              <span className="hidden sm:inline">./{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
