import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  User, BookOpen, Briefcase, Code, Compass, 
  Save, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, X, Loader 
} from 'lucide-react';
import Button from '../../components/Button';

function ProfileTab() {
  const { user, checkUserSession } = useAuth();
  
  // Section toggle state (accordions)
  const [activeSection, setActiveSection] = useState('bio');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Local profile states
  const [profileData, setProfileData] = useState({
    fullName: '',
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
        fullName: user.profile?.fullName ?? '',
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
    const cleanSkill = skillInput.trim();
    if (cleanSkill) {
      if (e && e.preventDefault) e.preventDefault();
      if (!profileData.skills.includes(cleanSkill)) {
        setProfileData(prev => ({ ...prev, skills: [...prev.skills, cleanSkill] }));
        setSkillInput('');
      }
    }
  };

  const handleTextareaKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveProfile(e);
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
    const baseGit = profileData.githubUrl ? (profileData.githubUrl.endsWith('/') ? profileData.githubUrl : profileData.githubUrl + '/') : '';
    setProfileData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: '', description: '', technologies: [], githubLink: baseGit, liveLink: '' }
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
  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-3xl animate-fade-in text-left">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main">Edit Profile Details</h2>
        <p className="text-xs md:text-sm text-text-muted">
          Your master candidate profile dynamically powers your ATS resumes, portfolio, and daily job recommendations.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {message.text && (
        <div className={`flex items-start gap-3 p-4 rounded-md text-xs
          ${message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-status-success' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
        
        {/* SECTION 1: Bio & Socials */}
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border">
          <button
            type="button"
            onClick={() => toggleSection('bio')}
            className={`w-full flex justify-between items-center px-6 py-4 text-left text-sm font-bold transition-all duration-200 cursor-pointer border-b
              ${activeSection === 'bio' ? 'bg-brand-surface border-brand-border text-text-main' : 'bg-brand-bg border-transparent text-text-secondary hover:bg-brand-surface'}`}
          >
            <div className="flex items-center gap-3">
              <User size={16} className={activeSection === 'bio' ? 'text-text-main' : 'text-text-muted'} />
              <span>Personal Bio & Social Links</span>
            </div>
            {activeSection === 'bio' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {activeSection === 'bio' && (
            <div className="p-6 flex flex-col gap-6 bg-brand-bg animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    className={inputClass}
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
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
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Bio Summary</label>
                  <textarea
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${el.scrollHeight}px`;
                      }
                    }}
                    placeholder="Tell recruiters about your key achievements..."
                    rows={1}
                    className={`${inputClass} resize-none overflow-hidden min-h-[46px]`}
                    value={profileData.bio}
                    onKeyDown={handleTextareaKeyDown}
                    onChange={(e) => {
                      handleInputChange('bio', e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    className={inputClass}
                    value={profileData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    onFocus={() => {
                      if (!profileData.githubUrl) handleInputChange('githubUrl', 'https://github.com/');
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    className={inputClass}
                    value={profileData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    onFocus={() => {
                      if (!profileData.linkedinUrl) handleInputChange('linkedinUrl', 'https://linkedin.com/in/');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Skills */}
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border">
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className={`w-full flex justify-between items-center px-6 py-4 text-left text-sm font-bold transition-all duration-200 cursor-pointer border-b
              ${activeSection === 'skills' ? 'bg-brand-surface border-brand-border text-text-main' : 'bg-brand-bg border-transparent text-text-secondary hover:bg-brand-surface'}`}
          >
            <div className="flex items-center gap-3">
              <Code size={16} className={activeSection === 'skills' ? 'text-text-main' : 'text-text-muted'} />
              <span>Core Expertise Skills</span>
            </div>
            {activeSection === 'skills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'skills' && (
            <div className="p-6 flex flex-col gap-4 bg-brand-bg animate-fade-in">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, AWS"
                  className={inputClass}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (skillInput.trim()) {
                        e.preventDefault();
                        handleAddSkill(e);
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="secondary"
                  className="py-3 px-5 shrink-0"
                >
                  Add Skill
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2.5 mt-2">
                {profileData.skills.length === 0 ? (
                  <span className="text-xs text-text-disabled italic py-1">No skill tags registered. Add some above.</span>
                ) : (
                  profileData.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-md bg-brand-surface border border-brand-border text-text-secondary text-xs font-semibold group hover:text-text-main transition-colors"
                    >
                      <span>{skill}</span>
                      <Button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)} 
                        variant="ghost"
                        size="sm"
                        className="p-0.5! hover:text-red-400 hover:bg-red-500/10"
                        title={`Remove ${skill}`}
                      >
                        <X size={12} />
                      </Button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Education */}
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border">
          <button
            type="button"
            onClick={() => toggleSection('education')}
            className={`w-full flex justify-between items-center px-6 py-4 text-left text-sm font-bold transition-all duration-200 cursor-pointer border-b
              ${activeSection === 'education' ? 'bg-brand-surface border-brand-border text-text-main' : 'bg-brand-bg border-transparent text-text-secondary hover:bg-brand-surface'}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={16} className={activeSection === 'education' ? 'text-text-main' : 'text-text-muted'} />
              <span>Educational Timeline</span>
            </div>
            {activeSection === 'education' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'education' && (
            <div className="p-6 flex flex-col gap-6 bg-brand-bg animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-disabled">Log educational institutions and courses</span>
                <Button
                  type="button"
                  onClick={handleAddEdu}
                  variant="secondary"
                  size="sm"
                >
                  <Plus size={12} className="mr-1.5" />
                  <span>Add School</span>
                </Button>
              </div>

              {profileData.education.length === 0 ? (
                <p className="text-center py-6 text-xs text-text-disabled italic">No education logs. Click "Add School" to create one.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="relative bg-brand-surface p-5 rounded-md border border-brand-border flex flex-col gap-5">
                      <Button
                        type="button"
                        onClick={() => handleRemoveEdu(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 p-1.5! hover:text-red-400 hover:bg-red-500/10"
                        title="Remove school"
                      >
                        <Trash2 size={14} />
                      </Button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>School / University</label>
                          <input
                            type="text"
                            placeholder="e.g. Stanford University"
                            className={inputClass}
                            value={edu.institution}
                            onChange={(e) => handleEduChange(index, 'institution', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Field of Study</label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Engineering"
                            className={inputClass}
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleEduChange(index, 'fieldOfStudy', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Start Year</label>
                          <input
                            type="number"
                            className={inputClass}
                            value={edu.startYear}
                            onChange={(e) => handleEduChange(index, 'startYear', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
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
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border">
          <button
            type="button"
            onClick={() => toggleSection('experience')}
            className={`w-full flex justify-between items-center px-6 py-4 text-left text-sm font-bold transition-all duration-200 cursor-pointer border-b
              ${activeSection === 'experience' ? 'bg-brand-surface border-brand-border text-text-main' : 'bg-brand-bg border-transparent text-text-secondary hover:bg-brand-surface'}`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={16} className={activeSection === 'experience' ? 'text-text-main' : 'text-text-muted'} />
              <span>Work History Logs</span>
            </div>
            {activeSection === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'experience' && (
            <div className="p-6 flex flex-col gap-6 bg-brand-bg animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-disabled">Log professional work experience</span>
                <Button
                  type="button"
                  onClick={handleAddExp}
                  variant="secondary"
                  size="sm"
                >
                  <Plus size={12} className="mr-1.5" />
                  <span>Add Work</span>
                </Button>
              </div>

              {profileData.experience.length === 0 ? (
                <p className="text-center py-6 text-xs text-text-disabled italic">No work history logged. Click "Add Work" to add one.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="relative bg-brand-surface p-5 rounded-md border border-brand-border flex flex-col gap-5">
                      <Button
                        type="button"
                        onClick={() => handleRemoveExp(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 p-1.5! hover:text-red-400 hover:bg-red-500/10"
                        title="Remove role"
                      >
                        <Trash2 size={14} />
                      </Button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Company Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Google India"
                            className={inputClass}
                            value={exp.company}
                            onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Bangalore, Remote"
                            className={inputClass}
                            value={exp.location}
                            onChange={(e) => handleExpChange(index, 'location', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Start Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Jan 2024"
                            className={inputClass}
                            value={exp.startDate}
                            onChange={(e) => handleExpChange(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
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

                      <div className="flex items-center gap-2">
                        <input
                          id={`profile-job-${index}`}
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-500 bg-brand-bg text-text-main focus:ring-0 cursor-pointer"
                          checked={exp.current}
                          onChange={(e) => handleExpChange(index, 'current', e.target.checked)}
                        />
                        <label htmlFor={`profile-job-${index}`} className="text-sm text-text-secondary cursor-pointer select-none">I currently work here</label>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className={labelClass}>Role Details (Markdown supported)</label>
                        <textarea
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          placeholder="Describe your core deliverables and achievements..."
                          rows={3}
                          className={`${inputClass} resize-none overflow-hidden`}
                          value={exp.description}
                          onKeyDown={handleTextareaKeyDown}
                          onChange={(e) => {
                            handleExpChange(index, 'description', e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
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
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border">
          <button
            type="button"
            onClick={() => toggleSection('projects')}
            className={`w-full flex justify-between items-center px-6 py-4 text-left text-sm font-bold transition-all duration-200 cursor-pointer border-b
              ${activeSection === 'projects' ? 'bg-brand-surface border-brand-border text-text-main' : 'bg-brand-bg border-transparent text-text-secondary hover:bg-brand-surface'}`}
          >
            <div className="flex items-center gap-3">
              <Compass size={16} className={activeSection === 'projects' ? 'text-text-main' : 'text-text-muted'} />
              <span>Project Showcases</span>
            </div>
            {activeSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'projects' && (
            <div className="p-6 flex flex-col gap-6 bg-brand-bg animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-disabled">Log academic or side software projects</span>
                <Button
                  type="button"
                  onClick={handleAddProj}
                  variant="secondary"
                  size="sm"
                >
                  <Plus size={12} className="mr-1.5" />
                  <span>Add Project</span>
                </Button>
              </div>

              {profileData.projects.length === 0 ? (
                <p className="text-center py-6 text-xs text-text-disabled italic">No projects logged. Click "Add Project" to add one.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {profileData.projects.map((proj, index) => (
                    <div key={index} className="relative bg-brand-surface p-5 rounded-md border border-brand-border flex flex-col gap-5">
                      <Button
                        type="button"
                        onClick={() => handleRemoveProj(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 p-1.5! hover:text-red-400 hover:bg-red-500/10"
                        title="Remove project"
                      >
                        <Trash2 size={14} />
                      </Button>

                      <div className="flex flex-col gap-2">
                        <label className={labelClass}>Project Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Chat application using websockets"
                          className={inputClass}
                          value={proj.title}
                          onChange={(e) => handleProjChange(index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className={labelClass}>Project Description</label>
                        <textarea
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          placeholder="Explain what problem it solves and what you built..."
                          rows={2}
                          className={`${inputClass} resize-none overflow-hidden`}
                          value={proj.description}
                          onKeyDown={handleTextareaKeyDown}
                          onChange={(e) => {
                            handleProjChange(index, 'description', e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Repository Link (GitHub)</label>
                          <input
                            type="url"
                            placeholder="https://github.com/username/repo"
                            className={inputClass}
                            value={proj.githubLink}
                            onChange={(e) => handleProjChange(index, 'githubLink', e.target.value)}
                            onFocus={() => {
                              if (!proj.githubLink) {
                                const baseGit = profileData.githubUrl ? (profileData.githubUrl.endsWith('/') ? profileData.githubUrl : profileData.githubUrl + '/') : 'https://github.com/';
                                handleProjChange(index, 'githubLink', baseGit);
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className={labelClass}>Live Preview Link</label>
                          <input
                            type="url"
                            placeholder="https://your-site.com"
                            className={inputClass}
                            value={proj.liveLink}
                            onChange={(e) => handleProjChange(index, 'liveLink', e.target.value)}
                            onFocus={() => {
                              if (!proj.liveLink) handleProjChange(index, 'liveLink', 'https://');
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
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
        <Button
          type="submit"
          disabled={isSaving}
          variant="primary"
          className="self-start mt-2"
        >
          {isSaving ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              <span>Save Master Profile</span>
            </>
          )}
        </Button>

      </form>
    </div>
  );
}

export default ProfileTab;
