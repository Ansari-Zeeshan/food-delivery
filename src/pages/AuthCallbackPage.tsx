import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { restoreSession } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function processOAuthCallback() {
      try {
        const user = await restoreSession();
        if (mounted) {
          if (user) {
            setStatus('success');
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 800);
          } else {
            setStatus('error');
            setErrorMsg('Unable to retrieve user details from Google authentication callback.');
          }
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        if (mounted) {
          setStatus('error');
          setErrorMsg(err.message || 'Google authentication failed.');
        }
      }
    }

    processOAuthCallback();

    return () => {
      mounted = false;
    };
  }, [restoreSession, navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-soft-lg max-w-md w-full text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-red animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-brand-dark">Authenticating with Google...</h2>
            <p className="text-xs text-brand-muted">Please wait while InsForge completes your sign-in session.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-brand-dark">Welcome to Foody!</h2>
            <p className="text-xs text-emerald-600 font-semibold">Google sign-in successful. Redirecting to home...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-brand-red mx-auto" />
            <h2 className="text-xl font-bold text-brand-dark">Sign In Failed</h2>
            <p className="text-xs text-brand-red">{errorMsg}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 px-6 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold rounded-xl transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};
