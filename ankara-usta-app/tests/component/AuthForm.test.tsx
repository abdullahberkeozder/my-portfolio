import {render,screen,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import AuthForm from '../../app/components/AuthForm';
const m=vi.hoisted(()=>({signUp:vi.fn(),signInWithPassword:vi.fn(),getUser:vi.fn(),eq:vi.fn(),push:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:m.push,refresh:vi.fn()})}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({auth:m,from:()=>({select:()=>({eq:m.eq})})})}));
vi.mock('../../app/components/NeighborhoodBond',()=>({default:()=>null}));
beforeEach(()=>{vi.clearAllMocks();m.signUp.mockResolvedValue({data:{session:null},error:null});m.signInWithPassword.mockResolvedValue({data:{session:{}},error:null});m.getUser.mockResolvedValue({data:{user:{id:'self'}}});m.eq.mockResolvedValue({data:[{role:'customer'}],error:null});});
afterEach(cleanup);
async function fill(signup=false){if(signup)await userEvent.type(screen.getByLabelText('Ad soyad'),'Test Kullanıcı');await userEvent.type(screen.getByLabelText('E-posta Adresi'),'test@example.com');await userEvent.type(screen.getByLabelText('Parola'),'example-passphrase');await userEvent.click(screen.getByRole('button',{name:signup?'Hesap Oluştur ve Devam Et →':'Giriş Yap →'}));}
it('records professional intent without requesting privileged roles',async()=>{
  render(<AuthForm audience="tradesperson" initialMode="sign-up"/>);await fill(true);
  expect(m.signUp).toHaveBeenCalledWith(expect.objectContaining({options:{data:{display_name:'Test Kullanıcı',registration_intent:'tradesperson'},emailRedirectTo:expect.stringContaining('next=%2Fusta-basvurusu')}}));
  expect(m.push).not.toHaveBeenCalled();expect(screen.getByRole('status')).toHaveTextContent('doğrulama');
});
it('sends an existing customer from professional login to the application, not a privileged panel',async()=>{
  render(<AuthForm audience="tradesperson"/>);await fill();expect(m.push).toHaveBeenCalledWith('/usta-basvurusu');expect(m.eq).toHaveBeenCalledWith('user_id','self');
});
it('uses database roles for professional panel access',async()=>{
  m.eq.mockResolvedValue({data:[{role:'customer'},{role:'tradesperson'}],error:null});render(<AuthForm audience="tradesperson"/>);await fill();expect(m.push).toHaveBeenCalledWith('/usta/talepler');
});
it('preserves wizard return across role selection and login',async()=>{
  const next='/?resume=1&service=tv-duvar-montaji';render(<AuthForm nextPath={next}/>);
  expect(screen.getByRole('link',{name:'Usta'})).toHaveAttribute('href',`/usta/giris?next=${encodeURIComponent(next)}`);await fill();expect(m.push).toHaveBeenCalledWith(next);
});
it('does not redirect after a role lookup failure',async()=>{
  m.eq.mockResolvedValue({data:null,error:{message:'private SQL'}});render(<AuthForm/>);await fill();expect(m.push).not.toHaveBeenCalled();expect(screen.getByRole('alert')).not.toHaveTextContent('private SQL');
});
