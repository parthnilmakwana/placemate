import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles, Check } from 'lucide-react';
import Button from '../../components/Button';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { login, loginWithGoogle, error, setError, loading } = useAuth();
  const navigate = useNavigate();

  // Clear global context errors on mount
  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;

    try {
      await loginWithGoogle(response.credential);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  useEffect(() => {
    let intervalId;

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        clearInterval(intervalId);

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });

        const btnElement = document.getElementById('googleSignInButton');
        if (btnElement) {
          window.google.accounts.id.renderButton(
            btnElement,
            {
              theme: 'filled_black',
              size: 'large',
              width: '100%',
              shape: 'pill',
              text: 'signin_with',
            }
          );
        }
      }
    };

    initializeGoogleSignIn();
    intervalId = setInterval(initializeGoogleSignIn, 500);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all credentials');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] text-text-main overflow-hidden relative font-body">
      
      {/* Left side: Login Form */}
      <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 z-10 w-full max-w-xl mx-auto lg:max-w-none lg:mx-0">
        
        {/* Mobile Logo Header */}
        <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
          <img src="/logo.png" alt="PlaceMate" className="w-10 h-10 object-contain" />
          <span className="font-heading text-xl font-bold tracking-tight text-text-main">PlaceMate</span>
        </div>

        <div className="flex flex-col gap-2 mb-8 text-center lg:text-left">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-text-main">
            Welcome back to PlaceMate
          </h2>
          <p className="text-sm text-text-muted">
            Sign in to resume managing your automated placement search.
          </p>
        </div>

        {/* Card Form container */}
        <div className="structured-panel p-6 md:p-8 rounded-lg border border-brand-border bg-brand-surface">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Validation alerts */}
            {(validationError || error) && (
              <div className="flex items-start gap-3 bg-status-error/10 border border-status-error/20 text-status-error p-3.5 rounded-md text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Email input field */}
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="email" className="text-xs font-semibold text-text-muted tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-500 text-sm focus:border-brand-primary focus:outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="password" className="text-xs font-semibold text-text-muted tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-500 text-sm focus:border-brand-primary focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              fullWidth
              className="mt-2 py-3"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-text-main/20 border-t-text-main rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <span className="relative px-3 bg-brand-surface text-[11px] text-text-disabled font-semibold uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Google Sign-in Button */}
          <div className="flex justify-center w-full min-h-[44px] mb-2">
            <div id="googleSignInButton" className="w-full"></div>
          </div>

          {/* Prompt to register */}
          <div className="text-center mt-6 pt-5 border-t border-brand-border text-xs text-text-disabled">
            <span>New to PlaceMate? </span>
            <Link to="/register" className="font-semibold text-brand-primary hover:underline transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Right side: Marketing Visual Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-brand-sidebar border-l border-brand-border relative overflow-hidden select-none text-left">
        
        {/* Header Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <img src="/logo.png" alt="PlaceMate" className="w-10 h-10 object-contain" />
          <span className="font-heading text-xl font-bold tracking-tight text-text-main">PlaceMate</span>
        </div>

        {/* Feature showcase lists */}
        <div className="flex flex-col gap-10 my-auto z-10 max-w-md">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-2xl font-bold text-text-main leading-tight">
              Autonomously optimize your recruitment pipeline
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              PlaceMate connects all parts of the placement process. Save details to one unified profile, and watch it sync across platforms.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-md bg-brand-surface border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-text-secondary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main">AI Portfolio Subdomains</h4>
                <p className="text-[11px] text-text-disabled leading-normal mt-0.5">
                  Generate live public portfolios dynamically mapped to personalized URLs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-md bg-brand-surface border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-text-secondary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main">ATS-Optimized Templates</h4>
                <p className="text-[11px] text-text-disabled leading-normal mt-0.5">
                  Construct single-page resumes designed to pass automated candidate filters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-md bg-brand-surface border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-text-secondary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main">Kanban Board Job Tracker</h4>
                <p className="text-[11px] text-text-disabled leading-normal mt-0.5">
                  Monitor your daily job recommendations and pipeline stages on a unified board.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Small stats banner footer */}
        <div className="flex gap-8 border-t border-brand-border pt-6 z-10">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-main">Unified Workspace</span>
            <span className="text-[10px] text-text-disabled leading-normal">Jobs, resume, and portfolio in one place.</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-main">ATS Optimized</span>
            <span className="text-[10px] text-text-disabled leading-normal">Resumes built to pass automated filters.</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
