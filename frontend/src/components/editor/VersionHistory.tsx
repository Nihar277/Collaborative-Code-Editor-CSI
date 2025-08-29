"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useEditorStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

interface VersionHistoryProps {
  documentId: string;
}

interface Version {
  _id: string;
  content: string;
  author: string;
  timestamp: string;
  message: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ documentId }) => {
  const { data: session } = useSession();
  const { setContent } = useEditorStore();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.user || !documentId) return;
    fetchVersions();
  }, [documentId, session?.user]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = (session?.user as any)?.token || (session as any)?.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/versions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVersions(response.data.reverse());
    } catch (err: any) {
      console.error('Failed to load versions:', err);
      setError('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (version: Version) => {
    if (!confirm(`Are you sure you want to rollback to this version?\n\nMessage: ${version.message || 'No message'}`)) {
      return;
    }

    try {
      setContent(version.content);
      
      // Save as a new version
      const token = (session?.user as any)?.token || (session as any)?.token;
      if (token) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/versions`,
          {
            content: version.content,
            message: `Rollback to version from ${new Date(version.timestamp).toLocaleString()}`,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Refresh versions
        fetchVersions();
      }
    } catch (err: any) {
      console.error('Failed to rollback version:', err);
      alert('Failed to rollback version. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">Version History</h3>
        <div className="text-center text-gray-500 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Loading versions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">Version History</h3>
        <div className="text-red-500 text-sm text-center mb-2">{error}</div>
        <Button onClick={fetchVersions} variant="outline" size="sm" className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-sm text-gray-900">Version History ({versions.length})</h3>
      </div>
      
      {versions.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-gray-500 text-sm">No versions yet</p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <div className="p-3 space-y-2">
            {versions.map((version, idx) => (
              <div key={version._id || idx} className="border rounded p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">
                      Version {versions.length - idx}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(version.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRollback(version)}
                    variant="outline"
                    size="sm"
                    className="text-xs ml-2"
                  >
                    Rollback
                  </Button>
                </div>
                
                {version.message && (
                  <p className="text-xs text-gray-600 mb-2 italic">
                    "{version.message}"
                  </p>
                )}
                
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Author:</span> {version.author || 'Unknown'}
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  {version.content.length > 100 
                    ? `${version.content.substring(0, 100)}...` 
                    : version.content
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory; 