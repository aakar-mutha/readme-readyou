"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function EmbedPage() {
  const { username } = useParams();
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [readmeExists, setReadmeExists] = useState(true);

  const fetchReadme = async () => {
    setIsLoading(true);
    setError("");
    try {
      const checkResponse = await fetch(`/api/check-readme/${username}`);
      if (!checkResponse.ok) {
        throw new Error('Failed to check for existing README');
      }
      const { exists, readme } = await checkResponse.json();

      if (exists) {
        setGeneratedReadme(readme);
        setReadmeExists(true);
      } else {
        setReadmeExists(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewReadme = async () => {
    setIsLoading(true);
    setError("");
    try {
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
      setReadmeExists(true);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadme();
  }, [username]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-4 font-sans text-gray-800 dark:text-gray-200">Loading...</div>;
    }

    if (error) {
      return <div className="p-4 font-sans text-red-500">{error}</div>;
    }

    if (!readmeExists) {
      return (
        <div className="p-4 font-sans text-gray-800 dark:text-gray-200">
          <p className="mb-4">README not found for user: {username}</p>
          <button
            onClick={generateNewReadme}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition duration-300 ease-in-out"
          >
            Generate README
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 font-sans text-gray-800 dark:text-gray-200">
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {generatedReadme}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {renderContent()}
    </div>
  );
}