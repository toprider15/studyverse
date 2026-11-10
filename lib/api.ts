export async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) }, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}