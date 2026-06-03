import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { register, error, setError, loading } = useAuth();
  const navigate = useNavigate();

  // Clear global context errors on mount
  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Basic Validations
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all registration fields');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      // Errors are handled in AuthContext and exposed via context error state
      console.error('Registration failed:', err);
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
            Get started with <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">PlaceMate</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Create an account to activate your autonomous career search
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Error alerts */}
            {(validationError || error) && (
              <div className="flex items-start gap-3 bg-brand-error/10 border border-brand-error/25 text-brand-error p-3 rounded-lg text-xs animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="•••••••• (Min 6 chars)"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/35 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Prompt to log in */}
          <div className="text-center mt-6 pt-5 border-t border-white/5 text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-brand-secondary hover:text-teal-400 transition-colors duration-150">
              Sign In
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

export default Register;
