import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import AppHeader from '../../app/components/AppHeader';
import WorkspaceTabs from '../../app/components/WorkspaceTabs';
const path=vi.hoisted(()=>({value:'/ustalar'}));
vi.mock('next/navigation',()=>({usePathname:()=>path.value}));
vi.mock('../../app/hooks/useAccountSummary',()=>({useAccountSummary:()=>({status:'ready',user:null})}));
beforeEach(()=>{path.value='/ustalar';});
it('shows public discovery on professional directory, not privileged workspace navigation',()=>{
  render(<AppHeader/>);
  expect(screen.getByRole('link',{name:'Ustalar'})).toHaveAttribute('aria-current','page');
  expect(screen.queryByRole('link',{name:'İş fırsatları'})).not.toBeInTheDocument();
});
it('opens a named mobile menu, focuses close, and returns focus on Escape',async()=>{
  render(<AppHeader/>);const user=userEvent.setup();const trigger=screen.getByRole('button',{name:'Menü'});
  await user.click(trigger);
  const dialog=screen.getByRole('dialog',{name:'Menü'});
  expect(within(dialog).getByRole('button',{name:'Kapat'})).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
});
it('supports arrows, Home and End with a single tab stop',async()=>{
  function Demo(){const [active,setActive]=useState('messages');return <WorkspaceTabs active={active} onChange={setActive} panelId="test-panel" label="İş" items={[{id:'messages',label:'Mesajlar'},{id:'scope',label:'Kapsam'},{id:'history',label:'Geçmiş'}]}/>;}
  render(<Demo/>);const user=userEvent.setup();screen.getByRole('tab',{name:'Mesajlar'}).focus();
  await user.keyboard('{ArrowRight}');expect(screen.getByRole('tab',{name:'Kapsam'})).toHaveFocus();
  expect(screen.getByRole('tab',{name:'Kapsam'})).toHaveAttribute('aria-selected','true');
  await user.keyboard('{End}');expect(screen.getByRole('tab',{name:'Geçmiş'})).toHaveFocus();
  await user.keyboard('{Home}');expect(screen.getByRole('tab',{name:'Mesajlar'})).toHaveFocus();
  expect(screen.getAllByRole('tab').filter(tab=>tab.tabIndex===0)).toHaveLength(1);
});
