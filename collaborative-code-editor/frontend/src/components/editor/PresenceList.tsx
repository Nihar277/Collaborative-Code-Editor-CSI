"use client";
import { usePresenceStore } from '@/lib/store';

const PresenceList = () => {
  const { users } = usePresenceStore();

  if (!users.length) return null;

  return (
    <div className="border rounded p-2 bg-white mb-4">
      <h2 className="font-bold mb-2 text-sm">Online Users</h2>
      <ul className="space-y-1">
        {users.map((u: any, idx: any) => (
          <li key={idx} className="flex items-center text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block" />
            {u.username || 'User'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PresenceList; 