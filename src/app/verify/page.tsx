"use client";

import { useEffect, useState } from "react";

type EvidenceItem = {
  id: string;
  url: string;
  label: string | null;
};

type VerificationEvent = {
  id: string;
  fromStatus: string;
  toStatus: string;
  reasonCode: string;
};

type VerificationRequestUI = {
  id: string;
  status: string;
  desiredLanes: string[];
  evidence: EvidenceItem[];
  events: VerificationEvent[];
};


export default function VerifyPage() {
  const [desiredLanes, setDesiredLanes] = useState<string[]>(["CAPITAL"]);
  const [note, setNote] = useState("Requesting verification for founder profile");
  const [evidence1, setEvidence1] = useState("https://linkedin.com/in/ravi-demo");
  const [evidence2, setEvidence2] = useState("https://ravitech.example");
  const [status, setStatus] = useState<string>("");
  const [items, setItems] = useState<VerificationRequestUI[]>([]);


  async function refresh() {
    const res = await fetch("/api/verification/requests/me");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
  (async () => {
    try {
      await refresh();
    } catch {}
  })(); // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  async function submit() {
    setStatus("Submitting...");
    const res = await fetch("/api/verification/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        desiredLanes,
        note,
        evidence: [
          { url: evidence1, label: "LinkedIn" },
          { url: evidence2, label: "Website" },
        ],
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(`Error: ${data?.error ?? res.statusText}`);
      return;
    }
    setStatus("✅ Submitted!");
    await refresh();
  }

  function toggleLane(lane: string) {
    setDesiredLanes((prev) =>
      prev.includes(lane) ? prev.filter((x) => x !== lane) : [...prev, lane]
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Applicant • Verification</h1>
      <p className="text-sm text-gray-600">
        Submit a verification request (minimal UI). Make sure you are logged in as <b>Applicant</b>.
      </p>

      <div className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Submit Request</h2>

        <div className="space-y-2">
          <div className="text-sm font-medium">Desired Lanes</div>
          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={desiredLanes.includes("CAPITAL")}
              onChange={() => toggleLane("CAPITAL")}
            />
            CAPITAL
          </label>
          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={desiredLanes.includes("PILOT_PARTNERSHIP")}
              onChange={() => toggleLane("PILOT_PARTNERSHIP")}
            />
            PILOT_PARTNERSHIP
          </label>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Note</div>
          <textarea
            className="border rounded w-full p-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Evidence Links</div>
          <input
            className="border rounded w-full p-2 text-sm"
            value={evidence1}
            onChange={(e) => setEvidence1(e.target.value)}
            placeholder="LinkedIn URL"
          />
          <input
            className="border rounded w-full p-2 text-sm"
            value={evidence2}
            onChange={(e) => setEvidence2(e.target.value)}
            placeholder="Website URL"
          />
        </div>

        <button className="border rounded px-4 py-2" onClick={submit}>
          Submit Verification Request
        </button>

        {status && <div className="text-sm">{status}</div>}
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">My Requests</h2>
          <button className="border rounded px-3 py-1 text-sm" onClick={refresh}>
            Refresh
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-gray-600">No requests yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="border rounded p-3 text-sm">
                <div className="font-medium">Request: {r.id}</div>
                <div>Status: {r.status}</div>
                <div>Desired Lanes: {(r.desiredLanes ?? []).join(", ")}</div>
                <div className="mt-2">
                  <div className="font-medium">Evidence</div>
                  <ul className="list-disc ml-5">
                    {(r.evidence ?? []).map((e) => (
                      <li key={e.id}>
                        <a className="underline" href={e.url} target="_blank" rel="noreferrer">
                          {e.label ?? e.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <div className="font-medium">History</div>
                  <ul className="list-disc ml-5">
                    {(r.events ?? []).map((ev) => (
                      <li key={ev.id}>
                        {ev.fromStatus} → {ev.toStatus} ({ev.reasonCode})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
