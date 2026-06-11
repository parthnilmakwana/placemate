import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, Loader2, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function PricingTab() {
  const { user, checkUserSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to determine if user is on pro plan
  const isPro = user?.plan === 'pro';

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calling our backend endpoint to simulate Razorpay payment success
      await api.post('/api/payments/mock-upgrade');
      // Refresh the user session so the app knows we are now 'pro'
      await checkUserSession();
    } catch (err) {
      console.error(err);
      setError('Failed to upgrade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calling our backend endpoint to simulate plan cancellation
      await api.post('/api/payments/mock-downgrade');
      // Refresh the user session so the app knows we are now 'free'
      await checkUserSession();
    } catch (err) {
      console.error(err);
      setError('Failed to downgrade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tight">
          Designed for developer growth
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl">
          Get started for free and build your readiness profile. Unlock premium automation tools as you scale your search.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-lg text-sm font-bold">
          {error}
        </div>
      )}

      {/* Pricing Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mt-4">
        
        {/* Free Tier Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 flex flex-col hover:border-white/10 transition-colors">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Free Candidate</h2>
            <p className="text-slate-500 text-xs">Core placement tools for student candidates</p>
          </div>
          
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">$0</span>
            <span className="text-slate-500 text-sm font-medium">/ forever</span>
          </div>
          
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            {[
              '1 Dynamic Portfolio Link',
              '1 Standard ATS Resume template',
              'Standard Job Discovery search access',
              'Kanban Application Tracker board'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check size={16} className="text-brand-secondary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {isPro ? (
            <button 
              onClick={handleDowngrade}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-error/10 hover:bg-brand-error/20 text-brand-error border border-brand-error/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownCircle size={16} />}
              Downgrade to Free
            </button>
          ) : (
            <button 
              disabled={true}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white/5 text-slate-400 border border-white/5 cursor-not-allowed"
            >
              Current Plan
            </button>
          )}
        </div>

        {/* Pro Tier Card */}
        <div className={`glass-panel rounded-2xl p-6 md:p-8 border relative overflow-hidden flex flex-col group transition-all duration-300 ${isPro ? 'border-brand-primary' : 'border-brand-primary/30'}`}>
          {/* Subtle background glow for premium effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all pointer-events-none"></div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"></div>
          
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                Premium Pro <Sparkles size={16} className="text-brand-primary" />
              </h2>
              <p className="text-brand-primary/80 text-xs">Complete AI automated placement suite</p>
            </div>
            {!isPro && (
              <span className="px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-wider">
                RECOMMENDED
              </span>
            )}
            {isPro && (
              <span className="px-2.5 py-1 rounded-full bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary text-[10px] font-black uppercase tracking-wider">
                ACTIVE
              </span>
            )}
          </div>
          
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">$19</span>
            <span className="text-slate-500 text-sm font-medium">/ month</span>
          </div>
          
          <ul className="flex flex-col gap-3 mb-8 flex-grow relative z-10">
            <li className="flex items-start gap-2.5 text-sm text-slate-200">
              <Check size={16} className="text-brand-primary shrink-0 mt-0.5" />
              <strong>All Free features included</strong>
            </li>
            {[
              'Unlimited Premium portfolio themes',
              'AI theme generation using prompts',
              'Unlimited Resume downloads',
              'Gemini AI powered phrasing polishing',
              'Daily tailored resumes matching jobs'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                <Check size={16} className="text-brand-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {isPro ? (
            <button 
              disabled={true}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-primary/20 text-brand-primary border border-brand-primary/30 relative z-10 flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Check size={16} />
              Current Plan
            </button>
          ) : (
            <button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-[#090d16] shadow-lg shadow-brand-primary/20 transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CreditCard size={16} />
              )}
              Upgrade to Premium
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
