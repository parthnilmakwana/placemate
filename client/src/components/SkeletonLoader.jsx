import React from 'react';

function SkeletonLoader({ type = 'dashboard' }) {
  if (type === 'dashboard') {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse select-none text-left">
        {/* Banner skeleton */}
        <div className="h-28 w-full rounded-2xl bg-white/5 border border-white/5 p-6 flex flex-col justify-center gap-2">
          <div className="h-6 w-1/2 max-w-[192px] rounded bg-white/10"></div>
          <div className="h-4 w-3/4 max-w-[384px] rounded bg-white/5"></div>
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl border border-white/5 bg-slate-900/20 h-28 flex flex-col gap-3 justify-center">
              <div className="h-3 w-16 rounded bg-white/5"></div>
              <div className="h-6 w-32 rounded bg-white/10"></div>
              <div className="h-2 w-24 rounded bg-white/5"></div>
            </div>
          ))}
        </div>

        {/* Large container skeleton */}
        <div className="h-48 w-full rounded-2xl bg-white/5 border border-white/5 p-6 flex flex-col gap-4">
          <div className="h-5 w-36 rounded bg-white/10"></div>
          <div className="h-px w-full bg-white/5"></div>
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
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 border border-white/5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col gap-2">
              <div className="h-3.5 w-24 rounded bg-white/10"></div>
              <div className="h-10 w-full rounded-lg bg-black/20 border border-white/5"></div>
            </div>
          ))}
          <div className="h-10 w-32 rounded-lg bg-white/10 self-start mt-2"></div>
        </div>
      </div>
    );
  }

  if (type === 'jobs') {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse select-none text-left">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-white/5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-1/2 max-w-[192px] rounded bg-white/10"></div>
                  <div className="h-3.5 w-32 rounded bg-white/5"></div>
                </div>
                <div className="h-5 w-16 rounded bg-white/10"></div>
              </div>
              <div className="h-16 w-full rounded bg-black/10 border border-white/5"></div>
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
    <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin mb-4"></div>
      <span className="text-xs font-bold tracking-widest uppercase">Loading content...</span>
    </div>
  );
}

export default SkeletonLoader;
