import Link from 'next/link';
import styles from './operationsWorkspace.module.css';

type Section = 'applications' | 'moderation' | 'disputes' | 'audit';

type Props = {
  active: Section;
  moderationCount?: number;
  disputeCount?: number;
};

const items: Array<{ id: Section; href: string; label: string }> = [
  { id: 'applications', href: '/yonetim/usta-basvurulari', label: 'Usta başvuruları' },
  { id: 'moderation', href: '/yonetim/moderasyon', label: 'İçerik inceleme' },
  { id: 'disputes', href: '/yonetim/uyusmazliklar', label: 'Uyuşmazlıklar' },
  { id: 'audit', href: '/yonetim/denetim-izi', label: 'Denetim izi' },
];

export default function AdminOperationsNav({ active, moderationCount, disputeCount }: Props) {
  return (
    <nav className={styles.operationsNav} aria-label="Yönetim bölümleri">
      {items.map(item => {
        const count = item.id === 'moderation' ? moderationCount : item.id === 'disputes' ? disputeCount : undefined;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={styles.operationsNavLink}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <span>{item.label}</span>
            {typeof count === 'number' ? <span className={styles.navCount}>{count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
