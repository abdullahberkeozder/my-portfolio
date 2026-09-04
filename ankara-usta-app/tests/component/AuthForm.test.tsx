import {render,screen,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import AuthForm from '../../app/components/AuthForm';
const m=vi.hoisted(()=>({signUp:vi.fn(),signInWithPassword:vi.fn(),resetPasswordForEmail:vi.fn(),getUser:vi.fn(),eq:vi.fn(),push:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:m.push,refresh:vi.fn()})}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({auth:m,from:()=>({select:()=>({eq:m.eq})})})}));
vi.mock('../../app/components/NeighborhoodBond',()=>({default:()=>null}));
beforeEach(()=>{vi.clearAllMocks();m.signUp.mockResolvedValue({data:{session:null},error:null});m.signInWithPassword.mockResolvedValue({data:{session:{}},error:null});m.getUser.mockResolvedValue({data:{user:{id:'self'}}});m.eq.mockResolvedValue({data:[{role:'customer'}],error:null});});
afterEach(cleanup);
async function fill(signup=false){if(signup)await userEvent.type(screen.getByLabelText('Ad Soyad'),'Test Kullanıcı');await userEvent.type(screen.getByLabelText('E-posta Adresi'),'test@example.com');await userEvent.type(screen.getByLabelText('Parola'),'example-passphrase');await userEvent.click(screen.getByRole('button',{name:signup?'Hesap Oluştur ve Devam Et →':'Giriş Yap →'}));}
it('records professional intent without requesting privileged roles',async()=>{
  render(<AuthForm audience="tradesperson" initialMode="sign-up"/>);await fill(true);
  expect(m.signUp).toHaveBeenCalledWith(expect.objectContaining({options:{data:{display_name:'Test Kullanıcı',registration_intent:'tradesperson'},emailRedirectTo:expect.stringContaining('next=%2Fusta-basvurusu')}}));
  expect(m.push).not.toHaveBeenCalled();expect(screen.getByRole('status')).toHaveTextContent(/doğrulama/i);
});
it('sends an existing customer from professional login to the application, not a privileged panel',async()=>{
  render(<AuthForm audience="tradesperson"/>);await fill();expect(m.push).toHaveBeenCalledWith('/usta-basvurusu');expect(m.eq).toHaveBeenCalledWith('user_id','self');
});
it('uses database roles for professional panel access',async()=>{
  m.eq.mockResolvedValue({data:[{role:'customer'},{role:'tradesperson'}],error:null});render(<AuthForm audience="tradesperson"/>);await fill();expect(m.push).toHaveBeenCalledWith('/usta/talepler');
});
it('preserves wizard return across role selection and login',async()=>{
  const next='/?resume=1&service=tv-duvar-montaji';render(<AuthForm nextPath={next}/>);
  expect(screen.getByRole('link',{name:'Ustayım'})).toHaveAttribute('href',`/usta/giris?next=${encodeURIComponent(next)}`);await fill();expect(m.push).toHaveBeenCalledWith(next);
});
it('does not redirect after a role lookup failure',async()=>{
  m.eq.mockResolvedValue({data:null,error:{message:'private SQL'}});render(<AuthForm/>);await fill();expect(m.push).not.toHaveBeenCalled();expect(screen.getByRole('alert')).not.toHaveTextContent('private SQL');
});
it.each(['user_already_exists','email_exists'])('handles %s without claiming email delivery or exposing account existence',async(code)=>{
  m.signUp.mockResolvedValue({data:{session:null},error:{code,message:'private provider detail'}});
  render(<AuthForm audience="tradesperson" initialMode="sign-up" nextPath="/?resume=1"/>);await fill(true);
  expect(screen.getByRole('status')).toHaveTextContent('yeni kayıt yapılabiliyorsa');
  expect(screen.getByRole('status')).not.toHaveTextContent('private provider detail');
  expect(screen.getByRole('button',{name:'Hesap Oluştur ve Devam Et →'})).toBeDisabled();
  await userEvent.click(screen.getByRole('button',{name:'Mevcut hesabımla giriş yap'}));
  expect(screen.getByLabelText('E-posta Adresi')).toHaveValue('test@example.com');
  expect(screen.getByLabelText('Parola')).toHaveValue('');
  await userEvent.type(screen.getByLabelText('Parola'),'existing-password');
  await userEvent.click(screen.getByRole('button',{name:'Giriş Yap →'}));
  expect(m.push).toHaveBeenCalledWith('/?resume=1');
});
it('treats an obfuscated signup response like a new confirmation-required signup',async()=>{
  m.signUp.mockResolvedValue({data:{session:null,user:{identities:[]}},error:null});
  render(<AuthForm initialMode="sign-up"/>);await fill(true);
  expect(screen.getByRole('status')).toHaveTextContent('yeni kayıt yapılabiliyorsa');
  expect(m.getUser).not.toHaveBeenCalled();
  expect(screen.getByRole('button',{name:'Parolamı yenile'})).toBeEnabled();
});
it('offers recovery without a second signup and keeps feedback neutral',async()=>{
  m.resetPasswordForEmail.mockResolvedValue({error:null});
  render(<AuthForm initialMode="sign-up"/>);await fill(true);
  await userEvent.click(screen.getByRole('button',{name:'Parolamı yenile'}));
  expect(m.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com',expect.objectContaining({redirectTo:expect.stringContaining('/parola-yenile')}));
  expect(screen.getByRole('status')).toHaveTextContent('yapılabiliyorsa');
  expect(m.signUp).toHaveBeenCalledTimes(1);
});
it('does not query accounts or send emails when typing; edits clear stale feedback',async()=>{
  render(<AuthForm initialMode="sign-up"/>);
  await userEvent.type(screen.getByLabelText('E-posta Adresi'),'test@example.com');
  expect(m.signUp).not.toHaveBeenCalled();expect(m.eq).not.toHaveBeenCalled();
  await userEvent.clear(screen.getByLabelText('E-posta Adresi'));await fill(true);
  await userEvent.clear(screen.getByLabelText('E-posta Adresi'));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Hesap Oluştur ve Devam Et →'})).toBeEnabled();
});
