'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TaskrabbitBrandLogo from './TaskrabbitBrandLogo';
import { useModalDialog } from '../hooks/useModalDialog';
import { navigationActive, navigationContext, navigationItems } from '../lib/navigationModel';
import styles from './appHeader.module.css';
import { useAccountSummary } from '../hooks/useAccountSummary';
import AccountSignOut from './AccountSignOut';
import { canonicalRoute } from '../lib/routeManifest';
import AuthModal from './AuthModal';

export default function AppHeader({ conversations = false }: { conversations?: boolean }) {
  const pathname = usePathname();
  const account = useAccountSummary();
  const [open, setOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'account' | 'menu'>('menu');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const ref = useModalDialog<HTMLElement>(open, () => setOpen(false));
  const context = navigationContext(pathname);
  const roles = account.user?.roles ?? [];
  const professional = roles.includes('tradesperson');
  const operations = roles.includes('admin') || roles.includes('moderator');

  let effectiveContext: 'operations' | 'professional' | 'customer' | 'auth' | 'public';
  if (!account.user) {
    effectiveContext = context === 'auth' ? 'auth' : 'public';
  } else if (context === 'operations' && operations) {
    effectiveContext = 'operations';
  } else if (context === 'professional' && professional) {
    effectiveContext = 'professional';
  } else if (context === 'customer' && professional && !roles.includes('customer')) {
    effectiveContext = 'professional';
  } else if (context === 'auth') {
    effectiveContext = 'auth';
  } else {
    effectiveContext = 'customer';
  }

  const accountHref = `${canonicalRoute('/hesap')}?workspace=${
    effectiveContext === 'professional'
      ? 'professional'
      : effectiveContext === 'operations'
      ? 'operations'
      : 'customer'
  }`;

  // Public discovery surfaces share the same small navigation. Workspace and
  // operational routes keep their role-specific information architecture.
  const isDiscoverySurface =
    pathname === '/' ||
    pathname === '/ustalar' ||
    pathname.startsWith('/ustalar/') ||
    pathname.startsWith('/ankara/');
  const publicDiscoveryGuest = !account.user && account.status === 'ready' && context === 'public' && isDiscoverySurface;
  const landingDiscoverHref = `${canonicalRoute('/')}#kesfet`;
  const publicUstalarHref = canonicalRoute('/ustalar');

  const links =
    account.status === 'ready' && account.user
      ? navigationItems(effectiveContext, conversations).filter((item) => item.href !== '/hesap')
      : (publicDiscoveryGuest
        ? [
            { href: landingDiscoverHref, label: 'Keşfet' },
            { href: publicUstalarHref, label: 'Ustalar' },
          ]
        : navigationItems(context === 'auth' ? 'auth' : 'public', conversations)
      ).filter(
          (item) => item.href !== '/hesap' && item.href !== '/usta/kayit'
        );

  if (account.user && context === 'public') {
    if (!links.some((item) => item.href === canonicalRoute('/ustalar'))) {
      links.unshift({ href: canonicalRoute('/ustalar'), label: 'Ustalar' });
    }
    if (!links.some((item) => item.href === `${canonicalRoute('/')}#services`)) {
      links.unshift({ href: `${canonicalRoute('/')}#services`, label: 'Hizmetler' });
    }
  }

  const accountLinks = (
    <>
      {account.status === 'loading' ? (
        <p role="status">Hesap kontrol ediliyor…</p>
      ) : account.status === 'error' ? (
        <p role="status">
          Hesap yüklenemedi. <Link href={canonicalRoute('/hesap')}>Hesabı kontrol et</Link>
        </p>
      ) : account.user ? (
        <>
          <Link href={accountHref} onClick={() => setOpen(false)}>
            Hesap ayarları
          </Link>
          {effectiveContext !== 'customer' && (
            <Link href={canonicalRoute('/taleplerim')} onClick={() => setOpen(false)}>
              Müşteri alanına geç
            </Link>
          )}
          {effectiveContext !== 'professional' && (
            <Link
              href={canonicalRoute(professional ? '/usta/talepler' : '/usta-basvurusu')}
              onClick={() => setOpen(false)}
            >
              {professional ? 'Usta alanına geç' : 'Usta başvurum'}
            </Link>
          )}
          {operations && (
            <Link
              href={canonicalRoute(
                roles.includes('admin') ? '/yonetim/uyusmazliklar' : '/yonetim/moderasyon'
              )}
              onClick={() => setOpen(false)}
            >
              Yönetim alanı
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href={canonicalRoute('/giris')} onClick={() => setOpen(false)}>
            Giriş yap
          </Link>
          <Link href={canonicalRoute('/kayit')} onClick={() => setOpen(false)}>
            Kayıt ol
          </Link>
          <Link href={canonicalRoute('/usta/kayit')} onClick={() => setOpen(false)}>
            Usta olarak katıl
          </Link>
        </>
      )}
    </>
  );

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    const hash = href === '/#services' ? 'services' : href === landingDiscoverHref ? 'kesfet' : null;
    if (!hash || pathname !== '/') return;
    const target = document.getElementById(hash);
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, '', `#${hash}`);
    requestAnimationFrame(() => {
      target.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      target.focus({ preventScroll: true });
    });
  }

  const items = links.map((item) => (
    <Link
      key={`${item.href}-${item.label}`}
      href={item.href}
      aria-current={
        (publicDiscoveryGuest &&
          ((item.href === landingDiscoverHref && pathname === '/') ||
            (item.href === publicUstalarHref && pathname.startsWith('/ustalar')))) ||
        navigationActive(pathname, item.href)
          ? 'page'
          : undefined
      }
      onClick={(event) => navigate(event, item.href)}
    >
      {item.label}
    </Link>
  ));

  return (
    <>
      <header className={`${styles.header} ${publicDiscoveryGuest ? styles.discoveryHeader : ''}`}>
        <div className={styles.inner}>
          {/* Taskrabbit-style Brand Logo */}
          <Link className={styles.brand} href="/" aria-label="Orkestra ana sayfa">
            <TaskrabbitBrandLogo
              size={30}
              textColor="#17233B"
              markColor={publicDiscoveryGuest ? '#2F76D6' : undefined}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktop} aria-label="Ana navigasyon">
            {items}

            {/* Quick Auth Trigger for Guests (Taskrabbit style) */}
            {!account.user &&
              (publicDiscoveryGuest || (account.status !== 'loading' && account.status !== 'error')) && (
              <button
                type="button"
                className={styles.authActionBtn}
                onClick={() => {
                  setAuthModalMode('sign-in');
                  setAuthModalOpen(true);
                }}
              >
                {publicDiscoveryGuest ? 'Giriş yap' : 'Giriş Yap / Kayıt Ol'}
              </button>
            )}

            {/* Become a Tasker (Usta Ol) Green Outline Pill Button */}
            {!professional && (
              <Link
                href={canonicalRoute('/usta-basvurusu')}
                className={styles.becomeTaskerBtn}
              >
                {publicDiscoveryGuest ? 'Hizmet ver' : 'Usta Ol'}
              </Link>
            )}
          </nav>

          {/* Account Trigger (Shown for logged-in users or error recovery, hidden for guests on desktop) */}
          {(account.user ||
            (!publicDiscoveryGuest && (account.status === 'error' || account.status === 'loading'))) && (
            <button
              className={styles.accountTrigger}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open && panelMode === 'account'}
              aria-controls="product-mobile-menu"
              onClick={() => {
                setPanelMode('account');
                setOpen(true);
              }}
            >
              {account.status === 'loading' ? (
                'Hesap…'
              ) : account.user ? (
                <>
                  <span className={styles.accountAvatarSmall} aria-hidden="true">
                    {account.user.name.slice(0, 1).toLocaleUpperCase('tr-TR')}
                  </span>
                  <span>Hesabım</span>
                  <span aria-hidden="true">⌄</span>
                </>
              ) : (
                'Hesap'
              )}
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            className={styles.menu}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open && panelMode === 'menu'}
            aria-controls="product-mobile-menu"
            onClick={() => {
              setPanelMode('menu');
              setOpen(true);
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menü
          </button>
        </div>
      </header>

      {/* Drawer / Account Dropdown Panel */}
      {open && (
        <div
          className={`${styles.backdrop} ${panelMode === 'account' ? styles.accountBackdrop : ''}`}
          onClick={() => setOpen(false)}
        >
          <section
            ref={ref}
            id="product-mobile-menu"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-menu-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.drawerTop}>
              <h2 id="product-menu-title">
                {panelMode === 'account' ? 'Hesabım' : 'Menü'}
              </h2>
              <button
                type="button"
                data-dialog-initial-focus
                onClick={() => setOpen(false)}
                aria-label="Kapat"
              >
                Kapat
              </button>
            </div>

            <div className={styles.drawerBody}>
              {panelMode === 'menu' && (
                <>
                  {!professional && (
                    <Link
                      href={canonicalRoute('/usta-basvurusu')}
                      className={styles.drawerBecomeTasker}
                      onClick={() => setOpen(false)}
                    >
                      {publicDiscoveryGuest ? 'Hizmet ver' : 'Usta Ol (Hemen Katıl)'}
                    </Link>
                  )}
                  <nav aria-label="Mobil navigasyon">{items}</nav>
                </>
              )}

              <div className={styles.secondary}>
                {account.status === 'ready' && account.user && (
                  <div className={styles.identity}>
                    <span className={styles.avatar} aria-hidden="true">
                      {account.user.name.slice(0, 1).toLocaleUpperCase('tr-TR')}
                    </span>
                    <div>
                      <strong>{account.user.name}</strong>
                      <small>
                        {effectiveContext === 'professional'
                          ? 'Usta alanı'
                          : effectiveContext === 'operations'
                          ? 'Yönetim alanı'
                          : 'Müşteri alanı'}
                      </small>
                    </div>
                  </div>
                )}
                <nav aria-label="Hesap işlemleri">
                  {accountLinks}
                  {context !== 'auth' && (
                    <Link href="/yardim" onClick={() => setOpen(false)}>
                      Yardım ve destek
                    </Link>
                  )}
                </nav>
              </div>

              {account.user && (
                <div className={styles.signOut}>
                  <AccountSignOut buttonClassName={styles.signOutButton} />
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Taskrabbit Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
