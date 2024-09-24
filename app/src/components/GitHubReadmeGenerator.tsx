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

// interface GitHubReadmeGeneratorProps {
//   setIsGenerating: (isGenerating: boolean) => void;
// }

export default function GitHubReadmeGenerator() {
  const [username, setUsername] = useState("");
  const [readme, setReadme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const generateReadme = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a GitHub username.");
      return;
    }
    setIsLoading(true);
    setError("");
    setReadme("");
    // setIsGenerating(true);

    try {
      // First, check if README exists in MongoDB
      const checkResponse = await fetch(`/api/check-readme/${username}`);
      if (!checkResponse.ok) {
        throw new Error('Failed to check for existing README');
      }
      const { exists, readme: existingReadme } = await checkResponse.json();

      if (exists) {
        const updatedReadme = existingReadme + '\n\n[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/aakar)';
        setReadme(updatedReadme);
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
        
        // Add "Buy Me A Coffee" button to the end of the README
        const readmeWithCoffee = generatedReadme + '\n\n[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/aakar)';
        
        setReadme(readmeWithCoffee);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate README. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(readme).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={generateReadme} className="mb-8 bg-bg-secondary dark:bg-zinc-800 rounded-lg shadow-lg p-6">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="Enter GitHub username"
          className="w-full p-4 border-2 border-accent-light rounded-lg bg-bg dark:bg-zinc-700 text-text dark:text-zinc-200 focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm transition-all duration-300 ease-in-out text-lg"
        />
        <button
          type="submit"
          className={`mt-4 w-full ${
            username.trim() 
              ? 'bg-accent hover:bg-accent-torch' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white p-4 rounded-lg transition duration-300 ease-in-out font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1`}
          disabled={isLoading || !username.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate README'}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4 bg-red-100 bg-opacity-50 backdrop-blur-lg rounded-lg p-4">{error}</p>}
      {readme && (
        <div className="bg-bg-secondary dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-dark-1 dark:text-zinc-200">Generated README:</h2>
            <button
              onClick={copyToClipboard}
              className="bg-accent hover:bg-accent-torch text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              {copySuccess ? 'Copied!' : 'Copy README'}
            </button>
          </div>
          <pre className="bg-bg dark:bg-zinc-900 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono overflow-x-auto text-text dark:text-zinc-300">{readme}</pre>
          <p className="mt-4 text-sm text-text-secondary dark:text-zinc-400">
            Markdown: <code className="bg-bg-secondary dark:bg-zinc-700 px-2 py-1 rounded text-text dark:text-zinc-300">{`![Funny README](${process.env.NEXT_PUBLIC_BASE_URL}/api/embed/${username})`}</code>
          </p>
        </div>
      )}
    </div>
  );
}