import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import SEO from '../../components/SEO';
import { 
  Github, Linkedin, Mail, ExternalLink, Calendar, MapPin, Award, 
  BookOpen, Briefcase, Code, AlertCircle, ArrowLeft, Sparkles, 
  Terminal, User, CheckCircle, Lightbulb, Compass, Monitor, Layers, Shield
} from 'lucide-react';

function PortfolioPage() {
  const { username } = useParams();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/portfolio/${username}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to load portfolio:', err.message);
        setError(err.message || 'Portfolio not found or private');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-100 p-8">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase animate-pulse">
          Loading portfolio...
        </span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-[#ef4444] animate-bounce" />
          <h2 className="font-heading text-2xl font-bold text-white">404 - Portfolio Not Found</h2>
          <p className="text-sm text-slate-400">
            {error || 'This portfolio is either private or does not exist.'}
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 text-white text-xs font-semibold cursor-pointer transition-colors duration-150 active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            <span>Go to PlaceMate Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  const { theme = 'minimal', name, title, bio, githubUrl, linkedinUrl, skills = [], education = [], experience = [], projects = [] } = profile;

  const renderTheme = () => {
  /* ==========================================
     THEME 1: MODERN DEVELOPER (developer)
     ========================================== */
  if (theme === 'developer') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono py-10 px-4">
        <div className="max-w-4xl mx-auto border border-[#30363d] rounded-xl overflow-hidden shadow-2xl bg-[#161b22]">
          <div className="bg-[#161b22] px-4 py-2 flex items-center justify-between border-b border-[#30363d] text-xs text-slate-400 select-none">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div>{name.toLowerCase().replace(/\s+/g, '_')}.json - Editor</div>
            <div className="w-8"></div>
          </div>
          <div className="flex">
            <div className="hidden sm:block w-12 border-r border-[#30363d] text-right pr-3 py-6 text-slate-600 text-xs leading-relaxed select-none">
              {Array.from({ length: 25 }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <div className="flex-1 p-6 space-y-6 text-xs sm:text-sm leading-relaxed">
              <div>
                <span className="text-[#ff7b72]">const</span> <span className="text-[#d2a8ff]">developerProfile</span> = &#123;
                <div className="pl-6 space-y-3 mt-1">
                  <div><span className="text-[#79c0ff]">"name"</span>: <span className="text-[#a5d6ff]">"{name}"</span>,</div>
                  <div><span className="text-[#79c0ff]">"title"</span>: <span className="text-[#a5d6ff]">"{title}"</span>,</div>
                  <div><span className="text-[#79c0ff]">"links"</span>: &#123;
                    <div className="pl-6">
                      {githubUrl && <div><span className="text-[#79c0ff]">"github"</span>: <a href={githubUrl} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">"{githubUrl}"</a>,</div>}
                      {linkedinUrl && <div><span className="text-[#79c0ff]">"linkedin"</span>: <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">"{linkedinUrl}"</a></div>}
                    </div>
                    &#125;,
                  </div>
                  {bio && <div><span className="text-[#79c0ff]">"bio"</span>: <span className="text-[#a5d6ff]">"{bio}"</span>,</div>}
                </div>
                &#125;;
              </div>

              {skills.length > 0 && (
                <div>
                  <span className="text-slate-500">// Technical Competencies</span>
                  <div>
                    <span className="text-[#ff7b72]">const</span> <span className="text-[#d2a8ff]">skills</span> = [
                    <span className="text-[#a5d6ff]"> {skills.map(s => `"${s}"`).join(', ')} </span>
                    ];
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <span className="text-slate-500">// Key Projects</span>
                  <div className="space-y-4 mt-2">
                    {projects.map((p, idx) => (
                      <div key={idx} className="border border-[#30363d] p-4 rounded bg-[#0d1117]">
                        <div className="text-white font-bold">{p.title}</div>
                        <div className="text-slate-400 mt-1 text-xs">{p.description}</div>
                        {p.technologies?.length > 0 && (
                          <div className="text-[#79c0ff] text-xs mt-2">Stack: [{p.technologies.join(', ')}]</div>
                        )}
                        <div className="flex gap-4 mt-3 text-xs">
                          {p.githubLink && <a href={p.githubLink} className="text-[#58a6ff] hover:underline flex items-center gap-1"><Github size={12}/> source</a>}
                          {p.liveLink && <a href={p.liveLink} className="text-[#58a6ff] hover:underline flex items-center gap-1"><ExternalLink size={12}/> demo</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {experience.length > 0 && (
                <div>
                  <span className="text-slate-500">// Professional Experience</span>
                  <div className="space-y-4 mt-2 border-l border-[#30363d] pl-4 ml-2">
                    {experience.map((e, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#ff7b72]"></div>
                        <div className="text-white font-bold">{e.position} @ {e.company}</div>
                        <div className="text-slate-500 text-xs">{e.startDate} - {e.current ? 'Present' : e.endDate}</div>
                        <div className="text-slate-400 mt-1 text-xs">{e.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 2: PREMIUM PROFESSIONAL (professional)
     ========================================== */
  if (theme === 'professional') {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 py-16 px-4 font-sans">
        <div className="max-w-5xl mx-auto bg-[#131a2c] border-2 border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none rounded-tr-3xl"></div>
          
          <header className="border-b border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">Executive Profile</span>
              <h1 className="text-4xl font-extrabold text-white mt-3 tracking-tight">{name}</h1>
              <p className="text-lg text-slate-400 font-medium mt-1">{title}</p>
            </div>
            <div className="flex gap-3">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"><Github size={14}/> Github</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5]/10 border border-[#4f46e5]/30 hover:bg-[#4f46e5]/20 text-[#818cf8] rounded-xl text-xs font-bold transition-all"><Linkedin size={14}/> LinkedIn</a>}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
            <div className="lg:col-span-1 space-y-8 lg:border-r lg:border-slate-800 lg:pr-8">
              {bio && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] border-l-2 border-[#d4af37] pl-3 mb-3">About Me</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{bio}</p>
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] border-l-2 border-[#d4af37] pl-3 mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 font-semibold">{s}</span>)}
                  </div>
                </div>
              )}
              {education.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] border-l-2 border-[#d4af37] pl-3 mb-3">Education</h3>
                  <div className="space-y-4">
                    {education.map((e, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="font-bold text-white">{e.degree}</div>
                        <div className="text-slate-400">{e.institution}</div>
                        <div className="text-slate-500 font-semibold">{e.startYear} - {e.endYear}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-10">
              {experience.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] border-l-2 border-[#d4af37] pl-3 mb-4">Professional History</h3>
                  <div className="space-y-6">
                    {experience.map((e, idx) => (
                      <div key={idx} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                          <div>
                            <h4 className="font-bold text-white text-sm">{e.position}</h4>
                            <span className="text-slate-400">{e.company}</span>
                          </div>
                          <span className="text-[#d4af37] font-bold">{e.startDate} - {e.current ? 'Present' : e.endDate}</span>
                        </div>
                        {e.description && <p className="text-xs text-slate-400 mt-3 leading-relaxed">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] border-l-2 border-[#d4af37] pl-3 mb-4">Selected Case Studies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((p, idx) => (
                      <div key={idx} className="bg-[#0b0f19] border border-[#1e293b] p-5 rounded-xl flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{p.title}</h4>
                          <p className="text-slate-400 text-xs mt-2 leading-relaxed">{p.description}</p>
                        </div>
                        {p.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {p.technologies.map((t, i) => <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 3: CREATIVE DESIGNER (creative)
     ========================================== */
  if (theme === 'creative') {
    return (
      <div className="min-h-screen bg-[#fffcf5] text-[#2b1b0c] font-serif py-16 px-4 relative overflow-hidden">
        <div className="absolute top-10 right-[-80px] w-80 h-80 bg-amber-500/10 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-64 h-64 bg-orange-400/5 rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto border-4 border-[#2b1b0c] p-6 sm:p-12 bg-white relative shadow-xl">
          <div className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-amber-600 rounded-full"></div>
          <div className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-[#2b1b0c] rounded-full"></div>

          <header className="border-b-2 border-[#2b1b0c] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#2b1b0c]">{name}</h1>
              <p className="text-xl italic text-amber-600 mt-2 font-medium">{title}</p>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="border-b border-[#2b1b0c] pb-1 hover:text-amber-600">Github</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="border-b border-[#2b1b0c] pb-1 hover:text-amber-600">LinkedIn</a>}
            </div>
          </header>

          {bio && <p className="text-lg md:text-xl font-medium leading-relaxed max-w-3xl mb-10 text-[#49311b]">{bio}</p>}

          <div className="space-y-12">
            {skills.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold uppercase mb-4 border-b-2 border-[#2b1b0c]/10 pb-2 text-[#2b1b0c]">Focus & Disciplines</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => <span key={i} className="bg-amber-50 text-orange-950 border border-orange-900/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{s}</span>)}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold uppercase mb-6 border-b-2 border-[#2b1b0c]/10 pb-2 text-[#2b1b0c]">Gallery of Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {projects.map((p, idx) => (
                    <div key={idx} className="border border-orange-950/20 p-6 rounded-lg bg-[#faf8f5] hover:bg-[#fffcf5] transition-all duration-300">
                      <span className="text-[10px] font-bold text-amber-600 block mb-1">PROJECT 0{idx + 1}</span>
                      <h3 className="text-xl font-bold text-[#2b1b0c]">{p.title}</h3>
                      <p className="mt-2 text-slate-700 text-xs leading-relaxed">{p.description}</p>
                      {p.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {p.technologies.map((t, i) => <span key={i} className="text-[9px] px-2 py-0.5 bg-orange-100 text-orange-950 rounded font-semibold">{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 4: STARTUP FOUNDER (startup)
     ========================================== */
  if (theme === 'startup') {
    return (
      <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <header className="flex flex-col items-center text-center pb-8 border-b border-slate-200">
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-200/50 px-3 py-1 rounded-full uppercase tracking-wider mb-4">Available for Collaboration</span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{name}</h1>
            <p className="text-lg text-slate-500 font-medium mt-1">{title}</p>
            {bio && <p className="text-slate-600 max-w-xl mt-4 leading-relaxed text-xs sm:text-sm">{bio}</p>}
            <div className="flex gap-3 mt-6">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-md">GitHub</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition shadow-md">LinkedIn</a>}
            </div>
          </header>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
              <span className="text-3xl font-black text-blue-600 block">{experience.length || 1}+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Organisations</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
              <span className="text-3xl font-black text-blue-600 block">{projects.length || 2}+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Products Shipped</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
              <span className="text-3xl font-black text-blue-600 block">{skills.length || 5}+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Expertises</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
              <span className="text-3xl font-black text-blue-600 block">Vite+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">System Stack</span>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              {skills.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider mb-3">Capabilities</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-8">
              {projects.length > 0 && (
                <div>
                  <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-1.5"><Sparkles size={16} className="text-blue-600"/> Product Catalog</h3>
                  <div className="space-y-4">
                    {projects.map((p, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-[#1e293b]">{p.title}</h4>
                          <div className="flex gap-2 text-slate-400 hover:text-slate-600">
                            {p.githubLink && <a href={p.githubLink}><Github size={14}/></a>}
                            {p.liveLink && <a href={p.liveLink}><ExternalLink size={14}/></a>}
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs mt-2 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 5: CORPORATE EXECUTIVE (corporate)
     ========================================== */
  if (theme === 'corporate') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#334155] font-sans py-12 px-4">
        <div className="max-w-4xl mx-auto shadow-xl bg-white border border-slate-200">
          <header className="bg-[#1e293b] text-white p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
              <h2 className="text-lg text-slate-300 font-light mt-1 tracking-wide">{title}</h2>
            </div>
            <div className="flex gap-3 text-xs">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition text-white">Github</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition text-white">LinkedIn</a>}
            </div>
          </header>
          
          <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6 lg:border-r lg:border-slate-200 lg:pr-8">
              {skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider border-b-2 border-slate-200 pb-2 mb-3">Core Assets</h3>
                  <div className="flex flex-col gap-2">
                    {skills.map((s, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-8">
              {bio && (
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider border-b-2 border-slate-800 pb-2 mb-3">Executive Summary</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{bio}</p>
                </div>
              )}

              {experience.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider border-b-2 border-slate-800 pb-2 mb-4">Leadership Chronology</h3>
                  <div className="space-y-6">
                    {experience.map((e, idx) => (
                      <div key={idx} className="text-xs">
                        <h4 className="font-bold text-[#0f172a] text-sm">{e.position}</h4>
                        <div className="text-slate-500 font-semibold mb-1">{e.company} | {e.startDate} - {e.current ? 'Present' : e.endDate}</div>
                        {e.description && <p className="text-slate-600 mt-2 leading-relaxed">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 6: MINIMALIST (minimal)
     ========================================== */
  if (theme === 'minimal') {
    return (
      <div className="min-h-screen bg-white text-[#111] font-sans py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          <header className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight">{name}</h1>
            <p className="text-[#666] text-sm font-medium">{title}</p>
            <div className="flex gap-4 text-xs font-bold text-[#888]">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-black transition">GitHub</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-black transition">LinkedIn</a>}
            </div>
          </header>

          {bio && (
            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]">Profile</h3>
              <p className="text-[#333] text-xs sm:text-sm leading-relaxed">{bio}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]">Expertise</h3>
              <p className="text-xs sm:text-sm text-[#444] leading-relaxed">{skills.join('  ·  ')}</p>
            </section>
          )}

          {projects.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]">Case Projects</h3>
              <div className="divide-y divide-slate-100">
                {projects.map((p, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold">{p.title}</h4>
                      <p className="text-[#555] text-xs leading-normal">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 7: DARK MODE PROFESSIONAL (dark)
     ========================================== */
  if (theme === 'dark') {
    return (
      <div className="min-h-screen bg-[#080d1a] text-[#e2e8f0] py-16 px-6 font-sans">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="flex flex-col gap-3 pb-8 border-b border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded w-fit">Developer Hub</span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{name}</h1>
            <p className="text-base text-slate-400 font-semibold">{title}</p>
            {bio && <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-3xl mt-2">{bio}</p>}
            <div className="flex gap-4 mt-4 text-xs font-bold text-cyan-400">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-300">GitHub Profile</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-300">LinkedIn Profile</a>}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              {skills.length > 0 && (
                <div className="bg-[#11192e] p-6 rounded-2xl border border-slate-800 shadow-md">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Core Stack</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-semibold">{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              {projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Products Shipped</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((p, idx) => (
                      <div key={idx} className="bg-[#11192e]/40 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-white text-base">{p.title}</h4>
                          <div className="flex gap-2">
                            {p.githubLink && <a href={p.githubLink} className="text-slate-400 hover:text-white"><Github size={14}/></a>}
                            {p.liveLink && <a href={p.liveLink} className="text-slate-400 hover:text-white"><ExternalLink size={14}/></a>}
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 8: FUTURISTIC TECH (futuristic)
     ========================================== */
  if (theme === 'futuristic') {
    return (
      <div className="min-h-screen bg-[#03000a] text-purple-100 font-sans py-16 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <header className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
            <span className="text-[10px] font-bold text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full uppercase tracking-wider mb-4 flex items-center gap-1.5"><Terminal size={12}/> NEXTGEN SYSTEMS</span>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-purple-300 to-pink-400 bg-clip-text text-transparent">{name}</h1>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">{title}</p>
            <div className="flex gap-4 mt-6">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 transition-colors"><Github size={12}/> github</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 transition-colors"><Linkedin size={12}/> linkedin</a>}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:col-span-1">
                <h3 className="font-bold text-xs uppercase tracking-widest text-pink-400 mb-4">Core Core Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => <span key={i} className="text-[10px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300 font-semibold">{s}</span>)}
                </div>
              </div>
            )}

            <div className="md:col-span-2 space-y-6">
              {projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-pink-400 pl-1">Engineered Operations</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((p, idx) => (
                      <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition duration-300">
                        <h4 className="font-bold text-white text-base">{p.title}</h4>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">{p.description}</p>
                        {p.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {p.technologies.map((t, i) => <span key={i} className="text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded font-semibold">{t}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 9: PERSONAL BRAND (personal)
     ========================================== */
  if (theme === 'personal') {
    return (
      <div className="min-h-screen bg-[#fdfcf7] text-[#2d2a26] font-serif py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <h1 className="text-5xl font-medium tracking-wide">{name}</h1>
            <div className="w-16 h-0.5 bg-amber-600 mx-auto"></div>
            <p className="text-lg italic text-slate-600">{title}</p>
            <div className="flex justify-center gap-4 text-xs font-semibold text-amber-700 pt-2 font-sans">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
            </div>
          </header>

          {bio && (
            <section className="bg-[#f5f0e6] p-8 rounded-2xl border border-[#ebdcc4] text-left">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#855e34] mb-3">About My Journey</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{bio}</p>
            </section>
          )}

          {projects.length > 0 && (
            <section className="space-y-6 pt-8 border-t border-[#ebdcc4]/50">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Featured Creations</h3>
              {projects.map((p, idx) => (
                <div key={idx} className="bg-white p-6 border border-[#ebdcc4]/30 rounded-xl shadow-sm space-y-2">
                  <h4 className="text-2xl font-medium text-[#2d2a26]">{p.title}</h4>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{p.description}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 10: STUDENT PORTFOLIO (student)
     ========================================== */
  if (theme === 'student') {
    return (
      <div className="min-h-screen bg-[#f3faf6] text-[#0f3422] font-sans py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden">
          <header className="bg-emerald-600 text-white p-10 text-center flex flex-col items-center">
            <h1 className="text-4xl font-black">{name}</h1>
            <p className="text-emerald-100 text-sm font-semibold mt-3 bg-emerald-700/40 border border-emerald-500/20 px-4 py-1.5 rounded-full">{title}</p>
            <div className="flex gap-4 mt-6 text-xs font-bold text-emerald-100">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-white underline">github</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-white underline">linkedin</a>}
            </div>
          </header>

          <div className="p-8 sm:p-12 space-y-8">
            {bio && (
              <div className="bg-[#e6f4ed] p-6 rounded-2xl border border-emerald-200/50">
                <h3 className="font-bold text-emerald-800 text-sm mb-2">Introduction</h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{bio}</p>
              </div>
            )}

            {education.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-base font-black text-emerald-700 border-b border-emerald-100 pb-2 flex items-center gap-2"><BookOpen size={18}/> Academic Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {education.map((e, idx) => (
                    <div key={idx} className="border border-emerald-100 p-5 rounded-xl bg-white">
                      <h4 className="font-bold text-sm text-[#0f3422]">{e.degree}</h4>
                      <p className="text-emerald-600 text-xs font-semibold">{e.institution} ({e.startYear} - {e.endYear})</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-base font-black text-emerald-700 border-b border-emerald-100 pb-2 flex items-center gap-2"><Code size={18}/> Student Projects</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p, idx) => (
                    <div key={idx} className="border border-emerald-100 p-5 rounded-xl bg-white hover:bg-emerald-50/30 transition">
                      <h4 className="font-bold text-sm text-[#0f3422]">{p.title}</h4>
                      <p className="text-xs text-slate-600 mt-2">{p.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 11: PRODUCT MANAGER (pm)
     ========================================== */
  if (theme === 'pm') {
    return (
      <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">Product Strategy</span>
              <h1 className="text-4xl font-extrabold text-slate-900 mt-3">{name}</h1>
              <p className="text-lg text-slate-500 font-medium mt-1">{title}</p>
            </div>
            <div className="flex gap-3 text-xs">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold transition"><Github size={14}/></a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold transition"><Linkedin size={14}/></a>}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              {bio && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-xs uppercase text-slate-400 mb-2">Vision Statement</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{bio}</p>
                </div>
              )}

              {skills.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-xs uppercase text-slate-400 mb-3">Core Focus</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 font-semibold">{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-8">
              {projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5 pl-1">Roadmap & Outcomes</h3>
                  <div className="space-y-4">
                    {projects.map((p, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-900">{p.title}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">SHIPPED</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     THEME 12: AGENCY PORTFOLIO (agency)
     ========================================== */
  if (theme === 'agency') {
    return (
      <div className="min-h-screen bg-black text-white font-sans py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          <header className="flex flex-col items-start gap-4">
            <span className="text-xs font-black bg-[#fbbf24] text-black px-3 py-1 uppercase tracking-widest">CAPABILITIES PORTFOLIO</span>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">{name}</h1>
            <p className="text-xl text-[#fbbf24] font-bold uppercase tracking-wide">{title}</p>
            {bio && <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mt-2">{bio}</p>}
            <div className="flex gap-4 text-xs font-black uppercase pt-4">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="text-[#fbbf24] hover:underline">/ GitHub</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-[#fbbf24] hover:underline">/ LinkedIn</a>}
            </div>
          </header>

          {projects.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-2xl font-black tracking-tighter uppercase border-b-2 border-white/20 pb-2">Selected Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((p, idx) => (
                  <div key={idx} className="border-4 border-white p-6 bg-zinc-950 hover:bg-black transition duration-300 relative group">
                    <span className="absolute right-4 top-4 text-xs font-black text-[#fbbf24]">0{idx + 1} /</span>
                    <h4 className="text-xl font-black uppercase text-white mt-2">{p.title}</h4>
                    <p className="text-slate-400 text-xs mt-3 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-2xl font-black tracking-tighter uppercase border-b-2 border-white/20 pb-2">Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => <span key={i} className="text-xs font-black border-2 border-[#fbbf24] text-[#fbbf24] px-4 py-2 hover:bg-[#fbbf24] hover:text-black transition">{s.toUpperCase()}</span>)}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================
     LEGACY FALLBACKS: NEON & BOLD
     ========================================== */
  if (theme === 'neon') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-16 px-6 font-mono relative">
        <div className="max-w-3xl mx-auto space-y-12">
          <header className="text-center">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">{name}</h1>
            <p className="text-xl mt-2 text-cyan-400 font-bold tracking-widest">{title}</p>
          </header>
          
          {bio && (
            <div className="border border-pink-500/30 p-6 rounded shadow-[0_0_15px_rgba(236,72,153,0.1)] bg-gray-800/50">
              <p className="text-pink-100">{bio}</p>
            </div>
          )}
          
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {skills.map((s, i) => <span key={i} className="border border-cyan-500 text-cyan-400 px-4 py-1 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]">{s}</span>)}
            </div>
          )}
          
          {experience && experience.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-pink-500 border-b border-pink-500/30 pb-2">Experience</h3>
              {experience.map((exp, i) => (
                <div key={i} className="bg-gray-800 p-5 rounded border-l-4 border-cyan-500 shadow-md">
                  <h4 className="font-bold text-white">{exp.position} <span className="text-cyan-400">@ {exp.company}</span></h4>
                  <p className="text-xs text-gray-400 mt-1">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (theme === 'bold') {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-950 via-purple-900 to-slate-950 text-slate-100 font-body py-16 px-6">
        <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto flex flex-col gap-12 relative z-10">
          <header className="text-center pb-8 border-b border-white/10">
            <h1 className="font-heading text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-teal-300 bg-clip-text text-transparent leading-none">{name}</h1>
            <p className="text-lg text-teal-300 font-semibold tracking-wide mt-3 uppercase">{title}</p>
            <div className="flex justify-center gap-4 mt-6">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"><Github size={18} /></a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"><Linkedin size={18} /></a>}
            </div>
          </header>

          {bio && (
            <section className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <h3 className="font-heading text-base font-bold text-white mb-2">My Journey</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{bio}</p>
            </section>
          )}

          {skills && skills.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Expertise</h3>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs text-indigo-200 font-semibold">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {projects && projects.length > 0 && (
            <section className="flex flex-col gap-6">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Portfolio Projects</h3>
              <div className="grid grid-cols-1 gap-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all duration-300">
                    <h4 className="font-heading text-xl font-bold text-white">{proj.title}</h4>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

    return null;
  };

  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": name,
      "jobTitle": title,
      "description": bio,
      "url": `https://www.placemate.me/portfolio/${username}`,
      "sameAs": [githubUrl, linkedinUrl].filter(Boolean)
    }
  };

  return (
    <>
      <SEO 
        title={`${name} | ${title}`} 
        description={bio || `View the professional portfolio of ${name}, ${title}.`} 
        schema={portfolioSchema}
      />
      {renderTheme()}
    </>
  );
}

export default PortfolioPage;
