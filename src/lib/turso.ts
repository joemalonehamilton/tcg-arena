/**
 * Turso HTTP API client — no native deps, works on any serverless platform.
 * Same pattern as network-crm/src/lib/db.ts
 */

const TURSO_URL = process.env.TURSO_DATABASE_URL || '';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

function getHttpUrl(): string {
  return TURSO_URL.replace('libsql://', 'https://');
}

export function isTursoConfigured(): boolean {
  return !!(TURSO_URL && TURSO_TOKEN);
}

interface TursoValue {
  type: string;
  value: string | null;
}

function encodeArg(a: unknown): TursoValue {
  if (a === null || a === undefined) return { type: 'null', value: null };
  if (typeof a === 'number') return Number.isInteger(a) ? { type: 'integer', value: String(a) } : { type: 'float', value: String(a) };
  return { type: 'text', value: String(a) };
}

export async function execute(
  sql: string,
  args: unknown[] = []
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
  const url = `${getHttpUrl()}/v2/pipeline`;

  const body = {
    requests: [
      {
        type: 'execute',
        stmt: {
          sql,
          args: args.map(encodeArg),
        },
      },
      { type: 'close' },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso HTTP error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const result = data.results?.[0]?.response?.result;

  if (!result) return { columns: [], rows: [] };

  const columns: string[] = result.cols?.map((c: { name: string }) => c.name) || [];
  const rows = (result.rows || []).map((row: TursoValue[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i]?.value ?? null;
    });
    return obj;
  });

  return { columns, rows };
}

export async function batch(
  statements: { sql: string; args?: unknown[] }[]
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }[]> {
  const url = `${getHttpUrl()}/v2/pipeline`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests: any[] = statements.map((stmt) => ({
    type: 'execute',
    stmt: {
      sql: stmt.sql,
      args: (stmt.args || []).map(encodeArg),
    },
  }));
  requests.push({ type: 'close' });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso HTTP error ${res.status}: ${text}`);
  }

  const data = await res.json();

  return (data.results || [])
    .filter((r: { type: string }) => r.type === 'ok')
    .map((r: { response: { result: { cols: { name: string }[]; rows: TursoValue[][] } } }) => {
      const result = r.response?.result;
      if (!result) return { columns: [], rows: [] };

      const columns: string[] = result.cols?.map((c) => c.name) || [];
      const rows = (result.rows || []).map((row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i]?.value ?? null;
        });
        return obj;
      });

      return { columns, rows };
    });
}
