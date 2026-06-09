import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, BASE_URL } from '../../services/api';
import { 
  Briefcase, Download, CheckCircle, AlertCircle, 
  Sparkles, Check, TrendingUp, Users, Target, ShieldCheck, 
  Lock, RefreshCw, Calendar, Search, Filter, MapPin
} from 'lucide-react';
import ApplicationTracker from './components/ApplicationTracker';

function JobDashboardTab() {
  const { user } = useAuth();
  
  // Tab-level states
  const [viewMode, setViewMode] = useState('discover'); // 'discover' | 'tracker'
  const [mainTab, setMainTab] = useState('recommendations'); // 'recommendations' | 'search'
  
  // Recommendations state
  const [recJobs, setRecJobs] = useState([]);
  const [recDay, setRecDay] = useState('today'); // 'today' | 'yesterday' | '2days'
  const [recLoading, setRecLoading] = useState(false);
  const [recGeneratedAt, setRecGeneratedAt] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHasSearched, setSearchHasSearched] = useState(false);
  
  // Shared state
  const [error, setError] = useState('');
  const [isDownloadingId, setIsDownloadingId] = useState(null);

  // ════════════════════════════════════════════════════════════
  // FETCH RECOMMENDATIONS
  // ════════════════════════════════════════════════════════════
  const fetchRecommendations = useCallback(async (dayParam = 'today') => {
    setRecLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/jobs/recommendations?day=${dayParam}`);
      setRecJobs(response.data || []);
      setRecGeneratedAt(response.generatedAt);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Could not load your recommended jobs.');
    } finally {
      setRecLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (mainTab === 'recommendations') {
      fetchRecommendations(recDay);
    }
  }, [mainTab, recDay, fetchRecommendations]);

  // ════════════════════════════════════════════════════════════
  // SEARCH FUNCTIONALITY
  // ════════════════════════════════════════════════════════════
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setError('');
    setSearchHasSearched(true);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (searchCategory) params.append('category', searchCategory);
      if (searchLocation) params.append('location', searchLocation);
      
      const response = await api.get(`/api/jobs/search?${params.toString()}`);
      setSearchResults(response.data || []);
      setSearchTotal(response.total || 0);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════
  const handleMarkApplied = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'applied' ? 'matched' : 'applied';
    
    // Update local state based on which tab we're in
    if (mainTab === 'recommendations') {
      setRecJobs(prev => prev.map(job => 
        job.jobId === jobId ? { ...job, status: nextStatus } : job
      ));
    } else {
      setSearchResults(prev => prev.map(job => 
        job._id === jobId ? { ...job, status: nextStatus } : job
      ));
    }

    try {
      await api.patch(`/api/jobs/${jobId}/status`, { status: nextStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Let it fail silently, user can refresh
    }
  };

  const handleDownloadTailoredResume = async (jobId, companyName) => {
    setIsDownloadingId(jobId);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/api/resume/download?sentJobId=${jobId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to retrieve PDF stream');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeCandidateName = user?.name ? user.name.replace(/\s+/g, '_') : 'My';
      const safeCompany = companyName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${safeCandidateName}_Tailored_${safeCompany}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Tailored download failed:', err);
      setError('Could not download tailored resume.');
    } finally {
      setIsDownloadingId(null);
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  // ════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ════════════════════════════════════════════════════════════
  const renderJobCard = (job, isSearch) => {
    // Map properties based on whether it's a Recommendation object or a native Job object
    const id = isSearch ? job._id : job.jobId;
    const title = job.title;
    const company = job.company;
    const location = job.location || 'Remote';
    const skills = job.skills || [];
    const applyLink = isSearch ? job.applyLink : job.applyUrl;
    const isDirectLink = job.isDirectLink;
    const status = job.status || 'matched';
    const isApplied = status === 'applied';
    
    // Recommendations specific
    const matchScore = !isSearch ? job.matchScore : null;
    const matchReasons = !isSearch ? job.matchReasons : null;

    return (
      <div 
        key={id}
        className={`glass-panel border rounded-2xl p-6 shadow-md transition-all duration-300 relative overflow-hidden
          ${isApplied ? 'border-emerald-600/15 bg-emerald-600/3' : 'border-white/5 hover:border-brand-primary/20'}`}
      >
        {isApplied && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/30"></div>}

        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h4 className="font-heading text-lg font-bold text-white">{title}</h4>
            <span className="text-xs text-slate-400">{company} &bull; {location}</span>
          </div>

          {!isSearch && matchScore && (
            <div className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider 
              ${matchScore >= 85 ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400' : 
                matchScore >= 60 ? 'bg-amber-600/10 border-amber-600/30 text-amber-400' : 
                'bg-indigo-600/10 border-indigo-600/30 text-indigo-400'}`}>
              {matchScore}% Match
            </div>
          )}
        </div>

        {!isSearch && matchReasons && matchReasons.length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 mt-4 text-xs text-slate-300 leading-relaxed border border-white/5">
            <strong>Match Highlights:</strong> {matchReasons.join(' • ')}
          </div>
        )}

        {skills && skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Required Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="px-2 py-1 rounded bg-white/5 text-slate-300 text-[10px] border border-white/10">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 flex-wrap">
          <button
            onClick={() => handleMarkApplied(id, status)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-150
              ${isApplied 
                ? 'bg-emerald-600/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-600/20' 
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/8'}`}
          >
            {isApplied ? <CheckCircle size={13} /> : <Check size={13} />}
            <span>{isApplied ? 'Applied' : 'Mark Applied'}</span>
          </button>

          <div className="flex gap-2">
            <a 
              href={getAbsoluteUrl(applyLink)} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/10 hover:border-brand-primary/40 bg-white/5 hover:bg-brand-primary/10 text-white cursor-pointer transition-all active:scale-[0.98]"
            >
              Apply / Details &rarr;
            </a>

            {!isSearch && (
              <div 
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 bg-slate-900 border border-white/5 cursor-not-allowed select-none"
                title="AI Tailoring is processed asynchronously. Currently unavailable for instant picks."
              >
                <Sparkles size={12} className="mr-1" />
                <span>Standard Resume</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl animate-fade-in text-left">
      
      {/* Header & Sub-navigation */}
      <div className="flex flex-col gap-5 border-b border-white/5 pb-2 shrink-0">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1 text-left">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Briefcase className="text-brand-primary" />
              <span>Job Discovery & Tracking</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-wider scale-90 select-none">Beta</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Get personalized daily matches, query active database listings, and monitor hiring pipeline stages.
            </p>
          </div>
        </div>

        {/* Sub tabs toggle */}
        <div className="flex gap-6 text-sm font-semibold select-none overflow-x-auto hide-scrollbar">
          <button 
            type="button"
            onClick={() => setViewMode('discover')}
            className={`pb-2.5 transition-all cursor-pointer relative focus:outline-none ${
              viewMode === 'discover' ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span className="whitespace-nowrap">Discover Feed</span>
            {viewMode === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t"></div>}
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('tracker')}
            className={`pb-2.5 transition-all cursor-pointer relative focus:outline-none ${
              viewMode === 'tracker' ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span className="whitespace-nowrap">Application Kanban Tracker</span>
            {viewMode === 'tracker' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t"></div>}
          </button>
        </div>
      </div>

      {viewMode === 'discover' ? (
        /* DISCOVER VIEW */
        <div className="flex flex-col gap-6 md:gap-8 animate-fade-in">
          
          <div className="flex items-start gap-3 p-4 rounded-xl text-sm bg-brand-primary/5 border border-brand-primary/10 text-indigo-300">
            <Sparkles size={18} className="shrink-0 mt-0.5 text-brand-primary" />
            <div>
              <strong className="text-indigo-200 font-bold block mb-1">Welcome to Job Discovery (Beta)</strong>
              Our recommendation algorithms Normalise skills to matching scores. Let us know your feedback as we enhance the systems.
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl text-xs bg-brand-error/10 border border-brand-error/20 text-brand-error animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Mode Toggle */}
          <div className="flex flex-wrap bg-black/40 border border-white/10 rounded-xl p-1 shrink-0 w-fit">
            <button
              onClick={() => setMainTab('recommendations')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'recommendations' 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/15' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} />
              <span>Daily Picks</span>
            </button>
            <button
              onClick={() => setMainTab('search')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'search' 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/15' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search size={14} />
              <span>Search DB</span>
            </button>
          </div>

          {/* ────────────────────────────────────────────────────────────────────────
              MODE: RECOMMENDATIONS
              ──────────────────────────────────────────────────────────────────────── */}
          {mainTab === 'recommendations' && (
            <div className="flex flex-col gap-6 text-left animate-fade-in">
              
              <div className="flex justify-between items-center bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-indigo-400 shrink-0" />
                  <div className="text-xs text-slate-350">
                    <strong>Recommendation Engine Active:</strong> 5 personalized jobs are selected for you daily.
                    {recGeneratedAt && <span className="block mt-0.5 text-[10px] text-slate-500">Last updated: {new Date(recGeneratedAt).toLocaleString()}</span>}
                  </div>
                </div>
                <button onClick={() => fetchRecommendations(recDay)} className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-slate-450 hover:text-white transition-colors cursor-pointer">
                  <RefreshCw size={13} />
                </button>
              </div>

              {/* Time Tabs */}
              <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
                {['today', 'yesterday', '2days'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setRecDay(day)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      recDay === day ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-slate-500 hover:bg-white/5 hover:text-slate-350'
                    }`}
                  >
                    <Calendar size={13} />
                    {day === 'today' ? "Today" : day === 'yesterday' ? "Yesterday" : "2 Days Ago"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                {recLoading ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-slate-400 animate-pulse">
                    <div className="custom-spinner"></div>
                    <span className="text-xs font-bold tracking-widest uppercase">Scoring matches...</span>
                  </div>
                ) : recJobs.length > 0 ? (
                  recJobs.map(job => renderJobCard(job, false))
                ) : (
                  <div className="glass-panel border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1 text-sm">No Recommendations Yet</h4>
                      <p className="text-xs text-slate-400 leading-normal">We couldn't find matches for {recDay}. Make sure your profile preferences are complete.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────
              MODE: SEARCH
              ──────────────────────────────────────────────────────────────────────── */}
          {mainTab === 'search' && (
            <div className="flex flex-col gap-6 text-left animate-fade-in">
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  
                  <div className="flex-grow flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-primary/50 transition-colors">
                    <Search className="ml-3.5 text-slate-500" size={15} />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company..."
                      className="w-full bg-transparent border-none py-2.5 px-3 text-xs text-white placeholder-slate-650 focus:outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="sm:w-44 flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-primary/50 transition-colors">
                    <Filter className="ml-3.5 text-slate-500" size={15} />
                    <select
                      className="w-full bg-transparent border-none py-2.5 px-3 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                      value={searchCategory}
                      onChange={e => setSearchCategory(e.target.value)}
                    >
                      <option value="" className="bg-slate-900 text-slate-300">All Categories</option>
                      <option value="Frontend" className="bg-slate-900 text-slate-350">Frontend</option>
                      <option value="Backend" className="bg-slate-900 text-slate-350">Backend</option>
                      <option value="Full Stack" className="bg-slate-900 text-slate-350">Full Stack</option>
                      <option value="Android" className="bg-slate-900 text-slate-350">Android</option>
                      <option value="Data Science" className="bg-slate-900 text-slate-350">Data Science</option>
                      <option value="DevOps" className="bg-slate-900 text-slate-350">DevOps</option>
                    </select>
                  </div>

                  <div className="sm:w-44 flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-primary/50 transition-colors">
                    <MapPin className="ml-3.5 text-slate-500" size={15} />
                    <input
                      type="text"
                      placeholder="Location / Remote"
                      className="w-full bg-transparent border-none py-2.5 px-3 text-xs text-white placeholder-slate-650 focus:outline-none"
                      value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-70 whitespace-nowrap"
                  >
                    {searchLoading ? 'Searching...' : 'Search Jobs'}
                  </button>
                </div>
              </form>

              {/* Search Results */}
              <div className="flex flex-col gap-4 mt-2">
                
                {searchHasSearched && !searchLoading && (
                  <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wide">
                    Found {searchTotal} active listings
                  </div>
                )}

                {searchLoading ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-slate-400 animate-pulse">
                    <div className="custom-spinner"></div>
                    <span className="text-xs font-bold tracking-widest uppercase">Searching database...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(job => renderJobCard(job, true))
                ) : searchHasSearched ? (
                  <div className="glass-panel border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500">
                      <Search size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1 text-sm">No Results Found</h4>
                      <p className="text-xs text-slate-500 leading-normal">Try adjusting your filters or keywords.</p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-b from-transparent to-brand-primary/5">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <Search size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1 text-sm">Search the PlaceMate Network</h4>
                      <p className="text-xs text-slate-450 leading-normal">Our system indexes active software roles daily.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* KANBAN APPLICATION TRACKER VIEW */
        <ApplicationTracker />
      )}

    </div>
  );
}

export default JobDashboardTab;
