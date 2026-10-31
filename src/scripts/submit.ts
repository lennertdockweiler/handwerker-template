/**
 * Versand von Formularen. Ohne Endpoint (Demo-Modus) wird der Versand simuliert.
 * Mit Endpoint (Formspree, Web3Forms, eigener Server …) wird per POST gesendet.
 */
export async function submitForm(endpoint: string | undefined, data: FormData, accessKey?: string): Promise<{ ok: boolean; demo: boolean }> {
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, demo: true };
  }
  if (accessKey) data.append('access_key', accessKey);
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
    return { ok: res.ok, demo: false };
  } catch {
    return { ok: false, demo: false };
  }
}
