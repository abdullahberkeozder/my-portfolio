'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OrchestraLogo from './OrchestraLogo';
import OrkestraWordmark from './OrkestraWordmark';
import { useModalDialog } from '../hooks/useModalDialog';
import { navigationActive, navigationContext, navigationItems } from '../lib/navigationModel';
import styles from './appHeader.module.css';
import {useAccountSummary} from '../hooks/useAccountSummary';
import AccountSignOut from './AccountSignOut';

export default function AppHeader({ conversations = false }: { conversations?: boolean }) {
  const pathname = usePathname();
  const account=useAccountSummary();
  const [open, setOpen] = useState(false);
  const [panelMode,setPanelMode]=useState<'account'|'menu'>('menu');
  const ref = useModalDialog<HTMLElement>(open, () => setOpen(false));
  const context = navigationContext(pathname);
  const roles=account.user?.roles??[];
  const professional=roles.includes('tradesperson');
  const operations=roles.includes('admin')||roles.includes('moderator');
  const effectiveContext=account.user
    ? context==='operations'&&operations?'operations':context==='professional'&&professional?'professional':context==='auth'?'auth':'customer'
    : context==='auth'?'auth':'public';
  const accountHref=`/hesap?workspace=${effectiveContext==='professional'?'professional':effectiveContext==='operations'?'operations':'customer'}`;
  const links = account.status==='ready'&&account.user
    ? navigationItems(effectiveContext,conversations).filter(item=>item.href!=='/hesap')
    : navigationItems(context==='auth'?'auth':'public',conversations).filter(item=>item.href!=='/hesap'&&item.href!=='/usta/kayit');
  if(account.user&&context==='public')links.unshift({href:'/ustalar',label:'Ustalar'},{href:'/#services',label:'Hizmetler'});
  const accountLinks=<>
    {account.status==='loading'?<p role="status">Hesap kontrol ediliyor…</p>:account.status==='error'?<p role="status">Hesap yüklenemedi. <Link href="/hesap">Hesabı kontrol et</Link></p>:account.user?<>
      <Link href={accountHref} onClick={()=>setOpen(false)}>Hesap ayarları</Link>
      {effectiveContext!=='customer'&&<Link href="/taleplerim" onClick={()=>setOpen(false)}>Müşteri alanına geç</Link>}
      {effectiveContext!=='professional'&&<Link href={professional?'/usta/talepler':'/usta-basvurusu'} onClick={()=>setOpen(false)}>{professional?'Usta alanına geç':'Usta başvurum'}</Link>}
      {operations&&<Link href={roles.includes('admin')?'/yonetim/uyusmazliklar':'/yonetim/moderasyon'} onClick={()=>setOpen(false)}>Yönetim alanı</Link>}
    </>:<><Link href="/giris" onClick={()=>setOpen(false)}>Giriş yap</Link><Link href="/kayit" onClick={()=>setOpen(false)}>Kayıt ol</Link><Link href="/usta/kayit" onClick={()=>setOpen(false)}>Usta olarak katıl</Link></>}
  </>;
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    if (href !== '/#services' || pathname !== '/') return;
    const target = document.getElementById('services');
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, '', '#services');
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      target.focus({ preventScroll: true });
    });
  }
  const items = links.map(item => <Link key={item.href} href={item.href}
    aria-current={navigationActive(pathname, item.href) ? 'page' : undefined}
    className={item.primary ? styles.primary : undefined}
    onClick={event => navigate(event, item.href)}>{item.label}</Link>);
  return <>
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Orkestra ana sayfa"><OrchestraLogo size={28} variant="primary" /><OrkestraWordmark /></Link>
        <nav className={styles.desktop} aria-label="Ana navigasyon">{items}</nav>
        <button className={styles.accountTrigger} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls="product-mobile-menu" onClick={()=>{setPanelMode('account');setOpen(true);}}>{account.status==='loading'?'Hesap…':account.user?'Hesabım':account.status==='error'?'Hesap':'Giriş / Kayıt'}<span aria-hidden="true">⌄</span></button>
        <button className={styles.menu} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls="product-mobile-menu" onClick={() => {setPanelMode('menu');setOpen(true);}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>Menü</button>
      </div>
    </header>
    {open && <div className={`${styles.backdrop} ${panelMode==='account'?styles.accountBackdrop:''}`} onClick={() => setOpen(false)}>
      <section ref={ref} id="product-mobile-menu" className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="product-menu-title" tabIndex={-1} onClick={event => event.stopPropagation()}>
        <div className={styles.drawerTop}><h2 id="product-menu-title">{panelMode==='account'?'Hesabım':'Menü'}</h2><button type="button" data-dialog-initial-focus onClick={() => setOpen(false)}>Kapat</button></div>
        <div className={styles.drawerBody}>
        {panelMode==='menu'&&<nav aria-label="Mobil navigasyon">{items}</nav>}
        <div className={styles.secondary}>
          {account.status==='ready'&&account.user&&<div className={styles.identity}>
            <span className={styles.avatar} aria-hidden="true">{account.user.name.slice(0,1).toLocaleUpperCase('tr-TR')}</span>
            <div><strong>{account.user.name}</strong><small>{effectiveContext==='professional'?'Usta alanı':effectiveContext==='operations'?'Yönetim alanı':'Müşteri alanı'}</small></div>
          </div>}
          <nav aria-label="Hesap işlemleri">
            {accountLinks}
            {context !== 'auth' && <Link href="/yardim" onClick={() => setOpen(false)}>Yardım ve destek</Link>}
          </nav>
        </div>
        {account.user&&<div className={styles.signOut}><AccountSignOut buttonClassName={styles.signOutButton}/></div>}
        </div>
      </section>
    </div>}
  </>;
}
