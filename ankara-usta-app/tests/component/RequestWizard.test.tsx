import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RequestWizard from '../../app/components/RequestWizard';
import { services } from '../../app/data/serviceTaxonomy';

vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn(), refresh: vi.fn()}),
}));

const tvMounting = services.find((service) => service.id === 'tv-duvar-montaji');
// Wizard mechanics are tested separately from authenticated draft ownership.
vi.mock('../../app/components/AccountDraftBoundary',()=>({default:({children}:{children:(scope:unknown)=>unknown})=>children({key:'ankara-usta:draft:tv-duvar-montaji',storage:localStorage,guest:true})}));

describe('RequestWizard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('keeps the summary draft and offers a safe return URL after authentication is required', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({status:401,ok:false,json:async()=>({error:'Oturum açmanız gerekiyor.'})}));
    const draft={answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},district:'Çankaya',neighborhood:'Ayrancı',timing:'this_week',step:3,questionIndex:1,idempotencyKey:crypto.randomUUID(),updatedAt:Date.now()};
    localStorage.setItem('ankara-usta:draft:tv-duvar-montaji',JSON.stringify(draft));
    const view=render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);
    expect(screen.queryByRole('button',{name:'Talebi onayla ve gönder'})).toBeNull();
    expect(await screen.findByRole('link',{name:'Giriş yap / kayıt ol ve devam et'})).toHaveAttribute('href','/giris?next=%2F%3Fresume%3D1%26service%3Dtv-duvar-montaji');
    await waitFor(()=>expect(JSON.parse(localStorage.getItem('ankara-usta:draft:tv-duvar-montaji')!).step).toBe(3));
    view.unmount();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);
    expect(screen.getByRole('link',{name:'Giriş yap / kayıt ol ve devam et'})).toBeVisible();
    expect(JSON.parse(localStorage.getItem('ankara-usta:draft:tv-duvar-montaji')!).idempotencyKey).toBe(draft.idempotencyKey);
    expect(fetch).not.toHaveBeenCalled(); // Guests never persist remotely or auto-submit.
  });

  it('restores the exact question rather than jumping to the first unanswered question',()=>{
    localStorage.setItem('ankara-usta:draft:tv-duvar-montaji',JSON.stringify({answers:{'tv-size':'32–49 inç'},district:'',neighborhood:'',timing:'this_week',step:0,questionIndex:0,idempotencyKey:crypto.randomUUID(),updatedAt:Date.now()}));
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);
    expect(screen.getByRole('status',{name:'Talep aşaması: Kapsam'})).toBeInTheDocument();
  });

  it('rejects a restored answer that is no longer an available option',()=>{
    localStorage.setItem('ankara-usta:draft:tv-duvar-montaji',JSON.stringify({answers:{'tv-size':'retired-option'},district:'',neighborhood:'',timing:'this_week',step:0,questionIndex:0,idempotencyKey:crypto.randomUUID(),updatedAt:Date.now()}));
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()}/>);
    expect(screen.getByRole('button',{name:/Sonraki soru/})).toBeDisabled();
  });

  it('presents scope questions progressively and requires an answer before advancing', async () => {
    const user = userEvent.setup();

    expect(tvMounting).toBeDefined();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    let continueButton = screen.getByRole('button', { name: /Sonraki soru/i });
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByLabelText('32–49 inç'));
    expect(continueButton).toBeEnabled();
    await user.click(continueButton);

    expect(screen.getByText('Soru 2 / 3')).toBeVisible();
    expect(screen.getByRole('heading',{name:'Montaj yapılacak duvar türü nedir?'})).toHaveFocus();

    await user.click(screen.getByLabelText('Beton / tuğla'));
    continueButton = screen.getByRole('button', { name: /Sonraki soru/i });
    await user.click(continueButton);

    await user.click(screen.getByLabelText('Evet, hazır'));
    continueButton = screen.getByRole('button', { name: /Görsel ekleme adımına geç/i });

    expect(continueButton).toBeEnabled();
  });

  it('shows a single global stage model and validates oversized media before upload', async () => {
    const user = userEvent.setup();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    expect(screen.getByRole('status',{name:'Talep aşaması: Kapsam'})).toBeInTheDocument();
    expect(screen.getByText('Soru 1 / 3')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('32–49 inç'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Beton / tuğla'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Evet, hazır'));
    await user.click(screen.getByRole('button', { name: /Görsel ekleme adımına geç/i }));

    const oversized = new File(['x'], 'buyuk-video.mp4', { type: 'video/mp4' });
    Object.defineProperty(oversized, 'size', { value: 52_428_801 });
    await user.upload(screen.getByLabelText(/Fotoğraf veya video seçin/i), oversized);

    expect(screen.getByRole('alert')).toHaveTextContent(/50 MB sınırını aşıyor/i);
  });

  it('uses a visible default timing that matches the submitted value', async () => {
    const user = userEvent.setup();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    for (const option of ['32–49 inç', 'Beton / tuğla', 'Evet, hazır']) {
      await user.click(screen.getByLabelText(option));
      await user.click(screen.getByRole('button', { name: /Sonraki soruya geç|Görsel ekleme adımına geç/i }));
    }
    await user.click(screen.getByRole('button', { name: /Konum ve zamanı ekle/i }));

    expect(screen.getByRole('button', { name: 'Bu hafta içinde' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('explains the account and optional media requirements before submission', async () => {
    const user = userEvent.setup();

    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);

    expect(screen.getByText(/Göndermeden önce giriş yapmanız istenir/i)).toBeVisible();
    await user.click(screen.getByLabelText('32–49 inç'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Beton / tuğla'));
    await user.click(screen.getByRole('button', { name: /Sonraki soru/i }));
    await user.click(screen.getByLabelText('Evet, hazır'));
    await user.click(screen.getByRole('button', { name: /Görsel ekleme adımına geç/i }));

    expect(screen.getByRole('dialog', { name: /İsterseniz fotoğraf veya video ekleyin/i })).toBeVisible();
    expect(screen.getByText(/Yüklemeler herkese açık değildir/i)).toBeVisible();
  });

  it('exposes an accessible dialog title and close action', () => {
    const onClose = vi.fn();

    render(<RequestWizard service={tvMounting!} onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: 'TV Duvar Montajı' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
    expect(screen.getByRole('status',{name:'Talep aşaması: Kapsam'})).toBeInTheDocument();
  });

  it('moves focus into the modal and closes it with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<RequestWizard service={tvMounting!} onClose={onClose} />);

    expect(screen.getByRole('heading', {name:'Televizyonun ekran boyutu nedir?'})).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('locks body scroll only while the wizard is mounted',()=>{
    document.body.style.overflow='auto';
    const view=render(<RequestWizard service={tvMounting!} onClose={vi.fn()}/>);
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow='';
  });

  it('does not hijack Enter on the close button after answering', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RequestWizard service={tvMounting!} onClose={onClose} />);
    await user.click(screen.getByLabelText('32–49 inç'));
    screen.getByRole('button', {name: 'Kapat'}).focus();
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('status',{name:'Talep aşaması: Kapsam'})).toBeInTheDocument();
  });

  it('allows selected media to be removed and preserves it after an invalid selection', async () => {
    const user = userEvent.setup();
    render(<RequestWizard service={tvMounting!} onClose={vi.fn()} />);
    for (const option of ['32–49 inç', 'Beton / tuğla', 'Evet, hazır']) {
      await user.click(screen.getByLabelText(option));
      await user.click(screen.getByRole('button', {name: /Sonraki soruya geç|Görsel ekleme adımına geç/i}));
    }
    const input = screen.getByLabelText(/Fotoğraf veya video seçin/i);
    await user.upload(input, new File(['x'], 'test.jpg', {type:'image/jpeg'}));
    const oversized = new File(['x'], 'big.mp4', {type:'video/mp4'});
    Object.defineProperty(oversized, 'size', {value:52_428_801});
    await user.upload(input, oversized);
    expect(screen.getByText('test.jpg')).toBeVisible();
    await user.click(screen.getByRole('button', {name:'test.jpg dosyasını kaldır'}));
    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
  });
});
