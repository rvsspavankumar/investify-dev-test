"use client";

import { useState } from "react";

const DEMO_USERS = [
  // Paste your printed IDs here (from seed output)
  { label: "Applicant (Founder) — applicant@demo.com", id: "cmk3x6vc90000itabsyf4qyqh" },
  { label: "Decision Maker — investor@demo.com", id: "cmk3x6vch0002itab2mgp7zqk" },
  { label: "Institution Admin — instadmin@demo.com", id: "cmk3x6vck0004itab5u33dp5v" },
  { label: "Trust Ops Admin — trustops@demo.com", id: "cmk3x6vcl0005itab5f34eo06" },
];

export default function LoginPage() {
  const [userId, setUserId] = useState(DEMO_USERS[0].id);
  const [status, setStatus] = useState<string>("");

  async function login() {
    setStatus("Logging in...");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(`Failed: ${data?.error ?? res.statusText}`);
      return;
    }
    setStatus("Logged in! Try /api/auth/me");
  }

  async function logout() {
    setStatus("Logging out...");
    await fetch("/api/auth/logout", { method: "POST" });
    setStatus("Logged out.");
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Demo Login</h1>
      <p className="text-sm text-gray-600">
        This is a mock login for the take-home. Server-side RBAC is still enforced.
      </p>

      <select
        className="border rounded px-3 py-2 w-full"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      >
        {DEMO_USERS.map((u) => (
          <option key={u.id} value={u.id}>
            {u.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button onClick={login} className="border rounded px-4 py-2">
          Login
        </button>
        <button onClick={logout} className="border rounded px-4 py-2">
          Logout
        </button>
      </div>

      {status && <p className="text-sm">{status}</p>}

      <div className="text-sm">
        Test endpoint:{" "}
        <a className="underline" href="/api/auth/me" target="_blank" rel="noreferrer">
          /api/auth/me
        </a>
      </div>
    </main>
  );
}
