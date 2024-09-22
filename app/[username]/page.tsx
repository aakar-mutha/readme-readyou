"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from '../components/Navbar';

export default function UserPage() {
  const { username } = useParams();
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        // First, check if README exists in MongoDB
        const checkResponse = await fetch(`/api/check-readme/${username}`);
        if (!checkResponse.ok) {
          throw new Error('Failed to check for existing README');
        }
        const { exists, readme: existingReadme } = await checkResponse.json();

        if (exists) {
          setGeneratedReadme(existingReadme);
          setIsCached(true);
        } else {
          // If README doesn't exist, generate new README
          const generateResponse = await fetch('/api/generate-readme', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });

          if (!generateResponse.ok) {
            if (generateResponse.status === 404) {
              setError('User not found');
              return;
            }
            throw new Error('Failed to generate README');
          }

          const { readme: newReadme } = await generateResponse.json();
          setGeneratedReadme(newReadme);
          setIsCached(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadme();
  }, [username]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-2xl font-bold text-white">Loading...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-2xl font-bold text-red-400">{error}</div>
    </div>;
  }

  return (
    <div className="min-h-screen font-sans text-white bg-black">
      <Navbar />
      <div className="p-8 pb-20 sm:p-20">
        <h1 className="text-4xl font-extrabold mb-8 text-white">Funny GitHub README for {username}</h1>
        {isCached && <p className="text-sm text-gray-400 mb-4">This is a cached version of the README.</p>}
        <div className="w-full max-w-4xl mx-auto">
          <pre className="bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-sm text-gray-300 font-mono mb-8">
            {generatedReadme}
          </pre>
          <p className="mt-4 text-sm text-gray-400">
            Embed link: <code className="bg-gray-700 px-2 py-1 rounded text-white">{`${process.env.NEXT_PUBLIC_BASE_URL}/embed/${username}`}</code>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Markdown: <code className="bg-gray-700 px-2 py-1 rounded text-white">{`![Funny README](${process.env.NEXT_PUBLIC_BASE_URL}/embed/${username})`}</code>
          </p>
        </div>
      </div>
    </div>
  );
}