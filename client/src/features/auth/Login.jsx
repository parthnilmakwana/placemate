import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { login, error, setError, loading } = useAuth();
  const navigate = useNavigate();

  // Clear global context errors on mount
  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Basic Validations
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
      // Errors are handled in AuthContext and exposed via context error state
      console.error('Sign in failed:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg flex items-center justify-center p-6 overflow-hidden">
      
      {/* Background glow blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-brand-primary/15 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[450px] h-[450px] rounded-full bg-brand-secondary/15 blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-[440px] z-10">
        
        {/* Logo and Intro */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 inline-block select-none">💼</div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white">
            Welcome back to <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">PlaceMate</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Log in to manage your AI job hunting campaigns
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Error alerts */}
            {(validationError || error) && (
              <div className="flex items-start gap-3 bg-brand-error/10 border border-brand-error/25 text-brand-error p-3 rounded-lg text-xs animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Email input field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/35 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Prompt to register */}
          <div className="text-center mt-6 pt-5 border-t border-white/5 text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-brand-secondary hover:text-teal-400 transition-colors duration-150">
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
          <Sparkles size={10} className="text-brand-secondary" />
          <span>PlaceMate AI Secure Auth System</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
