export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (json as { error?: { message?: string } } | null)?.error?.message ??
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return (json as { data: T }).data;
}
