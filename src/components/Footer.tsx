import { Shield, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#1a222d] bg-[#07090c]/70 backdrop-blur-sm font-mono text-xs text-[#8a96a3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#22ff9c]" />
          <span>all payloads run in sandbox — stay legal, stay curious.</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-[#22ff9c] transition-colors"><Github className="w-4 h-4" /></a>
          <a href="#" className="hover:text-[#22ff9c] transition-colors"><Linkedin className="w-4 h-4" /></a>
          <span className="ml-2 text-[#4d5966]">v1.0.0 // built @ /dev/null</span>
        </div>
      </div>
    </footer>
  );
}
