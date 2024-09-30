import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ReadmeEditorProps {
  username: string;
}

export default function ReadmeEditor({ username }: ReadmeEditorProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'EDIT_README' && event.data.username === username) {
        setIsEditing(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [username]);

  useEffect(() => {
    // Fetch the current README content when editing starts
    if (isEditing) {
      fetch(`/api/embed/${username}`)
        .then(response => response.text())
        .then(setContent);
    }
  }, [isEditing, username]);

  const handleSave = async () => {
    const response = await fetch(`/api/embed/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      setIsEditing(false);
      // Optionally, refresh the embedded SVG here
    } else {
      console.error('Failed to save README');
    }
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        cols={80}
      />
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
      <h3>Preview:</h3>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}