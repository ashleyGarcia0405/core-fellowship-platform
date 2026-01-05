import { useEffect, useState } from "react";
import { getJson } from "./lib/api";

type Health = { status: string; service: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getJson<Health>("/api/health")
      .then(setHealth)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">CORE Fellowship Platform</h1>

      <div className="mt-6 rounded-xl border p-4">
        <div className="text-sm text-gray-500">Gateway health</div>
        {err && <div className="mt-2 text-red-600">{err}</div>}
        {health ? (
          <pre className="mt-2 text-sm">{JSON.stringify(health, null, 2)}</pre>
        ) : (
          !err && <div className="mt-2 text-sm">Loading...</div>
        )}
      </div>
    </div>
  );
}
