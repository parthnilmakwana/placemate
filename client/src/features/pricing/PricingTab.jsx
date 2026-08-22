import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, Loader2, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Button from '../../components/Button';

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
        <h1 className="text-3xl md:text-4xl font-heading font-black text-text-main tracking-tight">
          Designed for developer growth
        </h1>
        <p className="text-text-muted text-sm md:text-base max-w-2xl">
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
        <div className="structured-panel rounded-lg p-6 md:p-8 border border-brand-border bg-brand-surface flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-text-main mb-1">Free Candidate</h2>
            <p className="text-text-disabled text-xs">Core placement tools for student candidates</p>
          </div>
          
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-text-main font-heading">$0</span>
            <span className="text-text-disabled text-sm font-medium">/ forever</span>
          </div>
          
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            {[
              '1 Dynamic Portfolio Link',
              '1 Standard ATS Resume template',
              'Standard Job Discovery search access',
              'Kanban Application Tracker board'
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <Check size={16} className="text-text-muted shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {isPro ? (
            <Button 
              onClick={handleDowngrade}
              disabled={isLoading}
              variant="danger"
              fullWidth
            >
              {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <ArrowDownCircle size={16} className="mr-2" />}
              Downgrade to Free
            </Button>
          ) : (
            <Button 
              disabled={true}
              variant="secondary"
              fullWidth
            >
              Current Plan
            </Button>
          )}
        </div>

        {/* Pro Tier Card */}
        <div className={`structured-panel-elevated rounded-lg p-6 md:p-8 border flex flex-col relative overflow-hidden ${isPro ? 'border-brand-primary' : 'border-brand-primary/50'}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-main mb-1 flex items-center gap-2">
                Premium Pro <Sparkles size={16} className="text-brand-primary" />
              </h2>
              <p className="text-text-muted text-xs">Complete automated placement suite</p>
            </div>
            {!isPro && (
              <span className="px-2.5 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                RECOMMENDED
              </span>
            )}
            {isPro && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-status-success text-[10px] font-bold uppercase tracking-wider">
                ACTIVE
              </span>
            )}
          </div>
          
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-text-main font-heading">$19</span>
            <span className="text-text-disabled text-sm font-medium">/ month</span>
          </div>
          
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            <li className="flex items-start gap-2.5 text-sm text-text-main">
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
              <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <Check size={16} className="text-brand-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {isPro ? (
            <Button 
              disabled={true}
              variant="primary"
              fullWidth
            >
              <Check size={16} className="mr-2" />
              Current Plan
            </Button>
          ) : (
            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              variant="primary"
              fullWidth
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <CreditCard size={16} className="mr-2" />
              )}
              Upgrade to Premium
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
