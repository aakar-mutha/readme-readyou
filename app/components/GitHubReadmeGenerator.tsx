"use client";
import { useState } from "react";

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
}

interface GitHubData {
  user: {
    name: string;
    login: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
  };
  repos: Repo[];
}

export default function GitHubReadmeGenerator() {
  const [username, setUsername] = useState("");
  const [readme, setReadme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReadme = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setReadme("");

    try {
      // First, check if README exists in MongoDB
      const checkResponse = await fetch(`/api/check-readme/${username}`);
      if (!checkResponse.ok) {
        throw new Error('Failed to check for existing README');
      }
      const { exists, readme: existingReadme } = await checkResponse.json();

      if (exists) {
        setReadme(existingReadme);
      } else {
        // If README doesn't exist, fetch GitHub data and generate new README
        const githubResponse = await fetch(`/api/github/${username}`);
        if (!githubResponse.ok) {
          throw new Error('Failed to fetch GitHub data');
        }
        const githubData: GitHubData = await githubResponse.json();

        // Generate README using the /api/generate-readme endpoint
        const generateResponse = await fetch('/api/generate-readme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, userData: githubData.user, repos: githubData.repos }),
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to generate README');
        }

        const { readme: generatedReadme } = await generateResponse.json();
        setReadme(generatedReadme);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate README. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={generateReadme} className="mb-8">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:border-transparent"
        />
        <button
          type="submit"
          className="mt-4 w-full bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate README'}
        </button>
      </form>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {readme && (
        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">Generated README:</h2>
          <pre className="bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-sm text-gray-300 font-mono">{readme}</pre>
          <p className="mt-2 text-sm text-gray-400">
            Markdown: <code className="bg-gray-700 px-2 py-1 rounded text-white">{`![Funny README](${process.env.NEXT_PUBLIC_BASE_URL}/api/embed/${username})`}</code>
          </p>
        </div>
      )}
    </div>
  );
}