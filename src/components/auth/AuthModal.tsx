import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signUp, loginWithOTP, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'otp' | 'email' | 'signup'>('otp');
  
  // Mobile OTP state
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

  // Email / Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpStep('otp');
    setOtpValues(code.split(''));
    showToast(`Verification OTP code sent: ${code}`, 'success');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpValues.join('');
    if (entered.length < 6) {
      showToast('Please enter complete 6-digit OTP', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithOTP(mobileNumber);
      showToast('Successfully logged in via Mobile OTP!', 'success');
    } catch (err) {
      showToast('OTP verification failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (activeTab === 'signup') {
        await signUp(email, password, name || 'Epicure User');
        showToast('Account created & logged in!', 'success');
      } else {
        await login(email, password);
        showToast('Welcome back to Foody!', 'success');
      }
    } catch (err) {
      showToast('Authentication failed. Please check credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google successfully!', 'success');
    } catch (err) {
      showToast('Google Sign-In failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] border border-brand-border/80 shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-brand-surface text-brand-dark hover:bg-brand-border flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-brand-red text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles size={12} /> Foody Account Access
            </span>
            <h3 className="font-serif text-3xl font-bold text-brand-dark">
              Welcome to Foody<span className="text-brand-red">.</span>
            </h3>
            <p className="text-xs text-brand-muted">
              Sign in to save favorites, place gourmet orders & manage delivery addresses.
            </p>
          </div>

          {/* Authentication Mode Tabs */}
          <div className="flex bg-brand-surface p-1 rounded-2xl border border-brand-border/60">
            <button
              onClick={() => {
                setActiveTab('otp');
                setOtpStep('phone');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'otp'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-brand-muted hover:text-brand-dark'
              }`}
            >
              <Smartphone size={14} /> Mobile OTP
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email' || activeTab === 'signup'
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-brand-muted hover:text-brand-dark'
              }`}
            >
              <Mail size={14} /> Password
            </button>
          </div>

          {/* TAB 1: MOBILE OTP FLOW */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-dark">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-4 py-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold focus:outline-none focus:border-brand-dark"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-brand-muted">We will send a 6-digit verification code via SMS.</p>
                  </div>

                  <Button variant="primary" fullWidth size="lg" type="submit">
                    Send Verification OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      <ShieldCheck size={14} /> OTP Sent to +91 {mobileNumber}
                    </div>
                    <p className="text-xs font-semibold text-brand-dark">Enter 6-Digit Code:</p>
                    <div className="flex justify-center gap-2">
                      {otpValues.map((val, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={val}
                          onChange={e => {
                            const newVals = [...otpValues];
                            newVals[idx] = e.target.value;
                            setOtpValues(newVals);
                          }}
                          className="w-10 h-12 text-center bg-brand-surface border border-brand-border rounded-xl font-mono text-base font-bold focus:border-brand-dark focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  <Button variant="primary" fullWidth size="lg" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying...' : 'Verify OTP & Sign In'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setOtpStep('phone')}
                    className="w-full text-center text-xs font-bold text-brand-red hover:underline"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2 & 3: EMAIL / PASSWORD & SIGNUP */}
          {(activeTab === 'email' || activeTab === 'signup') && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold focus:outline-none focus:border-brand-dark"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full px-4 py-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold focus:outline-none focus:border-brand-dark"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-bold focus:outline-none focus:border-brand-dark"
                  required
                />
              </div>

              <Button variant="primary" fullWidth size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Authenticating...' : activeTab === 'signup' ? 'Create Account' : 'Sign In with Email'}
              </Button>

              <div className="flex justify-between items-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'email' ? 'signup' : 'email')}
                  className="font-bold text-brand-dark hover:text-brand-red transition-colors"
                >
                  {activeTab === 'email' ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border/60" />
            </div>
            <span className="relative px-3 bg-white text-[10px] font-extrabold uppercase tracking-widest text-brand-muted">
              OR
            </span>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-brand-border/80 bg-white hover:bg-brand-surface text-brand-dark text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-soft-sm group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
