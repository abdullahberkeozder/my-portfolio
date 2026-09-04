'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import { navigationContext } from '../lib/navigationModel';
import styles from './productFrame.module.css';

export default function ProductFrame({ children, conversations }: { children: ReactNode; conversations: boolean }) {
  const pathname = usePathname();
  const context = navigationContext(pathname);
  if (context === 'reference') return <div id="main-content" tabIndex={-1}>{children}</div>;
  return <div className={styles.frame} data-context={context}>
    <AppHeader key={pathname} conversations={conversations} />
    <div id="main-content" tabIndex={-1} className={styles.content}>{children}</div>
  </div>;
}
