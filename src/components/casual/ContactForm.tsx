import React, { useState } from 'react';
import { useHydratedLocale } from '../../store/useAppStore';

/**
 * ContactForm — formulario real que POSTea a /api/v1/contact (edge-api).
 * El mensaje se guarda en SQLite en la Pi y dispara un push por ntfy.
 * Cae con gracia a mailto: si el servicio no responde.
 */

const T = {
  en: {
    name: 'Your name', email: 'Your email', message: 'Your message',
    send: 'Send message', sending: 'Sending...',
    ok: 'Thanks! Your message is on its way. I\'ll get back to you soon.',
    err: 'Something went wrong. You can also email me directly:',
    rate: 'One message per minute, please. Try again shortly.',
    invalidEmail: 'Please enter a valid email.',
    tooShort: 'The message is a bit too short.',
  },
  es: {
    name: 'Tu nombre', email: 'Tu correo', message: 'Tu mensaje',
    send: 'Enviar mensaje', sending: 'Enviando...',
    ok: '¡Gracias! Tu mensaje va en camino. Te responderé pronto.',
    err: 'Algo salió mal. También puedes escribirme directo:',
    rate: 'Un mensaje por minuto, por favor. Intenta en un momento.',
    invalidEmail: 'Ingresa un correo válido.',
    tooShort: 'El mensaje es un poco corto.',
  },
  ja: {
    name: 'お名前', email: 'メールアドレス', message: 'メッセージ',
    send: 'メッセージを送信', sending: '送信中...',
    ok: 'ありがとうございます!メッセージを送信しました。近日中に返信します。',
    err: '問題が発生しました。直接メールもできます:',
    rate: '1分に1通までです。少し待って再試行してください。',
    invalidEmail: '有効なメールアドレスを入力してください。',
    tooShort: 'メッセージが少し短すぎます。',
  },
};

const EMAIL = 'mkawashiro01@gmail.com';

export const ContactForm: React.FC = () => {
  const locale = useHydratedLocale();
  const t = T[locale] ?? T.en;
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const green = 'var(--color-green500)';
  const beige = 'var(--color-beige)';

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { setErrMsg(t.invalidEmail); setStatus('error'); return; }
    if (data.message.trim().length < 10) { setErrMsg(t.tooShort); setStatus('error'); return; }

    setStatus('sending');
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) { setStatus('ok'); form.reset(); }
      else { setErrMsg(json.error === 'rate-limited' ? t.rate : json.detail || t.err); setStatus('error'); }
    } catch {
      setStatus('error');
      setErrMsg(t.err);
    }
  };

  const field = 'w-full rounded-2xl px-5 py-3.5 text-base outline-none transition-colors';
  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid color-mix(in srgb, var(--color-text-muted) 25%, transparent)',
    color: 'var(--color-text-main)',
  };

  if (status === 'ok') {
    return (
      <div className="max-w-lg mx-auto rounded-3xl p-8 text-center" style={{ background: 'var(--color-mint)', color: 'var(--color-green800)' }}>
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-lg font-medium">{t.ok}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto flex flex-col gap-4 text-left">
      <div className="flex flex-col sm:flex-row gap-4">
        <input name="name" type="text" required placeholder={t.name} className={field} style={fieldStyle} aria-label={t.name} />
        <input name="email" type="email" required placeholder={t.email} className={field} style={fieldStyle} aria-label={t.email} />
      </div>
      <textarea name="message" rows={4} required placeholder={t.message} className={`${field} resize-none`} style={fieldStyle} aria-label={t.message} />
      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--color-rust)' }}>
          {errMsg}{' '}
          <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full px-8 py-3.5 font-semibold transition-transform hover:scale-105 disabled:opacity-60"
        style={{ backgroundColor: green, color: beige }}
      >
        {status === 'sending' ? t.sending : t.send}
      </button>
    </form>
  );
};
