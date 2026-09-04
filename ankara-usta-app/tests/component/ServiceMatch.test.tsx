import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expect,it,vi} from 'vitest';
import Home from '../../app/page';
import Loading from '../../app/loading';
import ErrorPage from '../../app/error';
import NotFound from '../../app/not-found';
vi.mock('next/navigation',()=>({useRouter:()=>({replace:vi.fn()})}));
vi.mock('../../app/components/RequestWizard',()=>({default:({service}:{service:{name:string}})=><div role="dialog" aria-label="Talep sihirbazı">{service.name}</div>}));

it('shows scope text, switches alternatives in both directions and starts the chosen wizard',async()=>{
  const user=userEvent.setup();render(<Home/>);
  await user.click(within(screen.getByLabelText('Hızlı arama etiketleri')).getByRole('button',{name:'Musluk Değişimi'}));
  const dialog=screen.getByRole('dialog',{name:'İhtiyacınızı Doğru Anladık mı?'});
  expect(within(dialog).getByRole('heading',{level:3})).toHaveTextContent('Musluk Değişimi');
  await user.click(within(dialog).getByText('Kapsam hakkında'));
  expect(within(dialog).getAllByRole('listitem')).toHaveLength(6);
  for(const row of within(dialog).getAllByRole('listitem'))expect(row.textContent?.trim().length).toBeGreaterThan(5);
  const alternative=within(dialog).getByRole('button',{name:'Priz ve Anahtar Değişimi'});await user.click(alternative);
  expect(within(dialog).getByRole('heading',{level:3})).toHaveTextContent('Priz ve Anahtar Değişimi');
  expect(within(dialog).getByText('Alternatif hizmet')).toBeInTheDocument();
  await user.click(within(dialog).getByRole('button',{name:'Musluk Değişimi'}));
  await user.click(within(dialog).getByRole('button',{name:'Bu Hizmetle Devam Et →'}));
  expect(screen.getByRole('dialog',{name:'Talep sihirbazı'})).toHaveTextContent('Musluk Değişimi');
});
it('closes the match dialog with Escape and restores the search trigger',async()=>{
  const user=userEvent.setup();render(<Home/>);const trigger=within(screen.getByLabelText('Hızlı arama etiketleri')).getByRole('button',{name:'Musluk Değişimi'});
  await user.click(trigger);await user.keyboard('{Escape}');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
});
it.each(['loading','error','not-found'])('uses the current brand in %s state',state=>{
  const view=render(state==='loading'?<Loading/>:state==='error'?<ErrorPage error={new Error('test')} reset={vi.fn()}/>:<NotFound/>);
  expect(screen.getByRole('img',{name:'Orkestra'})).toBeInTheDocument();
  expect(view.container.querySelector('.orchestra-modules')?.querySelectorAll('circle')).toHaveLength(5);
  expect(view.container.querySelector('.neighborhood-bond')).not.toBeInTheDocument();
});
