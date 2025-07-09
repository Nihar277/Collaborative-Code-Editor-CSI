import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-white border-b px-4 py-2 flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-bold text-lg text-blue-700">CSI Code Editor</Link>
      </div>
      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            <span className="text-sm">{session.user.username || session.user.email}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded text-sm"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className="text-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
} 