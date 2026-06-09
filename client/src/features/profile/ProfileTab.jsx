import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  User, BookOpen, Briefcase, Code, Compass, 
  Save, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, X 
} from 'lucide-react';

function ProfileTab() {
  const { user, checkUserSession } = useAuth();
  
  // Section toggle state (accordions)
  const [activeSection, setActiveSection] = useState('bio');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Local profile states
  const [profileData, setProfileData] = useState({
    bio: '',
    title: '',
    githubUrl: '',
    linkedinUrl: '',
    skills: [],
    education: [],
    experience: [],
    projects: []
  });

  const [skillInput, setSkillInput] = useState('');

  // Load user data on mount
  useEffect(() => {
    if (user && user.profile) {
      setProfileData({
        bio: user.profile.bio || '',
        title: user.profile.title || '',
        githubUrl: user.profile.githubUrl || '',
        linkedinUrl: user.profile.linkedinUrl || '',
        skills: user.profile.skills || [],
        education: user.profile.education || [],
        experience: user.profile.experience || [],
        projects: user.profile.projects || []
      });
    }
  }, [user]);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/api/profile', {
        profile: profileData
      });
      await checkUserSession(); // Refresh session values in context
      setMessage({ type: 'success', text: 'Professional profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  /* Helper dynamic operations */
  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !profileData.skills.includes(cleanSkill)) {
      setProfileData(prev => ({ ...prev, skills: [...prev.skills, cleanSkill] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddEdu = () => {
    setProfileData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() }
      ]
    }));
  };

  const handleEduChange = (index, field, value) => {
    const newEdu = [...profileData.education];
    newEdu[index][field] = value;
    setProfileData(prev => ({ ...prev, education: newEdu }));
  };

  const handleRemoveEdu = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddExp = () => {
    setProfileData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }
      ]
    }));
  };

  const handleExpChange = (index, field, value) => {
    const newExp = [...profileData.experience];
    newExp[index][field] = value;
    setProfileData(prev => ({ ...prev, experience: newExp }));
  };

  const handleRemoveExp = (index) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddProj = () => {
    setProfileData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: '', description: '', technologies: [], githubLink: '', liveLink: '' }
      ]
    }));
  };

  const handleProjChange = (index, field, value) => {
    const newProj = [...profileData.projects];
    if (field === 'technologies') {
      newProj[index][field] = value.split(',').map(t => t.trim()).filter(Boolean);
    } else {
      newProj[index][field] = value;
    }
    setProfileData(prev => ({ ...prev, projects: newProj }));
  };

  const handleRemoveProj = (index) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  // Reusable styling classes
  const inputClass = "w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all duration-250";
  const labelClass = "text-xs font-bold text-slate-400 tracking-wider uppercase";

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-3xl animate-fade-in text-left">
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white">Edit Profile Details</h2>
        <p className="text-xs md:text-sm text-slate-400">
          Your master candidate profile dynamically powers your ATS resumes, portfolio, and daily job recommendations.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {message.text && (
        <div className={`flex items-start gap-3 p-4 rounded-xl text-xs animate-shake
          ${message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
            : 'bg-brand-error/10 border border-brand-error/25 text-brand-error'}`}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
        
        {/* SECTION 1: Bio & Socials */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md">
          <button
            type="button"
            onClick={() => toggleSection('bio')}
            className={`w-full flex justify-between items-center px-6 py-4.5 text-left text-sm font-bold transition-all duration-200 cursor-pointer
              ${activeSection === 'bio' ? 'bg-white/4 text-brand-primary' : 'bg-transparent text-slate-200 hover:bg-white/2 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <User size={16} className={activeSection === 'bio' ? 'text-brand-primary' : 'text-slate-400'} />
              <span>Personal Bio & Social Links</span>
            </div>
            {activeSection === 'bio' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {activeSection === 'bio' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-5 bg-black/5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Fullstack Engineer"
                    className={inputClass}
                    value={profileData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Bio Summary</label>
                  <textarea
                    placeholder="Tell recruiters about your key achievements..."
                    rows={1}
                    className={`${inputClass} resize-y min-h-[46px]`}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/your-username"
                    className={inputClass}
                    value={profileData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/your-username"
                    className={inputClass}
                    value={profileData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Skills */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md">
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className={`w-full flex justify-between items-center px-6 py-4.5 text-left text-sm font-bold transition-all duration-200 cursor-pointer
              ${activeSection === 'skills' ? 'bg-white/4 text-brand-primary' : 'bg-transparent text-slate-200 hover:bg-white/2 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Code size={16} className={activeSection === 'skills' ? 'text-brand-primary' : 'text-slate-400'} />
              <span>Core Expertise Skills</span>
            </div>
            {activeSection === 'skills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'skills' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-4 bg-black/5 animate-fade-in">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, AWS"
                  className={inputClass}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-5 py-3 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 font-bold text-xs cursor-pointer shrink-0 transition-colors"
                >
                  Add Pill
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2.5 mt-2">
                {profileData.skills.length === 0 ? (
                  <span className="text-xs text-slate-500 italic py-1">No skill tags registered. Add some above.</span>
                ) : (
                  profileData.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold group hover:bg-white/8 hover:text-white transition-all duration-150"
                    >
                      <span>{skill}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)} 
                        className="p-0.5 rounded-full text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-colors"
                        title={`Remove ${skill}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Education */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md">
          <button
            type="button"
            onClick={() => toggleSection('education')}
            className={`w-full flex justify-between items-center px-6 py-4.5 text-left text-sm font-bold transition-all duration-200 cursor-pointer
              ${activeSection === 'education' ? 'bg-white/4 text-brand-primary' : 'bg-transparent text-slate-200 hover:bg-white/2 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={16} className={activeSection === 'education' ? 'text-brand-primary' : 'text-slate-400'} />
              <span>Educational Timeline</span>
            </div>
            {activeSection === 'education' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'education' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-6 bg-black/5 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Log educational institutions and courses</span>
                <button
                  type="button"
                  onClick={handleAddEdu}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Add School</span>
                </button>
              </div>

              {profileData.education.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 italic">No education logs. Click "Add School" to create one.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="relative bg-slate-900/35 p-5 rounded-xl border border-white/5 flex flex-col gap-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleRemoveEdu(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-colors"
                        title="Remove school"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>School / University</label>
                          <input
                            type="text"
                            placeholder="e.g. Stanford University"
                            className={inputClass}
                            value={edu.institution}
                            onChange={(e) => handleEduChange(index, 'institution', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Degree / Certificate</label>
                          <input
                            type="text"
                            placeholder="e.g. Bachelor of Science"
                            className={inputClass}
                            value={edu.degree}
                            onChange={(e) => handleEduChange(index, 'degree', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Field of Study</label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Engineering"
                            className={inputClass}
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleEduChange(index, 'fieldOfStudy', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Start Year</label>
                          <input
                            type="number"
                            className={inputClass}
                            value={edu.startYear}
                            onChange={(e) => handleEduChange(index, 'startYear', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>End Year (Or Expected)</label>
                          <input
                            type="number"
                            className={inputClass}
                            value={edu.endYear}
                            onChange={(e) => handleEduChange(index, 'endYear', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: Experience */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md">
          <button
            type="button"
            onClick={() => toggleSection('experience')}
            className={`w-full flex justify-between items-center px-6 py-4.5 text-left text-sm font-bold transition-all duration-200 cursor-pointer
              ${activeSection === 'experience' ? 'bg-white/4 text-brand-primary' : 'bg-transparent text-slate-200 hover:bg-white/2 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={16} className={activeSection === 'experience' ? 'text-brand-primary' : 'text-slate-400'} />
              <span>Work History Logs</span>
            </div>
            {activeSection === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'experience' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-6 bg-black/5 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Log professional work experience</span>
                <button
                  type="button"
                  onClick={handleAddExp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Add Work</span>
                </button>
              </div>

              {profileData.experience.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 italic">No work history logged. Click "Add Work" to add one.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="relative bg-slate-900/35 p-5 rounded-xl border border-white/5 flex flex-col gap-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleRemoveExp(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-colors"
                        title="Remove role"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Company Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Google India"
                            className={inputClass}
                            value={exp.company}
                            onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Role Position</label>
                          <input
                            type="text"
                            placeholder="e.g. SDE Intern"
                            className={inputClass}
                            value={exp.position}
                            onChange={(e) => handleExpChange(index, 'position', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Bangalore, Remote"
                            className={inputClass}
                            value={exp.location}
                            onChange={(e) => handleExpChange(index, 'location', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Start Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Jan 2024"
                            className={inputClass}
                            value={exp.startDate}
                            onChange={(e) => handleExpChange(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>End Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Present"
                            disabled={exp.current}
                            className={`${inputClass} disabled:opacity-40`}
                            value={exp.current ? 'Present' : exp.endDate}
                            onChange={(e) => handleExpChange(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <input
                          id={`profile-job-${index}`}
                          type="checkbox"
                          className="w-4 h-4 rounded border-white/10 bg-black/40 text-brand-primary focus:ring-0 cursor-pointer"
                          checked={exp.current}
                          onChange={(e) => handleExpChange(index, 'current', e.target.checked)}
                        />
                        <label htmlFor={`profile-job-${index}`} className="text-xs text-slate-450 cursor-pointer select-none font-semibold">I currently work here</label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Role Details (Markdown supported)</label>
                        <textarea
                          placeholder="Describe your core deliverables and achievements..."
                          rows={3}
                          className={inputClass}
                          value={exp.description}
                          onChange={(e) => handleExpChange(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: Projects */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md">
          <button
            type="button"
            onClick={() => toggleSection('projects')}
            className={`w-full flex justify-between items-center px-6 py-4.5 text-left text-sm font-bold transition-all duration-200 cursor-pointer
              ${activeSection === 'projects' ? 'bg-white/4 text-brand-primary' : 'bg-transparent text-slate-200 hover:bg-white/2 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Compass size={16} className={activeSection === 'projects' ? 'text-brand-primary' : 'text-slate-400'} />
              <span>Project Showcases</span>
            </div>
            {activeSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'projects' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-6 bg-black/5 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Log academic or side software projects</span>
                <button
                  type="button"
                  onClick={handleAddProj}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Add Project</span>
                </button>
              </div>

              {profileData.projects.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 italic">No projects logged. Click "Add Project" to add one.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {profileData.projects.map((proj, index) => (
                    <div key={index} className="relative bg-slate-900/35 p-5 rounded-xl border border-white/5 flex flex-col gap-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleRemoveProj(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-colors"
                        title="Remove project"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Project Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Chat application using websockets"
                          className={inputClass}
                          value={proj.title}
                          onChange={(e) => handleProjChange(index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Project Description</label>
                        <textarea
                          placeholder="Explain what problem it solves and what you built..."
                          rows={2}
                          className={inputClass}
                          value={proj.description}
                          onChange={(e) => handleProjChange(index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Repository Link (GitHub)</label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            className={inputClass}
                            value={proj.githubLink}
                            onChange={(e) => handleProjChange(index, 'githubLink', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Live Preview Link</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            className={inputClass}
                            value={proj.liveLink}
                            onChange={(e) => handleProjChange(index, 'liveLink', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Technologies Used (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. React, TailwindCSS, Express, Socket.io"
                          className={inputClass}
                          value={proj.technologies ? proj.technologies.join(', ') : ''}
                          onChange={(e) => handleProjChange(index, 'technologies', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 disabled:opacity-75 self-start active:scale-[0.98] mt-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/45"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save Master Profile</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}

export default ProfileTab;
