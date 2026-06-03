import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  User, BookOpen, Briefcase, Code, Compass, 
  Save, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';

function ProfileTab() {
  const { user, checkUserSession } = useAuth();
  
  // Section toggle state (accordions)
  const [activeSection, setActiveSection] = useState('bio'); // 'bio', 'skills', 'education', 'experience', 'projects'
  
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-bold text-white">Edit Professional Profile</h2>
        <p className="text-sm text-slate-400">
          Modify your profile details. Changes are updated immediately on your public portfolio page.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {message.text && (
        <div className={`flex items-start gap-3 p-4 rounded-lg text-xs animate-shake
          ${message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
            : 'bg-brand-error/10 border border-brand-error/25 text-brand-error'}`}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
        
        {/* SECTION 1: Bio & Socials */}
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
          <button
            type="button"
            onClick={() => toggleSection('bio')}
            className="w-full flex justify-between items-center px-6 py-4 bg-white/3 hover:bg-white/5 text-left text-sm font-bold text-white transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User size={16} className="text-brand-secondary" />
              <span>Personal Bio & Socials</span>
            </div>
            {activeSection === 'bio' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {activeSection === 'bio' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Fullstack Engineer"
                    className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={profileData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Bio Summary</label>
                  <textarea
                    placeholder="Tell recruiters about yourself..."
                    rows={1}
                    className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none resize-y min-h-[42px]"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={profileData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={profileData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Skills */}
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className="w-full flex justify-between items-center px-6 py-4 bg-white/3 hover:bg-white/5 text-left text-sm font-bold text-white transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code size={16} className="text-brand-secondary" />
              <span>Core Skills & Tags</span>
            </div>
            {activeSection === 'skills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'skills' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TypeScript"
                  className="flex-grow px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-lg bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary border border-brand-secondary/30 font-semibold text-xs cursor-pointer"
                >
                  Add Skill
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.skills.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No skills registered.</span>
                ) : (
                  profileData.skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-500 hover:text-brand-error font-bold ml-1 cursor-pointer">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Education */}
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
          <button
            type="button"
            onClick={() => toggleSection('education')}
            className="w-full flex justify-between items-center px-6 py-4 bg-white/3 hover:bg-white/5 text-left text-sm font-bold text-white transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-brand-secondary" />
              <span>Education Background</span>
            </div>
            {activeSection === 'education' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'education' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">List schools and degrees</span>
                <button
                  type="button"
                  onClick={handleAddEdu}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add School</span>
                </button>
              </div>

              {profileData.education.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 italic">No education entries added.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="relative bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveEdu(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">School / University</label>
                          <input
                            type="text"
                            placeholder="e.g. Standford"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.institution}
                            onChange={(e) => handleEduChange(index, 'institution', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Degree</label>
                          <input
                            type="text"
                            placeholder="e.g. Master in CS"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.degree}
                            onChange={(e) => handleEduChange(index, 'degree', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Field of Study</label>
                          <input
                            type="text"
                            placeholder="e.g. Artificial Intelligence"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleEduChange(index, 'fieldOfStudy', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Start Year</label>
                          <input
                            type="number"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.startYear}
                            onChange={(e) => handleEduChange(index, 'startYear', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">End Year</label>
                          <input
                            type="number"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
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
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
          <button
            type="button"
            onClick={() => toggleSection('experience')}
            className="w-full flex justify-between items-center px-6 py-4 bg-white/3 hover:bg-white/5 text-left text-sm font-bold text-white transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-brand-secondary" />
              <span>Work Experience</span>
            </div>
            {activeSection === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'experience' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">List professional positions</span>
                <button
                  type="button"
                  onClick={handleAddExp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add Experience</span>
                </button>
              </div>

              {profileData.experience.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 italic">No experience entries added.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="relative bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveExp(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Company</label>
                          <input
                            type="text"
                            placeholder="e.g. Google"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.company}
                            onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Position</label>
                          <input
                            type="text"
                            placeholder="e.g. Software Engineer"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.position}
                            onChange={(e) => handleExpChange(index, 'position', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. San Francisco"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.location}
                            onChange={(e) => handleExpChange(index, 'location', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Start Date</label>
                          <input
                            type="text"
                            placeholder="Jan 2023"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.startDate}
                            onChange={(e) => handleExpChange(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">End Date</label>
                          <input
                            type="text"
                            placeholder="Present"
                            disabled={exp.current}
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none disabled:opacity-50"
                            value={exp.current ? 'Present' : exp.endDate}
                            onChange={(e) => handleExpChange(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id={`profile-job-${index}`}
                          type="checkbox"
                          className="w-4 h-4 rounded accent-brand-secondary"
                          checked={exp.current}
                          onChange={(e) => handleExpChange(index, 'current', e.target.checked)}
                        />
                        <label htmlFor={`profile-job-${index}`} className="text-xs text-slate-400 cursor-pointer select-none">I currently work here</label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Description</label>
                        <textarea
                          placeholder="Describe your role and impact..."
                          rows={2}
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
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
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
          <button
            type="button"
            onClick={() => toggleSection('projects')}
            className="w-full flex justify-between items-center px-6 py-4 bg-white/3 hover:bg-white/5 text-left text-sm font-bold text-white transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-brand-secondary" />
              <span>Projects Portfolio</span>
            </div>
            {activeSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'projects' && (
            <div className="p-6 border-t border-white/5 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Log portfolio projects</span>
                <button
                  type="button"
                  onClick={handleAddProj}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add Project</span>
                </button>
              </div>

              {profileData.projects.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 italic">No projects added.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {profileData.projects.map((proj, index) => (
                    <div key={index} className="relative bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveProj(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Project Title</label>
                        <input
                          type="text"
                          placeholder="e.g. My Website"
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                          value={proj.title}
                          onChange={(e) => handleProjChange(index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Project Description</label>
                        <textarea
                          placeholder="Write a brief overview..."
                          rows={2}
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                          value={proj.description}
                          onChange={(e) => handleProjChange(index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">GitHub Link</label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={proj.githubLink}
                            onChange={(e) => handleProjChange(index, 'githubLink', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Live Link</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={proj.liveLink}
                            onChange={(e) => handleProjChange(index, 'liveLink', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Technologies (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="React, CSS, Node"
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg shadow-brand-primary/20 disabled:opacity-75 self-start active:scale-[0.98] mt-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Profile Changes</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}

export default ProfileTab;
