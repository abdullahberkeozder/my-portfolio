import { beforeEach, expect, it, vi } from 'vitest';
import { POST } from '../../app/api/quotes/[id]/accept/route';
const mock = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), from: vi.fn(), eq: vi.fn(), read: vi.fn() }));
vi.mock('../../app/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ auth: { getUser: mock.getUser }, rpc: mock.rpc, from: mock.from }) }));
const id = 'f31e936b-d492-4d9b-a44a-a6ce932976d0';
const other = 'a31e936b-d492-4d9b-a44a-a6ce932976d0';
const send = (body: unknown = { expectedUserId: id }, quoteId = id) => POST(new Request('https://orkestra.invalid/api/quotes/x/accept', { method: 'POST', body: JSON.stringify(body) }), { params: Promise.resolve({ id: quoteId }) });
beforeEach(() => {
  vi.resetAllMocks();
  const chain = { select: vi.fn().mockReturnThis(), eq: mock.eq, maybeSingle: mock.read };
  mock.eq.mockReturnValue(chain); mock.from.mockReturnValue(chain);
  mock.getUser.mockResolvedValue({ data: { user: { id } }, error: null });
  mock.read.mockResolvedValue({ data: null, error: null });
  mock.rpc.mockResolvedValue({ data: { id }, error: null });
});
it('rejects invalid IDs and missing account context without mutations', async () => {
  expect((await send({}, id)).status).toBe(400);
  expect((await send({ expectedUserId: id }, 'bad')).status).toBe(400);
  expect(mock.rpc).not.toHaveBeenCalled();
});
it('rejects anonymous and changed accounts before any database read', async () => {
  expect((await send({ expectedUserId: other })).status).toBe(409);
  mock.getUser.mockResolvedValue({ data: { user: null } });
  expect((await send()).status).toBe(401);
  expect(mock.from).not.toHaveBeenCalled(); expect(mock.rpc).not.toHaveBeenCalled();
});
it('recovers an existing job only for the exact quote and authenticated customer', async () => {
  mock.read.mockResolvedValue({ data: { id: other }, error: null });
  const response = await send();
  expect(await response.json()).toEqual({ accepted: true, quoteId: id, jobId: other });
  expect(mock.eq).toHaveBeenCalledWith('accepted_quote_id', id);
  expect(mock.eq).toHaveBeenCalledWith('customer_id', id);
  expect(mock.rpc).not.toHaveBeenCalled();
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
it('dispatches to the existing RPC and returns the created job', async () => {
  mock.read.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: { id: other } });
  expect(await (await send()).json()).toMatchObject({ jobId: other });
  expect(mock.rpc).toHaveBeenCalledWith('accept_quote', { p_quote_id: id });
});
it('recovers a simulated lost race only when the same accepted quote has a job', async () => {
  mock.rpc.mockResolvedValue({ data: null, error: { code: 'P0001', message: 'private SQL' } });
  mock.read.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: { id: other } });
  expect((await send()).status).toBe(200);
  const rejected = await send();
  expect(rejected.status).toBe(409); expect(JSON.stringify(await rejected.json())).not.toContain('private SQL');
});
it('does not misreport a committed acceptance when the handoff read fails', async () => {
  mock.read.mockResolvedValueOnce({ data: null }).mockRejectedValueOnce(new Error('network'));
  expect(await (await send()).json()).toMatchObject({ accepted: true, jobId: null });
});
it('fails closed on initial read failure and sanitizes RPC permission errors', async () => {
  mock.read.mockResolvedValueOnce({ data: null, error: { code: '42501', message: 'private SQL' } });
  expect((await send()).status).toBe(403); expect(mock.rpc).not.toHaveBeenCalled();
  mock.rpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'private SQL' } });
  const response = await send(); expect(response.status).toBe(403);
  expect(JSON.stringify(await response.json())).not.toContain('private SQL');
});
