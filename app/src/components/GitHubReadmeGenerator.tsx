"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaCopy, FaEdit, FaSave } from 'react-icons/fa';
import { ImCross } from "react-icons/im";

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

type GenerationMode = 'standard' | 'minimal' | 'detailed' | 'creative';

export default function GitHubReadmeGenerator() {
  const [username, setUsername] = useState("");
  const [readme, setReadme] = useState("");
  const [editableReadme, setEditableReadme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isReadmeChanged, setIsReadmeChanged] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('standard');
  const [currentMode, setCurrentMode] = useState<GenerationMode | null>(null);
  const [isDefaultReadme, setIsDefaultReadme] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsReadmeChanged(readme !== editableReadme);
  }, [readme, editableReadme]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [isEditing, editableReadme]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const generateReadme = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a GitHub username.");
      return;
    }
    setIsLoading(true);
    setError("");
    setReadme("");

    try {
      // Check if README exists in MongoDB for the selected mode
      const checkResponse = await fetch(`/api/check-readme/${username}?mode=${generationMode}`);
      if (!checkResponse.ok) {
        throw new Error('Failed to check for existing README');
      }
      const { exists, readme: existingReadme, mode: existingMode, isDefault } = await checkResponse.json();

      if (exists && existingMode === generationMode) {
        setReadme(existingReadme);
        setEditableReadme(existingReadme);
        setCurrentMode(existingMode);
        setIsDefaultReadme(isDefault);
      } else {
        // If README doesn't exist or a different mode is selected, generate a new one
        const githubResponse = await fetch(`/api/github/${username}`);
        if (!githubResponse.ok) {
          throw new Error('Failed to fetch GitHub data');
        }
        const githubData: GitHubData = await githubResponse.json();

        const generateResponse = await fetch('/api/generate-readme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, userData: githubData.user, repos: githubData.repos, mode: generationMode }),
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to generate README');
        }

        const { readme: generatedReadme, mode: generatedMode } = await generateResponse.json();
        
        const readmeWithCoffee = generatedReadme + '\n\n[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/aakar)';
        
        setReadme(readmeWithCoffee);
        setEditableReadme(readmeWithCoffee);
        setCurrentMode(generatedMode);
        setIsDefaultReadme(false); // New README is not default
      }
      setIsEditing(false);
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
        setShowCopyTooltip(true);
        setTimeout(() => {
          setShowCopyTooltip(false);
        }, 2000); // Hide after 2 seconds
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, readme: editableReadme }),
      });

      if (!response.ok) {
        throw new Error('Failed to save README');
      }

      setReadme(editableReadme);
      setIsEditing(false);
      setIsReadmeChanged(false);
      // You might want to show a success message here
    } catch (error) {
      console.error('Error saving README:', error);
      setError('Failed to save README. Please try again.');
    }
  };

  const handleDiscard = () => {
    setEditableReadme(readme);
    setIsEditing(false);
    setIsReadmeChanged(false);
  };

  const setAsDefaultReadme = async () => {
    try {
      const response = await fetch('/api/set-default-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, mode: currentMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default README');
      }

      setIsDefaultReadme(true);
      // You might want to show a success message here
    } catch (error) {
      console.error('Error setting default README:', error);
      setError('Failed to set default README. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={generateReadme} className="mb-8 bg-bg-secondary dark:bg-zinc-800 rounded-lg shadow-lg p-6">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="Enter GitHub username"
          className="w-full p-4 border-2 border-accent-light rounded-lg bg-bg dark:bg-zinc-700 text-text dark:text-zinc-200 focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm transition-all duration-300 ease-in-out text-lg mb-4"
        />
        <select
          value={generationMode}
          onChange={(e) => setGenerationMode(e.target.value as GenerationMode)}
          className="w-full p-4 border-2 border-accent-light rounded-lg bg-bg dark:bg-zinc-700 text-text dark:text-zinc-200 focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm transition-all duration-300 ease-in-out text-lg mb-4"
        >
          <option value="standard">Standard</option>
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
          <option value="creative">Creative</option>
        </select>
        <button
          type="submit"
          className={`w-full ${
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-dark-1 dark:text-zinc-200 mb-2 sm:mb-0">Generated README:</h2>
              {currentMode && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mode: {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  onClick={copyToClipboard}
                  className="bg-accent hover:bg-accent-torch text-white font-bold p-2 rounded transition duration-300 ease-in-out flex items-center"
                  title="Copy README"
                >
                  <FaCopy/>
                </button>
                {showCopyTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow">
                    Copied!
                  </div>
                )}
              </div>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className={`bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out flex items-center ${!isReadmeChanged && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isReadmeChanged}
                    title="Save Changes"
                  >
                    <FaSave/>
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out flex items-center"
                    title="Discard Changes"
                  >
                    <ImCross />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out flex items-center"
                  title="Edit README"
                >
                  <FaEdit/>
                </button>
              )}
              <button
                onClick={setAsDefaultReadme}
                className={`bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out flex items-center ${isDefaultReadme ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDefaultReadme}
                title={isDefaultReadme ? 'Current default for embed' : 'Set as default for embed'}
              >
                {isDefaultReadme ? '✓ Default' : 'Set as Default'}
              </button>
            </div>
          </div>
          <div className="bg-bg dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto text-text dark:text-zinc-300">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editableReadme}
                onChange={(e) => {
                  setEditableReadme(e.target.value);
                  adjustTextareaHeight();
                }}
                className="w-full min-h-[24rem] p-2 bg-bg dark:bg-zinc-900 text-text dark:text-zinc-300 border border-gray-300 dark:border-gray-700 rounded resize-none overflow-hidden"
              />
            ) : (
              <ReactMarkdown 
                className="prose dark:prose-invert max-w-none"
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({...props}) => <p className="whitespace-pre-wrap" {...props} />
                }}
              >
                {readme}
              </ReactMarkdown>
            )}
          </div>
          {/* <p className="mt-4 text-sm text-text-secondary dark:text-zinc-400">
            Markdown: <code className="bg-bg-secondary dark:bg-zinc-700 px-2 py-1 rounded text-text dark:text-zinc-300">{`![Funny README](${process.env.NEXT_PUBLIC_BASE_URL}/api/embed/${username})`}</code>
          </p> */}
           <div className="mt-6 bg-bg dark:bg-zinc-900 p-4 rounded-lg text-text dark:text-zinc-300">
            <h3 className="text-xl font-bold mb-2">Use the embed link:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create a new repository on GitHub named exactly <code className="bg-bg-secondary dark:bg-zinc-700 px-2 py-1 rounded">{username}</code> (your username).</li>
              <li>Create a new file in this repository named <code className="bg-bg-secondary dark:bg-zinc-700 px-2 py-1 rounded">README.md</code>.</li>
              <li>Add the following line to your README.md file:</li>
            </ol>
            <pre className="bg-bg-secondary dark:bg-zinc-700 p-2 rounded mt-2 overflow-x-auto">
              <code>{`![README-READYOU](${process.env.NEXT_PUBLIC_BASE_URL}/api/embed/${username})`}</code>
            </pre>
            <p className="mt-2">This will display your generated README as an image in your GitHub profile.</p>
          </div>
        </div>
      )}
    </div>
  );
}