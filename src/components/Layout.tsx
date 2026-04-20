import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="relative z-10 flex-1 pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
