export async function asJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const maybeJson = contentType.includes('application/json');
  const body = maybeJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const message =
      typeof body === 'string'
        ? body
        : body && typeof body === 'object' && 'error' in body
          ? String((body as any).error)
          : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}

