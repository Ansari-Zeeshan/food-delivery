import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Smartphone, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const isRegister = location.pathname.includes('register');

  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');

  // Email form state
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [name, setName] = useState('Alex Morgan');
  const [password, setPassword] = useState('password123');

  // Mobile OTP state
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await signUp(email, password, name);
      } else {
        await login(email, password);
      }
      showToast('Logged in successfully!');
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setSubmitting(false);

    showToast(`📱 SMS Sent to ${phone}! Your OTP is: ${code}`);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp.trim() !== generatedOtp) {
      setErrorMsg('Invalid OTP code. Please enter the 6-digit code sent to your phone.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const demoEmail = `user.${phone.replace(/\D/g, '').slice(-4)}@foody.com`;
      await login(demoEmail, 'otp-auth-pass');
      showToast('Mobile OTP verified successfully!');
      navigate('/');
    } catch (err: any) {
      setErrorMsg('Verification error. Logging in...');
      await login('alex.morgan@example.com', 'password123');
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center font-bold mx-auto mb-2">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-brand-dark">
            {isRegister ? 'Create Foody Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-brand-muted">
            {isRegister ? 'Sign up to unlock VIP food offers and live tracking' : 'Sign in to access your saved addresses & order history'}
          </p>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex bg-brand-surface p-1 rounded-2xl border border-brand-border/60">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'email' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted hover:text-brand-dark'
            }`}
          >
            <Mail size={14} /> Email & Pass
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'otp' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted hover:text-brand-dark'
            }`}
          >
            <Smartphone size={14} /> Mobile OTP
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full p-3 bg-white hover:bg-gray-50 border border-brand-border rounded-xl text-xs font-bold text-brand-dark flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-brand-border w-full"></div>
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-brand-muted shrink-0">
            or with {authMethod === 'email' ? 'email' : 'mobile phone'}
          </span>
          <div className="border-t border-brand-border w-full"></div>
        </div>

        {/* EMAIL & PASSWORD FORM */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              disabled={submitting}
              icon={<ArrowRight size={18} />}
            >
              {submitting ? 'PROCESSING...' : isRegister ? 'SIGN UP NOW' : 'SIGN IN'}
            </Button>
          </form>
        )}

        {/* MOBILE OTP FORM */}
        {authMethod === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-dark font-mono"
                  />
                  <span className="text-[10px] text-brand-muted block mt-1">
                    A 6-digit OTP security code will be sent to your mobile phone.
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  disabled={submitting}
                  icon={<Smartphone size={18} />}
                >
                  {submitting ? 'SENDING OTP...' : 'SEND 6-DIGIT OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={14} /> OTP Sent to {phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] font-bold text-brand-red underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-700">
                    Demo OTP Code: <strong className="text-emerald-900 bg-emerald-200 px-1.5 py-0.5 rounded font-extrabold">{generatedOtp}</strong>
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark block mb-1">
                    Enter 6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userOtp}
                    onChange={e => setUserOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="849201"
                    className="w-full p-3 bg-brand-surface-light border border-brand-border rounded-xl text-lg font-mono font-extrabold text-center tracking-widest focus:outline-none focus:border-brand-dark"
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  disabled={submitting}
                  icon={<KeyRound size={18} />}
                >
                  {submitting ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="text-center text-xs text-brand-muted">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-brand-red font-bold hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} className="text-brand-red font-bold hover:underline">
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
