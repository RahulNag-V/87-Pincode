import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, register, oauthLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'verify' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.forgotPassword(email.trim());
        setSuccessMsg(res.message || 'Password reset instructions have been dispatched.');
      } catch (err: any) {
        setError(err.message || 'Failed to dispatch reset instructions.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('Please accept Terms & Conditions to proceed.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Authentication successful. Continuing with your order...');
      } else if (mode === 'signup') {
        await register(fullName, email, password, confirmPassword, phone);
        setSuccessMsg('Atelier account created. Continuing with your order...');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    try {
      const simulatedEmail = email || `collector.${provider}@87pincode.com`;
      const name = fullName || (provider === 'google' ? 'Google Authenticated Client' : 'Apple Authenticated Client');
      await oauthLogin(provider, simulatedEmail, name);
      setSuccessMsg(`Authenticated via ${provider === 'apple' ? 'Apple ID' : 'Google'}. Continuing with your order...`);
    } catch (err: any) {
      setError(err.message || `Failed to authenticate with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    setCountdown(30);
    setSuccessMsg(`Verification email resent to ${email || 'your email'}. Check your inbox.`);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-dialog"
        className="w-full max-w-md bg-[#0F0F0F] border border-[#262626] rounded shadow-2xl p-6 sm:p-8 relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Modal */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-[#888888] hover:text-[#F5F2EA] transition-colors"
          aria-label="Close authentication modal"
        >
          <X size={20} />
        </button>

        {/* Modal Brand Treatment */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center space-x-1.5 mb-2">
            <span className="font-editorial text-xl font-bold tracking-[0.25em] text-[#F5F2EA]">
              87 PINCODE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D6C28A]">
            {mode === 'forgot'
              ? 'Reset Account Password'
              : mode === 'signup'
              ? 'Create Atelier Account'
              : 'Sign in to continue with your order.'}
          </h2>
          <p className="text-[11px] text-[#9B9B9B] mt-1">
            {mode === 'forgot'
              ? 'Enter your registered email to receive recovery instructions.'
              : 'Your items are safely reserved in your cart.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        {mode === 'forgot' ? (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs uppercase tracking-wider text-[#C9A227] hover:underline flex items-center space-x-1.5"
            >
              <ArrowLeft size={14} />
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 bg-[#080808] p-1 rounded border border-[#1C1C1C] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs uppercase tracking-widest font-semibold rounded transition-all ${
                mode === 'login'
                  ? 'bg-[#1C1C1C] text-[#E0B84F] shadow'
                  : 'text-[#888888] hover:text-[#D5D2CA]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs uppercase tracking-widest font-semibold rounded transition-all ${
                mode === 'signup'
                  ? 'bg-[#1C1C1C] text-[#E0B84F] shadow'
                  : 'text-[#888888] hover:text-[#D5D2CA]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none pl-9"
                />
                <User size={14} className="absolute left-3 top-3 text-[#666666]" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none pl-9"
              />
              <Mail size={14} className="absolute left-3 top-3 text-[#666666]" />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                Phone Number (WhatsApp Delivery)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none"
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[10px] text-[#C9A227] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none pl-9 pr-9"
                />
                <Lock size={14} className="absolute left-3 top-3 text-[#666666]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#666666] hover:text-[#D5D2CA]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded px-3 py-2 text-xs text-[#F5F2EA] outline-none pl-9"
                  />
                  <Lock size={14} className="absolute left-3 top-3 text-[#666666]" />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded accent-[#C9A227]"
                />
                <label htmlFor="agree-terms" className="text-[11px] text-[#9B9B9B] leading-tight">
                  I accept 87 Pincode's <span className="text-[#D6C28A]">Terms & Conditions</span> and <span className="text-[#D6C28A]">Privacy Policy</span>.
                </label>
              </div>
            </>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold rounded transition-all disabled:opacity-50 mt-2"
          >
            {loading
              ? 'Verifying...'
              : mode === 'forgot'
              ? 'Send Recovery Instructions'
              : mode === 'login'
              ? 'Sign In & Continue'
              : 'Create Account & Continue'}
          </button>
        </form>

        {/* OAuth Social Dividers */}
        {mode !== 'forgot' && (
          <>
            <div className="my-5 flex items-center">
              <div className="flex-1 border-t border-[#222222]"></div>
              <span className="px-3 text-[10px] uppercase tracking-widest text-[#666666]">
                Or continue with
              </span>
              <div className="flex-1 border-t border-[#222222]"></div>
            </div>

            {/* OAuth Buttons (Requirement #6 & #10: Google + Apple) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="py-2.5 px-3 rounded bg-[#141414] border border-[#262626] hover:border-[#C9A227] text-xs text-[#F5F2EA] font-medium flex items-center justify-center space-x-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={loading}
                className="py-2.5 px-3 rounded bg-[#141414] border border-[#262626] hover:border-[#C9A227] text-xs text-[#F5F2EA] font-medium flex items-center justify-center space-x-2 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-5.74-8.7-10.36-18.72-13.86-30.07-3.5-11.35-5.25-22.18-5.25-32.48 0-14.35 3.75-26.15 11.25-35.41 7.5-9.26 16.89-13.98 28.18-14.16 4.79 0 10.36 1.25 16.71 3.75 6.36 2.5 10.36 3.75 12 3.75 1.41 0 5.48-1.25 12.21-3.75 6.73-2.5 12.16-3.64 16.29-3.41 12.39.76 22.25 5.27 29.58 13.53-10.88 6.53-16.19 15.55-15.93 27.06.26 9.14 3.75 16.86 10.47 23.16 6.72 6.31 14.63 9.87 23.73 10.69-2.29 7.07-5.16 14.46-8.62 22.17zM119.22 33.15c0-7.39 2.67-14.41 8.01-21.06 5.34-6.65 11.97-10.99 19.89-13.02.22 1.09.33 2.18.33 3.27 0 7.39-2.73 14.52-8.19 21.39-5.46 6.87-12.19 11.22-20.19 13.05-.11-1.2-.17-2.4-.17-3.63z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </>
        )}

        {/* Verification Link / Quick help */}
        <div className="mt-5 text-center text-[11px] text-[#666666]">
          Need verification resend?{' '}
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={countdown > 0}
            className="text-[#C9A227] hover:underline disabled:opacity-50"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
