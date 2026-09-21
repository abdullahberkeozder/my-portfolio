import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import PasswordUpdatePage from '../../app/parola-yenile/page';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  setSession: vi.fn(),
  updateUser: vi.fn(),
  unsubscribe: vi.fn(),
  authChange: undefined as undefined | ((event: string, session: unknown) => void),
}));

vi.mock('../../app/lib/supabase/browser', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: mocks.getUser,
      setSession: mocks.setSession,
      updateUser: mocks.updateUser,
      onAuthStateChange: (callback: typeof mocks.authChange) => {
        mocks.authChange = callback;
        return {data: {subscription: {unsubscribe: mocks.unsubscribe}}};
      },
    },
  }),
}));
vi.mock('../../app/components/NeighborhoodBond', () => ({default: () => null}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authChange = undefined;
  mocks.updateUser.mockResolvedValue({error: null});
  mocks.setSession.mockResolvedValue({error: null});
  window.history.replaceState(null, '', '/');
});
afterEach(cleanup);

it('does not expose the password form without an authenticated recovery session', async () => {
  mocks.getUser.mockResolvedValue({data: {user: null}});
  render(<PasswordUpdatePage />);

  expect(screen.getByRole('status')).toHaveTextContent('doğrulanıyor');
  expect(await screen.findByRole('alert')).toHaveTextContent('geçersiz veya süresi dolmuş');
  expect(screen.queryByLabelText('Yeni Parola')).not.toBeInTheDocument();
  expect(screen.getByRole('link', {name: 'Yeni bağlantı iste'})).toHaveAttribute('href', '/giris');
});

it('verifies an implicit recovery session and removes tokens from the address bar', async () => {
  window.history.replaceState(null, '', '/parola-yenile#access_token=access&refresh_token=refresh&type=recovery');
  mocks.getUser.mockResolvedValue({data: {user: {id: 'customer'}}});
  render(<PasswordUpdatePage />);

  await screen.findByLabelText('Yeni Parola');
  expect(mocks.setSession).toHaveBeenCalledWith({access_token: 'access', refresh_token: 'refresh'});
  expect(window.location.hash).toBe('');
  expect(window.location.pathname).toBe('/parola-yenile');
});

it('keeps mismatched passwords on screen and announces the error', async () => {
  mocks.getUser.mockResolvedValue({data: {user: {id: 'customer'}}});
  render(<PasswordUpdatePage />);
  const password = await screen.findByLabelText('Yeni Parola');

  await userEvent.type(password, 'new-password-1');
  await userEvent.type(screen.getByLabelText('Yeni Parola (Tekrar)'), 'new-password-2');
  await userEvent.click(screen.getByRole('button', {name: 'Parolayı güncelle'}));

  expect(screen.getByRole('alert')).toHaveTextContent('eşleşmiyor');
  expect(password).toHaveValue('new-password-1');
  expect(mocks.updateUser).not.toHaveBeenCalled();
});

it('updates the password once and replaces the form with a clear success route', async () => {
  mocks.getUser.mockResolvedValue({data: {user: {id: 'customer'}}});
  render(<PasswordUpdatePage />);
  const password = await screen.findByLabelText('Yeni Parola');

  await userEvent.type(password, 'new-password-1');
  await userEvent.type(screen.getByLabelText('Yeni Parola (Tekrar)'), 'new-password-1');
  await userEvent.click(screen.getByRole('button', {name: 'Parolayı güncelle'}));

  await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({password: 'new-password-1'}));
  expect(await screen.findByRole('status')).toHaveTextContent('başarıyla güncellendi');
  expect(screen.queryByLabelText('Yeni Parola')).not.toBeInTheDocument();
  expect(screen.getByRole('link', {name: 'Hesabıma git'})).toHaveAttribute('href', '/hesap');
});

it('unsubscribes from auth events when the page unmounts', async () => {
  mocks.getUser.mockResolvedValue({data: {user: {id: 'customer'}}});
  const view = render(<PasswordUpdatePage />);
  await screen.findByLabelText('Yeni Parola');
  view.unmount();
  expect(mocks.unsubscribe).toHaveBeenCalledOnce();
});
