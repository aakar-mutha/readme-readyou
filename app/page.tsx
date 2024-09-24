import Navbar from './src/components/Navbar';
import GitHubReadmeGenerator from './src/components/GitHubReadmeGenerator';
import Footer from './src/components/Footer';
import { Analytics } from "@vercel/analytics/react"
import Hero from './src/components/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ReadMe ReadYou",
  description: "Generate a funny GitHub README for your profile",
};


export default function HomePage() {

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden font-inria-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-light to-bg opacity-50"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Analytics />
        <main className="container mx-auto px-4 flex-grow">
          <Hero />
          <GitHubReadmeGenerator />
        </main>
        <Footer />
      </div>
    </div>
  );
}
