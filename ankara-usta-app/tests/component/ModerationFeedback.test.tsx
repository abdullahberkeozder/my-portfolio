import {render,screen,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach,expect,it,vi} from 'vitest';
import ModerationQueue from '../../app/components/ModerationQueue';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
const item={id:'one',entityType:'review' as const,title:'İş değerlendirmesi',description:'İnceleme bekliyor',meta:'Yeni'};
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('focuses the visible reason field and prevents an incomplete decision',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);render(<ModerationQueue items={[item]}/>);
  await userEvent.click(screen.getByRole('button',{name:'Onayla'}));
  expect(screen.getByLabelText('Karar gerekçesi (zorunlu)')).toHaveFocus();
  expect(screen.getByRole('alert')).toHaveTextContent('en az 10 karakter');expect(fetch).not.toHaveBeenCalled();
});
it('preserves the reason and restores controls after a lost response',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));render(<ModerationQueue items={[item]}/>);
  await userEvent.type(screen.getByLabelText('Karar gerekçesi (zorunlu)'),'İş kaydıyla tutarlı içerik.');
  await userEvent.click(screen.getByRole('button',{name:'Onayla'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('yeniden karar vermeden önce');
  expect(screen.getByLabelText('Karar gerekçesi (zorunlu)')).toHaveValue('İş kaydıyla tutarlı içerik.');
  expect(screen.getByRole('button',{name:'Onayla'})).toBeEnabled();
});
