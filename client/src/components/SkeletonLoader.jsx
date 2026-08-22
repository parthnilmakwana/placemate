import React from 'react';

function SkeletonLoader({ type = 'dashboard' }) {
  if (type === 'dashboard') {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse select-none text-left">
        {/* Banner skeleton */}
        <div className="h-28 w-full rounded-md bg-brand-surface border border-brand-border p-6 flex flex-col justify-center gap-2">
          <div className="h-6 w-1/2 max-w-[192px] rounded bg-white/10"></div>
          <div className="h-4 w-3/4 max-w-[384px] rounded bg-white/5"></div>
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-md border border-brand-border bg-brand-bg h-28 flex flex-col gap-3 justify-center">
              <div className="h-3 w-16 rounded bg-white/5"></div>
              <div className="h-6 w-32 rounded bg-white/10"></div>
              <div className="h-2 w-24 rounded bg-white/5"></div>
            </div>
          ))}
        </div>

        {/* Large container skeleton */}
        <div className="h-48 w-full rounded-md bg-brand-surface border border-brand-border p-6 flex flex-col gap-4">
          <div className="h-5 w-36 rounded bg-white/10"></div>
          <div className="h-px w-full bg-brand-border"></div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full rounded bg-white/5"></div>
            <div className="h-3 w-[90%] rounded bg-white/5"></div>
            <div className="h-3 w-[75%] rounded bg-white/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-6 animate-pulse select-none text-left">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-1/2 max-w-[192px] rounded bg-white/10"></div>
          <div className="h-4 w-3/4 max-w-[384px] rounded bg-white/5"></div>
        </div>
        <div className="structured-panel p-6 rounded-md flex flex-col gap-6 border border-brand-border">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col gap-2">
              <div className="h-3.5 w-24 rounded bg-white/10"></div>
              <div className="h-10 w-full rounded-md bg-brand-bg border border-brand-border"></div>
            </div>
          ))}
          <div className="h-10 w-32 rounded-md bg-white/10 self-start mt-2"></div>
        </div>
      </div>
    );
  }

  if (type === 'jobs') {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse select-none text-left">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="structured-panel p-6 rounded-md flex flex-col gap-4 border border-brand-border bg-brand-surface">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-1/2 max-w-[192px] rounded bg-white/10"></div>
                  <div className="h-3.5 w-32 rounded bg-white/5"></div>
                </div>
                <div className="h-5 w-16 rounded bg-white/10"></div>
              </div>
              <div className="h-16 w-full rounded bg-brand-bg border border-brand-border"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-8 w-24 rounded bg-white/5"></div>
                <div className="h-8 w-32 rounded bg-white/10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-text-disabled animate-pulse">
      <div className="w-8 h-8 rounded-full border-2 border-border-strong border-t-white animate-spin mb-4"></div>
      <span className="text-xs font-bold tracking-widest uppercase text-text-muted">Loading content...</span>
    </div>
  );
}

export default SkeletonLoader;
