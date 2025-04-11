'use client';

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";

export default function Login() {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <InputGroup
          type="email"
          label="Email"
          className="mb-4 [&_label]:text-lg [&_input]:py-[15px] [&_input]:border-red-500"
          placeholder="Enter your email"
          name="email"
          handleChange={handleChange}
          value={data.email}
          // icon={<EmailIcon />}
        />

        <InputGroup
          type="password"
          label="Password"
          className="mb-5 [&_label]:text-lg [&_input]:py-[15px] [&_input]:border-red-500"
          placeholder="Enter your password"
          name="password"
          handleChange={handleChange}
          value={data.password}
          // icon={<PasswordIcon />}
        />

        {/* <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
          <Checkbox
            label="Remember me"
            name="remember"
            withIcon="check"
            minimal
            radius="md"
            onChange={(e) =>
              setData({
                ...data,
                remember: e.target.checked,
              })
            }
          />

          <Link
            href="/auth/forgot-password"
            className="hover:text-primary dark:text-white dark:hover:text-primary"
          >
            Forgot Password?
          </Link>
        </div> */}

        <div className="mb-4.5">
          <Link href="/" className="block">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
            >
              Login
            </button>
          </Link>
        </div>
      </form>

      {/* Dashboard Links */}
      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-600">
        <Link
          href="/users"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Go to User Dashboard
        </Link>
        <Link
          href="/"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Go to Admin Dashboard
        </Link>
      </div>
    </>
  );
}
