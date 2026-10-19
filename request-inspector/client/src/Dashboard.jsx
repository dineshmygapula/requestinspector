import { useCallback, useEffect, useState } from 'react';
import { request } from './api.js';

const statusClass = (s) => (s >= 500 ? 'bad' : s >= 400 ? 'warn' : s >= 300 ? 'info' : 'ok');

export default function Dashboard({ token, email, onLogout }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ method: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const q = new URLSearchParams({ ...filters, page, limit: 15 });
    for (const [k, v] of [...q]) if (!v) q.delete(k);
    try {
      const [s, l] = await Promise.all([
        request('/logs/stats', { token }),
        request(`/logs?${q}`, { token }),
      ]);
      setStats(s);
      setLogs(l);
    } catch (err) {
      if (err.status === 401) onLogout();
    }
  }, [filters, page, token, onLogout]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000); // auto refresh
    return () => clearInterval(id);
  }, [load]);

  async function fire(label, path, opts = {}) {
    try {
      await request(path, opts);
      setNote(`${label}: success`);
    } catch (err) {
      setNote(`${label}: ${err.status || ''} ${err.message}`);
    }
    load();
  }

  const setFilter = (k) => (e) => { setPage(1); setFilters({ ...filters, [k]: e.target.value }); };

  return (
    <div className="wrap">
      <header>
        <h1>Request Inspector</h1>
        <div><span className="muted">{email}</span> <button onClick={onLogout}>Logout</button></div>
      </header>

      <section className="stats">
        <div className="card"><span className="muted">Total requests</span><b>{stats?.total ?? '-'}</b></div>
        <div className="card"><span className="muted">Avg response</span><b>{stats ? `${stats.avgMs} ms` : '-'}</b></div>
        <div className="card"><span className="muted">Error rate</span><b>{stats ? `${stats.errorRate}%` : '-'}</b></div>
        <div className="card"><span className="muted">By method</span>
          <b className="small">{stats?.byMethod.map((m) => `${m._id}: ${m.count}`).join('  ') || '-'}</b></div>
      </section>

      <section className="card">
        <h2>Generate test traffic</h2>
        <div className="row">
          <button onClick={() => fire('GET /demo/ping', '/demo/ping')}>200 OK</button>
          <button onClick={() => fire('GET /demo/slow', '/demo/slow')}>Slow (800ms)</button>
          <button onClick={() => fire('GET /demo/error', '/demo/error')}>500 error</button>
          <button onClick={() => fire('GET /demo/protected', '/demo/protected')}>401 (no token)</button>
          <button onClick={() => fire('GET /demo/protected', '/demo/protected', { token })}>200 (with JWT)</button>
          <button onClick={() => fire('POST /demo/echo', '/demo/echo', { method: 'POST', body: { hello: 'world' } })}>POST 201</button>
          <button onClick={() => fire('GET /missing', '/missing')}>404</button>
        </div>
        {note && <p className="muted">{note}</p>}
      </section>

      <section className="card">
        <div className="row">
          <h2>Captured requests</h2>
          <select value={filters.method} onChange={setFilter('method')}>
            <option value="">All methods</option>
            {['GET', 'POST', 'PUT', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={filters.status} onChange={setFilter('status')}>
            <option value="">All status</option>
            {['2xx', '3xx', '4xx', '5xx'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="Search path" value={filters.search} onChange={setFilter('search')} />
          <button onClick={async () => { await request('/logs', { method: 'DELETE', token }); load(); }}>Clear</button>
        </div>

        <div className="scroll">
          <table>
            <thead><tr><th>Time</th><th>Method</th><th>Path</th><th>Status</th><th>Duration</th><th>IP</th></tr></thead>
            <tbody>
              {logs.items.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleTimeString()}</td>
                  <td>{l.method}</td>
                  <td className="path">{l.path}</td>
                  <td><span className={`badge ${statusClass(l.status)}`}>{l.status}</span></td>
                  <td>{l.durationMs} ms</td>
                  <td>{l.ip}</td>
                </tr>
              ))}
              {!logs.items.length && <tr><td colSpan="6" className="muted">No requests captured yet</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="row">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="muted">Page {logs.page} of {logs.pages || 1} ({logs.total} total)</span>
          <button disabled={page >= logs.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
}
