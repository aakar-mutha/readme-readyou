import { Metadata } from 'next';
import Navbar from './components/Navbar';
import GitHubReadmeGenerator from './components/GitHubReadmeGenerator';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: "ReadMe ReadYou",
  description: "Generate a funny GitHub README for your profile",
};

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-100 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 opacity-50"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto p-8 flex-grow">
          <h1 className="text-5xl font-bold text-blue-600 tracking-tight mb-8 text-center">
            Funny README Generator
          </h1>
          <GitHubReadmeGenerator />
        </main>
        <Footer />
      </div>
    </div>
  );
}
