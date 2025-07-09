"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useUserStore } from '@/lib/store';

export default function DashboardPage() {
  const { user } = useUserStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setDocuments(res.data);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }
    if (user?.token) fetchDocs();
    // eslint-disable-next-line
  }, [user?.token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents`, {
        title,
        content: '',
        language,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setDocuments([res.data, ...documents]);
      setTitle('');
    } catch (err) {
      setError('Failed to create document');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Documents</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="px-3 py-2 border rounded w-1/2"
          required
        />
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="typescript">TypeScript</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="ruby">Ruby</option>
          <option value="php">PHP</option>
          <option value="rust">Rust</option>
          <option value="kotlin">Kotlin</option>
          <option value="swift">Swift</option>
          <option value="scala">Scala</option>
          <option value="dart">Dart</option>
          <option value="r">R</option>
          <option value="perl">Perl</option>
          <option value="haskell">Haskell</option>
          <option value="elixir">Elixir</option>
          <option value="clojure">Clojure</option>
          <option value="shell">Shell</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li key={doc._id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold">{doc.title}</div>
                <div className="text-xs text-gray-500">{doc.language}</div>
              </div>
              <Link href={`/editor/${doc._id}`} className="text-blue-600 underline">Open</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 