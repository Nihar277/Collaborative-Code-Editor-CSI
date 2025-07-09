import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import CollaborativeEditor from '@/components/editor/CollaborativeEditor';
import { useDocumentStore, useEditorStore, useUserStore } from '@/lib/store';
import ChatBox from '@/components/chat/ChatBox';
import VersionHistory from '@/components/editor/VersionHistory';
import PresenceList from '@/components/editor/PresenceList';

export default function EditorPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const { setDocument } = useDocumentStore();
  const { setContent, setLanguage } = useEditorStore();
  const { user } = useUserStore();

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setDocument(res.data);
        setContent(res.data.content);
        setLanguage(res.data.language);
      } catch (err) {
        // handle error
      }
    }
    if (id && user?.token) fetchDoc();
    // eslint-disable-next-line
  }, [id, user?.token]);

  const { document } = useDocumentStore();
  const { content } = useEditorStore();

  if (!document) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">{document.title}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <CollaborativeEditor
            documentId={document._id}
            initialContent={content}
            language={document.language}
          />
          <div className="mt-6">
            <ChatBox documentId={document._id} />
          </div>
        </div>
        <div className="w-full md:w-72">
          <PresenceList />
          <VersionHistory documentId={document._id} />
        </div>
      </div>
    </div>
  );
} 