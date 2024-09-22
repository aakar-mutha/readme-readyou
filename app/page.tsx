import Navbar from './components/Navbar';
import GitHubReadmeGenerator from './components/GitHubReadmeGenerator';

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans text-white bg-black">
      <Navbar />
      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white">
          Generate Your Funny GitHub README
        </h1>
        <GitHubReadmeGenerator />
      </main>
    </div>
  );
}
