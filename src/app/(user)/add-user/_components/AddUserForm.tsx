import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Link from "next/link";

export function AddUserForm() {
  return (
    <div className="mx-auto w-full">
      <ShowcaseSection title="Add New User" className="!p-6.5">
        <form action="#" className="space-y-8">
          {/* Row: Name & Email */}
          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              label="Full Name"
              type="text"
              placeholder="Enter full name"
              className="w-full"
            />
            <InputGroup
              label="Email"
              type="email"
              placeholder="Enter email address"
              className="w-full"
            />
          </div>

          {/* Row: Password & Confirm Password */}
          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              label="Password"
              type="password"
              placeholder="Enter password"
              className="w-full"
            />
            <InputGroup
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              className="w-full"
            />
          </div>

          {/* Buttons: Back + Submit */}
          <div className="mt-6 flex gap-3">
            <Link
              href="/manage-user"
              className="h-[40px] rounded-lg border border-gray-300 px-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-dark-3"
            >
              Back
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Submit
            </button>
          </div>
        </form>
      </ShowcaseSection>
    </div>
  );
}
