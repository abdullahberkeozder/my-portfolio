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
} from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  const handleStartSetup = async () => {
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

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim() || verifyCode.length < 6) {
      setErrorMessage('Lütfen 6 haneli doğrulama kodunu giriniz.');
      return;
    }
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
    navigator.clipboard.writeText(setupData.manualEntryKey.replace(/\s+/g, ''));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const isEnabled = status?.is2faEnabled ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0d0f14] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60 font-mono">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${
                isEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
                  : 'bg-zinc-900 dark:bg-zinc-800 border-black/10 dark:border-white/10 text-[#d4f933]'
              }`}
            >
              {isEnabled ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-950 dark:text-white text-base uppercase">
                  2FA // TOTP GÜVENLİK MERKEZİ
                </h3>
                <span
                  className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold border ${
                    isEnabled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10'
                  }`}
                >
                  {isEnabled ? 'AKTİF (ENABLED)' : 'KAPALI (DISABLED)'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                RFC 6238 TOTP &bull; GOOGLE AUTHENTICATOR &bull; BACKUP CODES
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs font-mono">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STATE 1: 2FA IS NOT ENABLED AND NO SETUP IN PROGRESS */}
          {!isEnabled && !setupData && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.08] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Hesabınızda İki Faktörlü Doğrulama Aktif Değil</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed text-xs">
                  Hesabınızı parola sızıntılarına ve brute-force saldırılarına karşı korumak için Google Authenticator,
                  1Password veya Authy ile zaman tabanlı tek kullanımlık şifre (TOTP) korumasını açabilirsiniz.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartSetup}
                disabled={isLoading}
                className="w-full py-3.5 px-5 rounded-full bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>2FA KURULUMUNU BAŞLAT (QR KOD AL)</span>
              </button>
            </div>
          )}

          {/* STATE 2: SETUP IN PROGRESS (PENDING_VERIFICATION) */}
          {!isEnabled && setupData && !recoveryData && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.08] dark:border-white/[0.08] space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">ADIM 1 / 2</span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">QR Kodu Authenticator ile Tarayın</h4>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-black/10 mx-auto max-w-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupData.qrCodeDataUri}
                    alt="2FA TOTP QR Kodu"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                {/* Manual Entry Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Manuel Giriş Anahtarı:</span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="text-zinc-900 dark:text-[#d4f933] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-center font-bold tracking-widest text-xs select-all">
                    {setupData.manualEntryKey}
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifyAndEnable} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="totp-code" className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    ADIM 2 / 2: Uygulamadaki 6 Haneli Kodu Girin
                  </label>
                  <input
                    id="totp-code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-950 dark:text-white focus:outline-none focus:border-[#d4f933]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verifyCode.length < 6}
                  className="w-full py-3.5 px-5 rounded-full bg-zinc-950 dark:bg-[#d4f933] text-white dark:text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>DOĞRULA VE 2FA&apos;YI AKTİF ET</span>
                </button>
              </form>
            </div>
          )}

          {/* STATE 3: JUST ENABLED WITH RECOVERY CODES */}
          {recoveryData && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <span>Acil Durum Kurtarma Kodlarınız</span>
                </div>
                <p className="text-[11px] font-sans leading-relaxed">
                  Telefonunuza erişiminizi kaybederseniz hesabınıza girmek için bu kodları kullanabilirsiniz. Lütfen
                  güvenli bir yere kaydediniz:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {recoveryData.recoveryCodes.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white/70 dark:bg-black/40 border border-emerald-500/20 text-center font-bold tracking-wider text-xs select-all"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRecoveryData(null)}
                className="w-full py-3 px-5 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs uppercase cursor-pointer"
              >
                <span>ANLADIM, GÜVENLİ BİR YERE KAYDETTİM</span>
              </button>
            </div>
          )}

          {/* STATE 4: 2FA IS ACTIVELY ENABLED */}
          {isEnabled && !recoveryData && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>2FA Koruması Tam Olarak Aktif</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    GÜVENLİ
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed text-xs">
                  Hesabınız Google Authenticator / TOTP ile korunmaktadır. Her oturum açışta parola doğrulandıktan sonra
                  hesabınıza 6 haneli kod sorulur.
                </p>
                <div className="flex items-center gap-4 pt-2 text-[11px] text-zinc-500">
                  <span>Kalan Kurtarma Kodları: {status?.remainingBackupCodes ?? 8} adet</span>
                </div>
              </div>

              {/* Disable Form */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.08] dark:border-white/[0.08] space-y-3">
                <h5 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ShieldOff className="w-4 h-4 text-rose-500" />
                  <span>2FA Korumasını Kapat</span>
                </h5>
                <form onSubmit={handleDisable2fa} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6 haneli kod"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || disableCode.length < 6}
                    className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'KAPAT'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
