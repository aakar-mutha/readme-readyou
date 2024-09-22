import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4 bg-gray-100">
      <p className="text-sm text-gray-600 mb-2">
        Created with ❤️ by <a href="https://github.com/aakar-mutha" className="underline text-blue-600 hover:text-blue-800">Aakar Mutha</a>
      </p>
      <a href="https://buymeacoffee.com/aakar" target="_blank" rel="noopener noreferrer">
        <Image 
          src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" 
          alt="Buy Me A Coffee" 
          width={217} 
          height={60} 
          className="inline-block"
        />
      </a>
    </footer>
  );
};

export default Footer;