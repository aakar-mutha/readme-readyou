"use client"
import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-bg-secondary dark:bg-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-bold text-accent font-caveat">
              ReadMe ReadYou
            </Link>
          </div>
          <div className="flex items-center">
            {/* <Link href="/about" className="text-text-secondary hover:text-accent mx-3">About</Link>
            <Link href="/contact" className="text-text-secondary hover:text-accent mx-3">Contact</Link> */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;