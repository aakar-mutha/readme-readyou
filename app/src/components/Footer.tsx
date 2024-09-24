import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-secondary dark:bg-zinc-800 py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-text-secondary dark:text-zinc-400">
            Made with <span className="text-red-500">❤️</span> by <Link href="https://github.com/aakar-mutha" className="text-accent hover:underline">Aakar Mutha</Link>
          </p>
          <a href="https://www.buymeacoffee.com/aakar" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-accent text-white rounded-md">
            Buy me a coffee ☕
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;