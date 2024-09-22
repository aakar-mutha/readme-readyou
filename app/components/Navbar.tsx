import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-gray-900 p-4">
      <div className="container mx-auto">
        <Link href="/" className="text-white text-2xl font-bold hover:text-gray-300">
          ReadMe ReadYou
        </Link>
      </div>
    </header>
  );
}