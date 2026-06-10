import React from 'react';

/**
 * Global Error Boundary designed to catch React rendering errors.
 * Specifically, it handles the "stale Vite chunk" problem:
 * If a new deployment happens while a user has the app open, navigating to a lazy-loaded
 * route will throw a "Failed to fetch dynamically imported module" error.
 * This component catches that error and automatically reloads the page once to fetch the latest index.html.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    const isChunkLoadError = 
      error?.name === 'ChunkLoadError' || 
      (error?.message && error.message.includes('Failed to fetch dynamically imported module')) ||
      (error?.message && error.message.includes('Importing a module script failed'));

    if (isChunkLoadError) {
      const isReloaded = sessionStorage.getItem('chunk_failed_reload');
      if (!isReloaded) {
        // Set flag to prevent infinite loops, then reload
        sessionStorage.setItem('chunk_failed_reload', 'true');
        console.warn('Stale chunk detected. Forcing page reload to fetch new assets...');
        window.location.reload();
      } else {
        // If we already tried reloading and it still failed, let it fall through to the fallback UI
        console.error('Chunk load failed even after a reload.');
      }
    }
  }

  handleRefresh = () => {
    // Clear the flag so a manual refresh allows the automatic recovery to work again in the future
    sessionStorage.removeItem('chunk_failed_reload');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-8 text-center text-slate-200">
          <div className="max-w-md w-full bg-[#111827] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto bg-brand-primary/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black font-heading tracking-tight text-white mb-3">
              Application Update
            </h2>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              We've just deployed a new version of PlaceMate! To ensure everything works perfectly, please refresh the application.
            </p>
            
            <button
              onClick={this.handleRefresh}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-brand-primary/25 active:scale-95"
            >
              Refresh Application
            </button>
            
            <p className="mt-6 text-xs text-slate-600 font-mono">
              Error details: {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
