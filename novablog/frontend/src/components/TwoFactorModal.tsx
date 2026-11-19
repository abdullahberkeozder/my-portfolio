'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';
import { TwoFactorSetupResponseDto, TwoFactorRecoveryCodesDto } from '@/types/api';
import { useTwoFactorStatusQuery } from '@/hooks/useBlogs';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Lock,
  ShieldOff,
  AlertTriangle,
  Delete,
} from 'lucide-react';
import { playKeyClick } from '@/lib/retroAudio';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KEYPAD_BUTTONS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
];

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose }) => {
  const { data: status, refetch: refetchStatus } = useTwoFactorStatusQuery(isOpen);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponseDto | null>(null);
  const [recoveryData, setRecoveryData] = useState<TwoFactorRecoveryCodesDto | null>(null);

  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    setSetupData(null);
    setRecoveryData(null);
    setVerifyCode('');
    setDisableCode('');
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleKeypadPress = (digit: string) => {
    playKeyClick('crisp');
    if (verifyCode.length < 6) {
      setVerifyCode((prev) => prev + digit);
    }
  };

  const handleKeypadDelete = () => {
    playKeyClick('soft');
    setVerifyCode((prev) => prev.slice(0, -1));
  };

  const handleStartSetup = async () => {
    playKeyClick('crisp');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await ApiClient.setup2fa();
      setSetupData(res);
    } catch {
      setErrorMessage('2FA kurulumu başlatılamadı. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verifyCode.trim() || verifyCode.length < 6) {
      setErrorMessage('Lütfen 6 haneli doğrulama kodunu giriniz.');
      return;
    }
    playKeyClick('crisp');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await ApiClient.enable2fa(verifyCode.trim());
      setRecoveryData(res);
      setSuccessMessage('2FA koruması başarıyla aktif edildi!');
      await refetchStatus();
    } catch {
      setErrorMessage('Geçersiz doğrulama kodu. Authenticator saat senkronizasyonunu kontrol ediniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim() || disableCode.length < 6) {
      setErrorMessage('Kapatmak için lütfen 6 haneli kodunuzu giriniz.');
      return;
    }
    playKeyClick('crisp');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await ApiClient.disable2fa(disableCode.trim());
      setSuccessMessage('İki faktörlü kimlik doğrulama başarıyla kapatıldı.');
      setDisableCode('');
      await refetchStatus();
    } catch {
      setErrorMessage('Geçersiz kod. 2FA kapatılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!setupData?.manualEntryKey) return;
    playKeyClick('crisp');
    navigator.clipboard.writeText(setupData.manualEntryKey.replace(/\s+/g, ''));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const isEnabled = status?.is2faEnabled ?? false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative mac-security-dialog shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac OS X Window Title Bar with Traffic Lights */}
        <div className="h-10 px-4 bg-gradient-to-b from-[#f2f2f2] to-[#d8d8d8] dark:from-[#2c3038] dark:to-[#1e2127] border-b border-[#a8a8a8] dark:border-[#383d47] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClose}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] hover:opacity-80 cursor-pointer"
                title="Kapat"
              />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" />
            </div>
            <span className="ml-3 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              Mac OS X Keychain — 2FA Yetkilendirmesi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                isEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {isEnabled ? 'KORUMA: AKTİF' : 'KORUMA: KAPALI'}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#f6f6f6] dark:bg-[#16181d]">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STATE 1: 2FA NOT ENABLED & NO SETUP YET */}
          {!isEnabled && !setupData && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white to-[#dedede] dark:from-[#2e333d] dark:to-[#1e2128] border border-zinc-300 dark:border-zinc-700 shadow-md flex items-center justify-center mx-auto text-amber-500">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  İki Faktörlü Kimlik Doğrulama Kapalı
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed max-w-sm mx-auto">
                  Hesabınızı ve mimari ayarlarınızı korumak için Google Authenticator veya 1Password ile RFC 6238 TOTP şifre korumasını etkinleştirin.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartSetup}
                  disabled={isLoading}
                  className="ios6-btn ios6-btn-blue w-full py-2.5 text-xs font-bold uppercase"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  <span>2FA Kurulumunu Başlat</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: SETUP IN PROGRESS WITH PASSCODE KEYPAD */}
          {!isEnabled && setupData && !recoveryData && (
            <div className="space-y-4">
              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-xl border border-zinc-300 dark:border-zinc-700 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setupData.qrCodeDataUri}
                  alt="2FA TOTP QR Kodu"
                  className="w-24 h-24 object-contain shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    Authenticator ile Tarayın
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Veya aşağıdaki anahtarı manuel girin:
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="font-mono font-bold text-[10px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {setupData.manualEntryKey.substring(0, 14)}...
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="ios6-btn ios6-btn-silver px-2 py-0.5 text-[9px]"
                    >
                      {copiedKey ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedKey ? 'Kopyalandı' : 'Kopya'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Passcode Indicator Dots */}
              <div className="text-center space-y-2 pt-1">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  6 Haneli TOTP Şifresini Tuşlayın:
                </div>
                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`mac-passcode-dot ${idx < verifyCode.length ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Apple Circular Passcode Keypad */}
              <div className="grid grid-cols-3 gap-3 justify-items-center max-w-[240px] mx-auto py-1">
                {KEYPAD_BUTTONS.map((b) => (
                  <button
                    key={b.num}
                    type="button"
                    onClick={() => handleKeypadPress(b.num)}
                    className="mac-passcode-btn"
                  >
                    <span className="num">{b.num}</span>
                    {b.sub && <span className="sub">{b.sub}</span>}
                  </button>
                ))}
                {/* Blank space */}
                <div />
                {/* 0 Key */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="mac-passcode-btn"
                >
                  <span className="num">0</span>
                </button>
                {/* Backspace Key */}
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  className="mac-passcode-btn"
                  title="Sil"
                >
                  <Delete className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSetupData(null)}
                  className="ios6-btn ios6-btn-silver px-4 py-2 text-xs"
                >
                  Geri Dön
                </button>
                <button
                  type="button"
                  disabled={isLoading || verifyCode.length < 6}
                  onClick={() => handleVerifyAndEnable()}
                  className="ios6-btn ios6-btn-blue px-5 py-2 text-xs font-bold uppercase"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Doğrula & Aktif Et</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: RECOVERY CODES VOUCHER */}
          {recoveryData && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Acil Durum Kurtarma Kodlarınız</span>
                </div>
                <p className="text-[11px] font-sans leading-relaxed">
                  Cihazınızı kaybederseniz hesabınıza erişmek için bu kodları kullanabilirsiniz:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  {recoveryData.recoveryCodes.map((c, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded bg-white dark:bg-black/40 border border-emerald-500/20 text-center font-bold text-xs"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playKeyClick('crisp');
                  setRecoveryData(null);
                }}
                className="ios6-btn ios6-btn-blue w-full py-2.5 text-xs font-bold uppercase"
              >
                <span>Güvenli Bir Yere Kaydettim</span>
              </button>
            </div>
          )}

          {/* STATE 4: 2FA ACTIVELY ENABLED */}
          {isEnabled && !recoveryData && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>2FA Koruması Tam Olarak Aktif</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    GÜVENLİ
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 font-sans text-xs leading-relaxed">
                  Hesabınız Google Authenticator / TOTP ile korunmaktadır. Kalan acil durum kodları: {status?.remainingBackupCodes ?? 8} adet.
                </p>
              </div>

              {/* Disable 2FA Form */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ShieldOff className="w-3.5 h-3.5 text-rose-500" />
                  <span>Korumayı Devre Dışı Bırak</span>
                </div>
                <form onSubmit={handleDisable2fa} className="flex gap-2">
                  <input
                    id="twofactor-disable-code"
                    name="disableCode"
                    type="text"
                    maxLength={6}
                    placeholder="6 haneli kod"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || disableCode.length < 6}
                    className="ios6-btn ios6-btn-red px-3 py-1.5 text-xs font-bold"
                  >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Kapat'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 px-4 bg-[#e8e8e8] dark:bg-[#1a1c22] border-t border-[#c0c0c0] dark:border-[#2c3038] flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
          <span>MAC OS X KEYCHAIN ACCESS</span>
          <span>RFC 6238 TOTP ENGINE</span>
        </div>
      </div>
    </div>
  );
};
