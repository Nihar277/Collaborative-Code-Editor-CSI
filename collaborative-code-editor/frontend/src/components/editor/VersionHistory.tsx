import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore, useDocumentStore, useEditorStore } from '@/lib/store';

interface VersionHistoryProps {
  documentId: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ documentId }) => {
  const { user } = useUserStore();
  const { setContent } = useEditorStore();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/versions`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setVersions(res.data.reverse());
      } catch (err) {
        setError('Failed to load versions');
      } finally {
        setLoading(false);
      }
    }
    if (documentId && user?.token) fetchVersions();
    // eslint-disable-next-line
  }, [documentId, user?.token]);

  const handleRollback = async (version: any) => {
    setContent(version.content);
    // Optionally, save as a new version
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/versions`, {
      content: version.content,
      message: 'Rollback to previous version',
    }, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
  };

  if (loading) return <div>Loading versions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="border rounded p-2 bg-white max-h-64 overflow-y-auto">
      <h2 className="font-bold mb-2 text-sm">Version History</h2>
      <ul className="space-y-1">
        {versions.map((v, idx) => (
          <li key={idx} className="flex justify-between items-center text-xs border-b py-1">
            <div>
              <span className="font-semibold">{v.author}</span> - {new Date(v.timestamp).toLocaleString()}
              <span className="ml-2 text-gray-500">{v.message}</span>
            </div>
            <button
              className="px-2 py-1 bg-gray-200 rounded text-xs"
              onClick={() => handleRollback(v)}
            >
              Rollback
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory; 