"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import CollaborativeEditor from '@/components/editor/CollaborativeEditor';
import { useDocumentStore, useEditorStore } from '@/lib/store';
import ChatBox from '@/components/chat/ChatBox';
import VersionHistory from '@/components/editor/VersionHistory';
import PresenceList from '@/components/editor/PresenceList';
import { Document } from '@/lib/store';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const { setDocument, document } = useDocumentStore();
  const { setContent, setLanguage } = useEditorStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user && id) {
      fetchDocument();
    }
  }, [status, session, id, router]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${session?.user?.token || session?.token}` 
          },
        }
      );
      
      setDocument(response.data);
      setContent(response.data.content);
      setLanguage(response.data.language);
    } catch (err: any) {
      console.error('Failed to fetch document:', err);
      if (err.response?.status === 401) {
        router.push('/auth/signin');
      } else if (err.response?.status === 404) {
        setError('Document not found');
      } else {
        setError('Failed to load document. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;
    
    try {
      setSaving(true);
      setError('');
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${id}`,
        {
          content: document.content,
          updatedAt: new Date().toISOString()
        },
        {
          headers: { 
            Authorization: `Bearer ${session?.user?.token || session?.token}` 
          },
        }
      );
      
      // Update the document in store
      setDocument({
        ...document,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Failed to save document:', err);
      setError('Failed to save document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Document</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-x-3">
            <Button onClick={fetchDocument} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Document not found</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
              <p className="text-sm text-gray-500">
                {document.language.toUpperCase()} • 
                Last updated {new Date(document.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Editor Section */}
        <div className="flex-1 lg:border-r border-gray-200">
          <CollaborativeEditor
            documentId={document._id}
            initialContent={document.content}
            language={document.language}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="p-4 space-y-6">
            <PresenceList />
            <VersionHistory documentId={document._id} />
            <ChatBox documentId={document._id} />
          </div>
        </div>
      </div>
    </div>
  );
} 