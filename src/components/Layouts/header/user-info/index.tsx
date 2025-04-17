'use client';

import { useRouter } from 'next/navigation';
import { LogOutIcon } from './icons';
import Link from 'next/link';

export function UserInfo() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (res.ok) {
        router.push('/login');
      } else {
        console.error('[Logout] Failed to logout');
      }
    } catch (err) {
      console.error('[Logout] Unexpected error:', err);
    }
  };

  return (
    <div className="p-2 text-base text-blue-900 dark:text-dark-6">
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-dark-3 dark:hover:text-white"
      >
        <LogOutIcon />
        <span className="text-base font-medium">Log out</span>
      </button>
    </div>
  );
}
