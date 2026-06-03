import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Github, Linkedin, Mail, ExternalLink, Calendar, MapPin, Award, BookOpen, Briefcase, Code, AlertCircle, ArrowLeft } from 'lucide-react';

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

  // Loading state
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

  // Error/404 Page
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-brand-error animate-bounce-slow" />
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

  const { theme, name, title, bio, githubUrl, linkedinUrl, skills, education, experience, projects } = profile;

  /* RENDER THEME 1: MINIMAL SLATE */
  if (theme === 'minimal') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-body py-12 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-800">
            <div>
              <h1 className="font-heading text-4xl font-extrabold text-white tracking-tight">{name}</h1>
              <p className="text-lg text-slate-400 mt-1 font-medium">{title}</p>
            </div>
            <div className="flex gap-3">
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all duration-150">
                  <Github size={18} />
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all duration-150">
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </header>

          {/* Bio */}
          {bio && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">About Me</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{bio}</p>
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800/80 rounded-full text-xs text-slate-300 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-xl flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="font-heading text-base font-bold text-white">{proj.title}</h4>
                      <p className="text-slate-400 text-xs mt-1.5 leading-normal">{proj.description}</p>
                    </div>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5">
                          <Github size={12} />
                          <span>Code</span>
                        </a>
                      )}
                      {proj.liveLink && (
                        <a href={proj.liveLink} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5">
                          <ExternalLink size={12} />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Work Experience</h3>
              <div className="flex flex-col gap-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-slate-900/30 p-4 rounded-xl border border-slate-800/40">
                    <Briefcase size={16} className="text-slate-500 shrink-0 mt-1" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">{exp.position}</h4>
                          <span className="text-xs text-slate-400">{exp.company}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      {exp.description && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</h3>
              <div className="flex flex-col gap-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-slate-900/30 p-4 rounded-xl border border-slate-800/40">
                    <BookOpen size={16} className="text-slate-500 shrink-0 mt-1" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                          <span className="text-xs text-slate-400">{edu.institution}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">{edu.startYear} - {edu.endYear}</span>
                      </div>
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

  /* RENDER THEME 2: TERMINAL NEON */
  if (theme === 'dark') {
    return (
      <div className="min-h-screen bg-black text-[#10b981] font-mono py-12 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-8 border border-[#10b981]/30 p-6 sm:p-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          
          {/* Header */}
          <header className="border-b border-[#10b981]/30 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-slate-500 text-xs">&lt;developer-profile&gt;</span>
              <h1 className="text-3xl font-bold text-[#34d399] tracking-tight">{name}</h1>
              <p className="text-sm text-[#059669] mt-0.5">&gt; {title}</p>
            </div>
            <div className="flex gap-4">
              {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="text-xs hover:underline inline-flex items-center gap-1">github()</a>}
              {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-xs hover:underline inline-flex items-center gap-1">linkedin()</a>}
            </div>
          </header>

          {/* Bio */}
          {bio && (
            <section className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">jane@placemate:~$ cat bio.txt</span>
              <p className="text-sm text-[#a7f3d0] leading-relaxed">{bio}</p>
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">jane@placemate:~$ ls skills/</span>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#a7f3d0]">
                {skills.map((skill, idx) => (
                  <span key={idx}>* {skill}</span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="flex flex-col gap-4">
              <span className="text-xs text-slate-500">jane@placemate:~$ cat projects.json</span>
              <div className="grid grid-cols-1 gap-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="border border-[#10b981]/20 p-4 rounded bg-[#022c22]/10">
                    <h4 className="text-base font-bold text-[#34d399]">[ {proj.title} ]</h4>
                    <p className="text-xs text-[#a7f3d0] mt-1.5 leading-relaxed">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="text-[10px] text-[#059669] mt-2 font-semibold">
                        stack: {proj.technologies.join(', ')}
                      </div>
                    )}
                    <div className="flex gap-4 mt-3 text-xs">
                      {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="hover:underline">src_code</a>}
                      {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer" className="hover:underline">live_demo</a>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section className="flex flex-col gap-4">
              <span className="text-xs text-slate-500">jane@placemate:~$ cat experience.log</span>
              <div className="flex flex-col gap-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-[#10b981]/30 pl-4 py-1">
                    <div className="flex justify-between flex-wrap gap-2 text-xs">
                      <span className="font-bold text-[#34d399]">{exp.position} @ {exp.company}</span>
                      <span className="text-slate-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    {exp.description && <p className="text-xs text-[#a7f3d0] mt-1 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="flex flex-col gap-4">
              <span className="text-xs text-slate-500">jane@placemate:~$ cat education.log</span>
              <div className="flex flex-col gap-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold text-[#34d399]">{edu.degree}</span> - {edu.institution} ({edu.startYear} - {edu.endYear})
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    );
  }

  /* RENDER THEME 3: MESH GRADIENT */
  if (theme === 'bold') {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-950 via-purple-900 to-slate-950 text-slate-100 font-body py-16 px-6">
        
        {/* Glow Filters */}
        <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto flex flex-col gap-12 relative z-10">
          
          {/* Header */}
          <header className="text-center pb-8 border-b border-white/10">
            <h1 className="font-heading text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-teal-300 bg-clip-text text-transparent leading-none">{name}</h1>
            <p className="text-lg text-teal-300 font-semibold tracking-wide mt-3 uppercase">{title}</p>
            <div className="flex justify-center gap-4 mt-6">
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-150">
                  <Github size={18} />
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-150">
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </header>

          {/* Bio */}
          {bio && (
            <section className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <h3 className="font-heading text-base font-bold text-white mb-2">My Journey</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{bio}</p>
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Expertise</h3>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs text-indigo-200 font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="flex flex-col gap-6">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Portfolio Projects</h3>
              <div className="grid grid-cols-1 gap-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all duration-300">
                    <h4 className="font-heading text-xl font-bold text-white">{proj.title}</h4>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-0.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 rounded font-semibold">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 mt-5 pt-3 border-t border-white/5 text-xs font-semibold">
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1.5">
                          <Github size={14} />
                          <span>Repository</span>
                        </a>
                      )}
                      {proj.liveLink && (
                        <a href={proj.liveLink} target="_blank" rel="noreferrer" className="text-teal-300 hover:text-teal-200 inline-flex items-center gap-1.5">
                          <ExternalLink size={14} />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section className="flex flex-col gap-6">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Experience</h3>
              <div className="flex flex-col gap-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-heading text-lg font-bold text-white">{exp.position}</h4>
                        <span className="text-xs text-teal-300 font-semibold">{exp.company}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    {exp.description && <p className="text-xs text-slate-300 mt-3 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="flex flex-col gap-6">
              <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">Education</h3>
              <div className="flex flex-col gap-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h4 className="font-heading text-base font-bold text-white">{edu.degree}</h4>
                      <span className="text-xs text-slate-400">{edu.institution}</span>
                    </div>
                    <span className="text-xs text-teal-300 font-semibold">{edu.startYear} - {edu.endYear}</span>
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
}

export default PortfolioPage;
