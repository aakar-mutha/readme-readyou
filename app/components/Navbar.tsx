import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">
              ReadMe ReadYou
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;