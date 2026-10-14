/** Node-only Gemini helper. Never import from the Remotion source tree. */
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function createGeminiClient(studio) {
  const key = parseEnv(readFileSync(resolve(studio, '.env'), 'utf8')).GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is missing. Its value is never displayed.');
  const redact = (value) => String(value).split(key).join('[REDACTED]').replace(/AIza[A-Za-z0-9_-]+/g, '[REDACTED]').replace(/https?:\/\/\S+/g, '[URL]').slice(0, 1000);
  async function api(path, body) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${path}`, {
      method: body ? 'POST' : 'GET', redirect: 'error',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(240000),
    });
    const data = await response.json();
    if (!response.ok) { const error = new Error(`Gemini HTTP ${response.status}: ${redact(data.error?.message || 'Request failed')}`); error.httpStatus = response.status; throw error; }
    return data;
  }
  async function download(uri, target) {
    for (let redirect = 0; redirect < 6; redirect++) {
      const url = new URL(uri); const apiHost = url.hostname === 'generativelanguage.googleapis.com';
      if (url.protocol !== 'https:' || !(apiHost || url.hostname.endsWith('.googleapis.com') || url.hostname.endsWith('.googleusercontent.com'))) throw new Error('Unexpected video download host.');
      const response = await fetch(uri, { headers: apiHost ? { 'x-goog-api-key': key } : {}, redirect: 'manual', signal: AbortSignal.timeout(240000) });
      if ([301, 302, 303, 307, 308].includes(response.status)) { uri = new URL(response.headers.get('location'), uri).href; continue; }
      if (!response.ok) throw new Error(`Download HTTP ${response.status}; generation is not resubmitted.`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 1000 || bytes.subarray(4, 8).toString() !== 'ftyp') throw new Error('Download is not an MP4.');
      writeFileSync(`${target}.tmp`, bytes); renameSync(`${target}.tmp`, target); return sha256(bytes);
    }
    throw new Error('Too many download redirects.');
  }
  return { api, download, redact };
}
