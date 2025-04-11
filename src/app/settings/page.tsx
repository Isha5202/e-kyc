import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Settings" />
      <div className="grid gap-6 p-6 rounded-lg bg-white shadow-md dark:bg-gray-dark">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>
        <ul className="space-y-4">
          <li>
            <Link href="/settings/api-credentials" className="text-primary hover:underline">
              ➤ API Credentials
            </Link>
          </li>
          <li>
            <Link href="/settings/balance" className="text-primary hover:underline">
              ➤ Balance
            </Link>
          </li>
          <li>
            <Link href="/settings/service-log" className="text-primary hover:underline">
              ➤ Service Log
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
