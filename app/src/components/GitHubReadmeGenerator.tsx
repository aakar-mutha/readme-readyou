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

// interface GitHubReadmeGeneratorProps {
//   setIsGenerating: (isGenerating: boolean) => void;
// }

export default function GitHubReadmeGenerator() {
  const [username, setUsername] = useState("");
  const [readme, setReadme] = useState("");
  const [editableReadme, setEditableReadme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReadmeChanged, setIsReadmeChanged] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

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
    // setIsGenerating(true);

    try {
      // First, check if README exists in MongoDB
      const checkResponse = await fetch(`/api/check-readme/${username}`);
      if (!checkResponse.ok) {
        throw new Error('Failed to check for existing README');
      }
      const { exists, readme: existingReadme } = await checkResponse.json();

      if (exists) {
        // const updatedReadme = existingReadme + '\n\n[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/aakar)';
        setReadme(existingReadme);
        setEditableReadme(existingReadme); // Add this line
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
        setEditableReadme(readmeWithCoffee);
        setIsEditing(false);
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
        setShowCopyTooltip(true);
        setTimeout(() => {
          setCopySuccess(false);
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

  return (
    <div className="w-full max-w-4xl mx-auto"> {/* Changed from max-w-2xl to max-w-4xl */}
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-2xl font-bold text-dark-1 dark:text-zinc-200 mb-2 sm:mb-0">Generated README:</h2>
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
                  p: ({node, ...props}) => <p className="whitespace-pre-wrap" {...props} />
                }}
              >
                {readme}
              </ReactMarkdown>
            )}
          </div>
          <p className="mt-4 text-sm text-text-secondary dark:text-zinc-400">
            Markdown: <code className="bg-bg-secondary dark:bg-zinc-700 px-2 py-1 rounded text-text dark:text-zinc-300">{`![Funny README](${process.env.NEXT_PUBLIC_BASE_URL}/api/embed/${username})`}</code>
          </p>
        </div>
      )}
    </div>
  );
}