import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-brand-bg grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] text-slate-100 overflow-hidden relative">
      
      {/* Left side: Login Form */}
      <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 z-10 w-full max-w-xl mx-auto lg:max-w-none lg:mx-0">
        
        {/* Mobile Logo Header */}
        <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
          <img src="/logo.png" alt="PlaceMate" className="w-11 h-11 object-contain" />
          <span className="font-heading text-xl font-extrabold tracking-tight text-white">PlaceMate</span>
        </div>

        <div className="flex flex-col gap-2 mb-8 text-center lg:text-left">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white">
            Welcome back to <span className="bg-gradient-to-r from-brand-primary to-indigo-400 bg-clip-text text-transparent">PlaceMate</span>
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to resume managing your automated placement search.
          </p>
        </div>

        {/* Card Form container */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl bg-slate-950/20">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Validation alerts */}
            {(validationError || error) && (
              <div className="flex items-start gap-3 bg-brand-error/10 border border-brand-error/20 text-brand-error p-3.5 rounded-xl text-xs animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Email input field */}
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98] mt-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              {loading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative px-3 bg-[#0d1222] text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Google Sign-in Button */}
          <div className="flex justify-center w-full min-h-[44px] mb-2">
            <div id="googleSignInButton" className="w-full"></div>
          </div>

          {/* Prompt to register */}
          <div className="text-center mt-6 pt-5 border-t border-white/5 text-xs text-slate-500">
            <span>New to PlaceMate? </span>
            <Link to="/register" className="font-bold text-brand-primary hover:text-brand-primary-hover transition-colors duration-150">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Right side: Marketing Visual Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-[#0c101d] border-l border-white/5 relative overflow-hidden select-none text-left">
        
        {/* Background glow lines / dots */}
        <div className="absolute top-[10%] right-[-50px] w-[350px] h-[350px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[10%] left-[-50px] w-[300px] h-[300px] rounded-full bg-brand-secondary/5 blur-[100px] pointer-events-none z-0"></div>

        {/* Header Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <img src="/logo.png" alt="PlaceMate" className="w-11 h-11 object-contain" />
          <span className="font-heading text-xl font-extrabold tracking-tight text-white">PlaceMate</span>
        </div>

        {/* Feature showcase lists */}
        <div className="flex flex-col gap-10 my-auto z-10 max-w-md">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-2xl font-black text-white leading-tight">
              Autonomously optimize your recruitment pipeline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PlaceMate connects all parts of the placement process. Save details to one unified profile, and watch it sync across platforms.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-brand-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">AI Portfolio Subdomains</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Generate live public portfolios dynamically mapped to personalized URLs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-brand-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">ATS-Optimized Templates</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Construct single-page resumes designed to pass automated candidate filters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-brand-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Kanban Board Job Tracker</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Monitor your daily job recommendations and pipeline stages on a unified board.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Small stats banner footer */}
        <div className="flex gap-6 border-t border-white/5 pt-6 z-10">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-extrabold text-white font-heading">10,000+</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Jobs Scraped Daily</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-extrabold text-white font-heading">85%+</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ATS Score Match</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
