import Navbar from './src/components/Navbar';
import GitHubReadmeGenerator from './src/components/GitHubReadmeGenerator';
import Footer from './src/components/Footer';
import { Analytics } from "@vercel/analytics/react"
import Hero from './src/components/Hero';
import { seoData } from '../lib/metadata';

export const metadata = {
  title: seoData.title,
  description: seoData.description,
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    images: [{ url: seoData.image }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoData.title,
    description: seoData.description,
    images: [seoData.image],
  },
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
