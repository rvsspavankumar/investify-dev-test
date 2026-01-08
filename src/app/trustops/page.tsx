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

type ApplicantInfo = {
  email: string;
  profile: {
    name?: string | null;
    org?: string | null;
  } | null;
};

type VerificationRequestQueueItem = {
  id: string;
  status: string;
  desiredLanes: string[];
  applicant: ApplicantInfo;
  evidence: EvidenceItem[];
  events: VerificationEvent[];
};

export default function TrustOpsPage() {
  const [items, setItems] = useState<VerificationRequestQueueItem[]>([]);
  const [status, setStatus] = useState<string>("");

  async function refresh() {
    setStatus("Loading queue...");
    const res = await fetch("/api/trustops/verification/queue");
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus(`Error: ${data?.error ?? res.statusText}`);
      setItems([]);
      return;
    }

    setItems((data.items ?? []) as VerificationRequestQueueItem[]);
    setStatus(`Queue loaded: ${(data.items ?? []).length} item(s)`);
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function decide(id: string, toStatus: "IDENTITY_VERIFIED" | "UNABLE_TO_VERIFY") {
    setStatus(`Submitting decision: ${toStatus}...`);

    const res = await fetch("/api/trustops/verification/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verificationRequestId: id,
        toStatus,
        reasonCode: "REVIEWED",
        notes: `Set to ${toStatus} via Trust Ops UI`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(`Error: ${data?.error ?? res.statusText}`);
      return;
    }

    setStatus(`✅ Updated ${id} → ${toStatus}`);
    await refresh();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Trust Ops • Verification Queue</h1>
      <p className="text-sm text-gray-600">
        Make sure you are logged in as <b>TRUST_OPS_ADMIN</b>.
      </p>

      <div className="flex gap-2 items-center">
        <button className="border rounded px-3 py-2 text-sm" onClick={refresh}>
          Refresh Queue
        </button>
        {status && <div className="text-sm">{status}</div>}
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-600">No pending items.</div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <div key={r.id} className="border rounded p-4 space-y-2">
              <div className="text-sm">
                <div className="font-medium">Request ID: {r.id}</div>
                <div>Status: {r.status}</div>
                <div>
                  Applicant: {r.applicant?.email} — {r.applicant?.profile?.name ?? "No profile"}
                </div>
                <div>Org: {r.applicant?.profile?.org ?? "-"}</div>
                <div>Desired Lanes: {(r.desiredLanes ?? []).join(", ")}</div>
              </div>

              <div className="text-sm">
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

              <div className="flex gap-2">
                <button
                  className="border rounded px-3 py-2 text-sm"
                  onClick={() => decide(r.id, "IDENTITY_VERIFIED")}
                >
                  Approve: IDENTITY_VERIFIED
                </button>

                <button
                  className="border rounded px-3 py-2 text-sm"
                  onClick={() => decide(r.id, "UNABLE_TO_VERIFY")}
                >
                  Deny: UNABLE_TO_VERIFY
                </button>
              </div>

              <div className="text-sm">
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
    </main>
  );
}