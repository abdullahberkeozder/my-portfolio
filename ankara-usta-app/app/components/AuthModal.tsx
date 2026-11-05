'use client';

import AuthForm from './AuthForm';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'sign-in',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'sign-in' | 'sign-up';
}) {
  if (!isOpen) return null;
  return (
    <div role="presentation" className="auth-modal-overlay" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Hesap işlemleri" onClick={(event) => event.stopPropagation()}>
        <AuthForm isModal initialMode={initialMode} onClose={onClose} />
      </div>
    </div>
  );
}

