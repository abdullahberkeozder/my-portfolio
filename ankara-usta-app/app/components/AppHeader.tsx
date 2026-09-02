'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { usePathname, useRouter } from 'next/navigation';
import OrchestraLogo from './OrchestraLogo';
import OrkestraWordmark from './OrkestraWordmark';
import { useModalDialog } from '../hooks/useModalDialog';

export type UserRole = 'visitor' | 'customer' | 'tradesperson' | 'admin';

type AppHeaderProps = {
  role?: UserRole;
};

type NavLinkProps = React.ComponentProps<typeof Link> & {
  active?: boolean;
};

function NavLink({ active = false, className, ...props }: NavLinkProps) {
  const classes = [className, active ? 'active' : ''].filter(Boolean).join(' ');

  return (
    <Link
      {...props}
      className={classes || undefined}
      aria-current={active ? 'page' : undefined}
    />
  );
}

export default function AppHeader({ role: explicitRole }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [busySignOut, setBusySignOut] = useState(false);
  const mobileMenuRef = useModalDialog<HTMLElement>(mobileMenu, () => setMobileMenu(false));

  // Determine active role based on explicit prop or pathname
  const detectedRole: UserRole = explicitRole || (() => {
    if (pathname.startsWith('/yonetim')) return 'admin';
    if (pathname.startsWith('/usta')) return 'tradesperson';
    if (pathname.startsWith('/taleplerim') || pathname.startsWith('/islerim')) return 'customer';
    return 'visitor';
  })();

  const closeMobileMenu = () => setMobileMenu(false);
  const servicesHref = pathname === '/' ? '#services' : '/#services';

  function handleServicesNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== '/') return;
    event.preventDefault();
    const target = document.getElementById('services');
    if (!target) return;
    window.history.pushState(null, '', '#services');
    closeMobileMenu();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      target.focus({preventScroll: true});
    }));
  }

  async function handleSignOut() {
    setBusySignOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/giris');
      router.refresh();
    } catch {
      router.push('/giris');
    } finally {
      setBusySignOut(false);
      closeMobileMenu();
    }
  }

  const roleLabels: Record<UserRole, { badge: string }> = {
    visitor: { badge: 'Ankara' },
    customer: { badge: 'Müşteri Alanı' },
    tradesperson: { badge: 'Usta Çalışma Alanı' },
    admin: { badge: 'Operasyon Yönetimi' },
  };
  const isLandingHeader = detectedRole === 'visitor' && pathname === '/';

  return (
    <>
      <header className={`tr-header app-unified-header ${isLandingHeader ? 'is-landing-header' : ''}`}>
        <div className="header-inner">
          <div className="brand-group">
            <Link href="/" className="tr-brand">
              <OrchestraLogo size={32} variant="primary" />
              <OrkestraWordmark />
            </Link>

            {detectedRole !== 'visitor' && (
              <span className={`role-badge role-${detectedRole}`}>
                {roleLabels[detectedRole].badge}
              </span>
            )}
          </div>


          {/* Role-Specific Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Ana navigasyon">
            {detectedRole === 'visitor' && (
              <>
                <a href={servicesHref} onClick={handleServicesNavigation}>Hizmetler</a>
                <NavLink href="/nasil-calisir" active={pathname === '/nasil-calisir'}>Nasıl Çalışır?</NavLink>
                <NavLink href="/ustalar" active={pathname.startsWith('/ustalar')}>Ustalar</NavLink>
                <NavLink href="/yardim" active={pathname === '/yardim'}>Yardım</NavLink>
                <NavLink href="/giris" className="nav-login" active={pathname === '/giris'}>Giriş Yap</NavLink>
                <NavLink className="join-link" href="/usta/kayit" active={pathname === '/usta/kayit'}>Usta olarak katıl</NavLink>
              </>
            )}

            {detectedRole === 'customer' && (
              <>
                <NavLink href="/taleplerim" active={pathname.startsWith('/taleplerim')}>Taleplerim</NavLink>
                <NavLink href="/islerim" active={pathname.startsWith('/islerim')}>İşlerim</NavLink>
                <NavLink href="/yardim" active={pathname === '/yardim'}>Yardım</NavLink>
                <NavLink href="/hesap" active={pathname === '/hesap'}>Hesap</NavLink>
                <a href={servicesHref} className="nav-action-button" onClick={handleServicesNavigation}>+ Yeni Talep</a>
                <button
                  type="button"
                  className="nav-signout-btn"
                  onClick={handleSignOut}
                  disabled={busySignOut}
                  aria-label="Oturumu Kapat"
                >
                  {busySignOut ? 'Çıkılıyor…' : 'Çıkış Yap'}
                </button>
              </>
            )}

            {detectedRole === 'tradesperson' && (
              <>
                <NavLink href="/usta/talepler" active={pathname === '/usta/talepler'}>Gelen Talepler</NavLink>
                <NavLink href="/usta/musaitlik" active={pathname === '/usta/musaitlik'}>Müsaitlik</NavLink>
                <NavLink href="/islerim" active={pathname.startsWith('/islerim')}>İşlerim</NavLink>
                <NavLink href="/usta-basvurusu" className="nav-action-button profile-nav-btn" active={pathname === '/usta-basvurusu'}>Belgelerim / Profil</NavLink>
                <NavLink href="/yardim" active={pathname === '/yardim'}>Destek</NavLink>
                <button
                  type="button"
                  className="nav-signout-btn"
                  onClick={handleSignOut}
                  disabled={busySignOut}
                  aria-label="Oturumu Kapat"
                >
                  {busySignOut ? 'Çıkılıyor…' : 'Çıkış Yap'}
                </button>
              </>
            )}

            {detectedRole === 'admin' && (
              <>
                <NavLink href="/yonetim/usta-basvurulari" active={pathname.startsWith('/yonetim/usta-basvurulari')}>Usta Başvuruları</NavLink>
                <NavLink href="/yonetim/uyusmazliklar" active={pathname.startsWith('/yonetim/uyusmazliklar')}>Uyuşmazlıklar</NavLink>
                <NavLink href="/yonetim/moderasyon" active={pathname.startsWith('/yonetim/moderasyon')}>Moderasyon</NavLink>
                <Link href="/" className="nav-exit-link">Siteye Dön</Link>
                <button
                  type="button"
                  className="nav-signout-btn"
                  onClick={handleSignOut}
                  disabled={busySignOut}
                  aria-label="Oturumu Kapat"
                >
                  {busySignOut ? 'Çıkılıyor…' : 'Çıkış Yap'}
                </button>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className={`hamburger ${mobileMenu ? 'open' : ''}`}
            type="button"
            aria-label={mobileMenu ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileMenu}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenu(prev => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenu && (
        <div className="mobile-nav-backdrop" role="presentation" onClick={closeMobileMenu}>
          <nav
            ref={mobileMenuRef}
            id="mobile-navigation"
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobil navigasyon"
            tabIndex={-1}
            onClick={event => event.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <OrchestraLogo size={32} variant="primary" />
              <div>
                <b>Orkestra</b>
                <span>{roleLabels[detectedRole].badge}</span>
              </div>
            </div>



            <div className="mobile-nav-links">
              {detectedRole === 'visitor' && (
                <>
                  <a href={servicesHref} onClick={handleServicesNavigation}>Hizmetleri Keşfet</a>
                  <NavLink href="/nasil-calisir" active={pathname === '/nasil-calisir'} onClick={closeMobileMenu}>Nasıl Çalışır?</NavLink>
                  <NavLink href="/ustalar" active={pathname.startsWith('/ustalar')} onClick={closeMobileMenu}>Ustalar</NavLink>
                  <NavLink href="/taleplerim" active={false} onClick={closeMobileMenu}>Taleplerim</NavLink>
                  <NavLink href="/islerim" active={false} onClick={closeMobileMenu}>İşlerim</NavLink>
                  <NavLink href="/giris" active={pathname === '/giris'} onClick={closeMobileMenu}>Kayıt Ol / Giriş Yap</NavLink>
                  <NavLink className="mobile-join" href="/usta/kayit" active={pathname === '/usta/kayit'} onClick={closeMobileMenu}>Usta Olarak Katıl</NavLink>
                  <NavLink className="mobile-help" href="/yardim" active={pathname === '/yardim'} onClick={closeMobileMenu}>Yardım Merkezi</NavLink>
                </>
              )}

              {detectedRole === 'customer' && (
                <>
                  <a href={servicesHref} onClick={handleServicesNavigation}>+ Yeni Talep Oluştur</a>
                  <NavLink href="/taleplerim" active={pathname.startsWith('/taleplerim')} onClick={closeMobileMenu}>Taleplerim</NavLink>
                  <NavLink href="/islerim" active={pathname.startsWith('/islerim')} onClick={closeMobileMenu}>İşlerim</NavLink>
                  <NavLink href="/yardim" active={pathname === '/yardim'} onClick={closeMobileMenu}>Yardım ve Destek</NavLink>
                  <NavLink href="/hesap" active={pathname === '/hesap'} onClick={closeMobileMenu}>Hesap ve Gizlilik</NavLink>
                  <button
                    type="button"
                    className="mobile-signout-btn"
                    onClick={handleSignOut}
                    disabled={busySignOut}
                  >
                    {busySignOut ? 'Çıkılıyor…' : 'Oturumu Kapat'}
                  </button>
                </>
              )}

              {detectedRole === 'tradesperson' && (
                <>
                  <NavLink href="/usta/talepler" active={pathname === '/usta/talepler'} onClick={closeMobileMenu}>Eşleşen Talepler</NavLink>
                  <NavLink href="/usta/musaitlik" active={pathname === '/usta/musaitlik'} onClick={closeMobileMenu}>Müsaitlik ve Takvim</NavLink>
                  <NavLink href="/islerim" active={pathname.startsWith('/islerim')} onClick={closeMobileMenu}>İşlerim</NavLink>
                  <NavLink href="/usta-basvurusu" active={pathname === '/usta-basvurusu'} onClick={closeMobileMenu}>Belgeler ve Profil</NavLink>
                  <NavLink href="/yardim" active={pathname === '/yardim'} onClick={closeMobileMenu}>Usta Destek</NavLink>
                  <button
                    type="button"
                    className="mobile-signout-btn"
                    onClick={handleSignOut}
                    disabled={busySignOut}
                  >
                    {busySignOut ? 'Çıkılıyor…' : 'Oturumu Kapat'}
                  </button>
                </>
              )}

              {detectedRole === 'admin' && (
                <>
                  <NavLink href="/yonetim/usta-basvurulari" active={pathname.startsWith('/yonetim/usta-basvurulari')} onClick={closeMobileMenu}>Usta Başvuruları</NavLink>
                  <NavLink href="/yonetim/uyusmazliklar" active={pathname.startsWith('/yonetim/uyusmazliklar')} onClick={closeMobileMenu}>Uyuşmazlık Yönetimi</NavLink>
                  <NavLink href="/yonetim/moderasyon" active={pathname.startsWith('/yonetim/moderasyon')} onClick={closeMobileMenu}>İçerik Moderasyonu</NavLink>
                  <Link href="/" onClick={closeMobileMenu}>Ana Sayfaya Dön</Link>
                  <button
                    type="button"
                    className="mobile-signout-btn"
                    onClick={handleSignOut}
                    disabled={busySignOut}
                  >
                    {busySignOut ? 'Çıkılıyor…' : 'Oturumu Kapat'}
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
