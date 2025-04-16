'use client';

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import InputGroup from "../FormElements/InputGroup";
// import { EmailIcon, PasswordIcon } from "@/assets/icons"; // optional icons
// import { Checkbox } from "../FormElements/checkbox"; // optional if using remember me

export default function Login() {
  const router = useRouter();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Login failed");
      } else {
        const role = result.user.role;

        // 🔁 Redirect based on role
        if (role === "admin") {
          router.push("/");
        } else {
          router.push("/users");
        }
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <InputGroup
          type="email"
          label="Email"
          className="mb-4 [&_label]:text-lg [&_input]:py-[15px]"
          placeholder="Enter your email"
          name="email"
          handleChange={handleChange}
          value={data.email}
        />

        <InputGroup
          type="password"
          label="Password"
          className="mb-5 [&_label]:text-lg [&_input]:py-[15px]"
          placeholder="Enter your password"
          name="password"
          handleChange={handleChange}
          value={data.password}
        />

        <div className="mb-4.5">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>

      {/* Dashboard Links
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
      </div> */}
    </>
  );
}
