"use client";
import { usePresenceStore, UserPresence } from '@/lib/store';

const PresenceList = () => {
  const { users } = usePresenceStore();

  if (!users.length) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">Online Users</h3>
        <p className="text-gray-500 text-sm">No users currently online</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-sm text-gray-900">Online Users ({users.length})</h3>
      </div>
      <div className="p-3">
        <ul className="space-y-2">
          {users.map((user: UserPresence, idx: number) => (
            <li key={user.userId || idx} className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">Editing</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PresenceList; 