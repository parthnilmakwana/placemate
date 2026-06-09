import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  User, BookOpen, Briefcase, Code, Compass, 
  ArrowRight, ArrowLeft, Plus, Trash2, Save, Sparkles, CheckCircle2 
} from 'lucide-react';

function OnboardingWizard() {
  const { user, checkUserSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  
  // Local state to model the User Profile Schema structure
  const [profileData, setProfileData] = useState({
    bio: '',
    title: '',
    githubUrl: '',
    linkedinUrl: '',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    preferences: {
      targetRoles: [],
      targetLocations: [],
      minimumSalary: 0,
      jobType: 'Any'
    }
  });

  // Local helper states for arrays
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // 1. Pre-fill state if user already has partial profile data
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
        projects: user.profile.projects || [],
        preferences: {
          targetRoles: user.profile.preferences?.targetRoles || [],
          targetLocations: user.profile.preferences?.targetLocations || [],
          minimumSalary: user.profile.preferences?.minimumSalary || 0,
          jobType: user.profile.preferences?.jobType || 'Any'
        }
      });
    }
  }, [user]);

  // 2. Auto-save profile every 10 seconds of user activity (debounce typing)
  useEffect(() => {
    if (!isDirty) return;
    
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await saveProfile(profileData, false);
        setSaveStatus('saved');
        setIsDirty(false);
      } catch (err) {
        setSaveStatus('error');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [profileData, isDirty]);

  // Central profile save API caller
  const saveProfile = async (data, finalize = false) => {
    return api.put('/api/profile', {
      profile: data,
      hasCompletedOnboarding: finalize ? true : undefined
    });
  };

  // Triggers manual update on input modifications
  const handleInputChange = (field, value) => {
    setIsDirty(true);
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Preference input change
  const handlePrefChange = (field, value) => {
    setIsDirty(true);
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  // Handle step updates and save on transitions
  const handleNextStep = async () => {
    setSaveStatus('saving');
    try {
      await saveProfile(profileData, false);
      setSaveStatus('saved');
      setIsDirty(false);
      setStep(prev => prev + 1);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  // Final wizard submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await saveProfile(profileData, true);
      setSaveStatus('saved');
      setIsDirty(false);
      await checkUserSession(); // Reload session in AuthContext
      navigate('/dashboard');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  /* Helper list operations: Skills, Education, Experience, Projects */
  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !profileData.skills.includes(cleanSkill)) {
      setIsDirty(true);
      const newSkills = [...profileData.skills, cleanSkill];
      setProfileData(prev => ({ ...prev, skills: newSkills }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setIsDirty(true);
    const newSkills = profileData.skills.filter(s => s !== skillToRemove);
    setProfileData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleAddEdu = () => {
    setIsDirty(true);
    setProfileData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear(), description: '' }
      ]
    }));
  };

  const handleEduChange = (index, field, value) => {
    setIsDirty(true);
    const newEdu = [...profileData.education];
    newEdu[index][field] = value;
    setProfileData(prev => ({ ...prev, education: newEdu }));
  };

  const handleRemoveEdu = (index) => {
    setIsDirty(true);
    const newEdu = profileData.education.filter((_, idx) => idx !== index);
    setProfileData(prev => ({ ...prev, education: newEdu }));
  };

  const handleAddExp = () => {
    setIsDirty(true);
    setProfileData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }
      ]
    }));
  };

  const handleExpChange = (index, field, value) => {
    setIsDirty(true);
    const newExp = [...profileData.experience];
    newExp[index][field] = value;
    setProfileData(prev => ({ ...prev, experience: newExp }));
  };

  const handleRemoveExp = (index) => {
    setIsDirty(true);
    const newExp = profileData.experience.filter((_, idx) => idx !== index);
    setProfileData(prev => ({ ...prev, experience: newExp }));
  };

  const handleAddProj = () => {
    setIsDirty(true);
    setProfileData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: '', description: '', technologies: [], githubLink: '', liveLink: '' }
      ]
    }));
  };

  const handleProjChange = (index, field, value) => {
    setIsDirty(true);
    const newProj = [...profileData.projects];
    
    if (field === 'technologies') {
      newProj[index][field] = value.split(',').map(t => t.trim()).filter(Boolean);
    } else {
      newProj[index][field] = value;
    }
    
    setProfileData(prev => ({ ...prev, projects: newProj }));
  };

  const handleRemoveProj = (index) => {
    setIsDirty(true);
    const newProj = profileData.projects.filter((_, idx) => idx !== index);
    setProfileData(prev => ({ ...prev, projects: newProj }));
  };

  const handleAddPrefRole = (e) => {
    e.preventDefault();
    const cleanRole = roleInput.trim();
    if (cleanRole && !profileData.preferences.targetRoles.includes(cleanRole)) {
      setIsDirty(true);
      const newRoles = [...profileData.preferences.targetRoles, cleanRole];
      setProfileData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, targetRoles: newRoles }
      }));
      setRoleInput('');
    }
  };

  const handleRemovePrefRole = (roleToRemove) => {
    setIsDirty(true);
    const newRoles = profileData.preferences.targetRoles.filter(r => r !== roleToRemove);
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, targetRoles: newRoles }
    }));
  };

  const handleAddPrefLocation = (e) => {
    e.preventDefault();
    const cleanLoc = locationInput.trim();
    if (cleanLoc && !profileData.preferences.targetLocations.includes(cleanLoc)) {
      setIsDirty(true);
      const newLocs = [...profileData.preferences.targetLocations, cleanLoc];
      setProfileData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, targetLocations: newLocs }
      }));
      setLocationInput('');
    }
  };

  const handleRemovePrefLocation = (locToRemove) => {
    setIsDirty(true);
    const newLocs = profileData.preferences.targetLocations.filter(l => l !== locToRemove);
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, targetLocations: newLocs }
    }));
  };

  // Helper mapping icon representations for current step
  const renderStepIcon = (stepNum) => {
    switch (stepNum) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <BookOpen className="w-5 h-5" />;
      case 3: return <Briefcase className="w-5 h-5" />;
      case 4: return <Code className="w-5 h-5" />;
      case 5: return <Compass className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStepTitle = (stepNum) => {
    switch (stepNum) {
      case 1: return 'Bio & Socials';
      case 2: return 'Education';
      case 3: return 'Experience';
      case 4: return 'Projects';
      case 5: return 'Preferences';
      default: return '';
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      
      {/* Background glow blobs */}
      <div className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-[130px] pointer-events-none z-0 animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-[-100px] left-[-150px] w-[500px] h-[500px] rounded-full bg-brand-secondary/10 blur-[130px] pointer-events-none z-0"></div>

      <header className="max-w-4xl mx-auto w-full flex justify-between items-center z-10 mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PlaceMate" className="w-11 h-11 object-contain" />
          <span className="font-heading text-xl font-extrabold text-white">PlaceMate Onboarding</span>
        </div>
        
        {/* Autosave Status indicator bubble */}
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-slate-400">
          {saveStatus === 'saving' && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              <span>Saving draft...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span>Draft saved to DB</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
              <span className="text-brand-error">Save failed!</span>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-grow z-10 flex flex-col justify-center mb-10">
        
        {/* Stepper progress headers */}
        <section className="mb-10">
          <div className="flex justify-between items-center gap-2 max-w-lg mx-auto mb-4">
            {[1, 2, 3, 4, 5].map(stepNum => (
              <React.Fragment key={stepNum}>
                <div 
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 font-heading font-semibold text-sm
                    ${step === stepNum 
                      ? 'border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110' 
                      : step > stepNum 
                        ? 'border-brand-secondary bg-brand-secondary/20 text-brand-secondary' 
                        : 'border-white/10 bg-black/30 text-slate-500'}`}
                >
                  {step > stepNum ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 5 && (
                  <div className={`h-[2px] flex-grow transition-colors duration-300
                    ${step > stepNum ? 'bg-brand-secondary/40' : 'bg-white/10'}`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Step {step} of 5</span>
            <h2 className="font-heading text-2xl font-bold mt-1 text-white">{getStepTitle(step)}</h2>
          </div>
        </section>

        {/* Wizard Form Frame */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl">
          
          {/* STEP 1: Bio & Socials */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Professional Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Full Stack Developer, Computer Engineering Student"
                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none transition-all duration-200"
                    value={profileData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Professional Bio</label>
                  <textarea 
                    placeholder="Describe your career goals, background, and summary..."
                    rows={1}
                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none transition-all duration-200 resize-y min-h-[46px]"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">GitHub Profile URL</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com/username"
                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none transition-all duration-200"
                    value={profileData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none transition-all duration-200"
                    value={profileData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  />
                </div>
              </div>

              {/* Skills inputs */}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Core Skills & Tools</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. React, Node.js, Python, MongoDB"
                    className="flex-grow px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none transition-all duration-200"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  />
                  <button 
                    onClick={handleAddSkill}
                    className="px-4 py-3 rounded-lg bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary border border-brand-secondary/30 font-semibold text-sm cursor-pointer transition-colors duration-150"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No skills added yet. Add a few above.</span>
                  ) : (
                    profileData.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs"
                      >
                        <span>{skill}</span>
                        <button 
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-brand-error text-slate-500 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-300">Add Academic Background</h4>
                <button
                  type="button"
                  onClick={handleAddEdu}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer transition-colors duration-150"
                >
                  <Plus size={14} />
                  <span>Add School</span>
                </button>
              </div>

              {profileData.education.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                  <p className="text-slate-500 text-sm">No education entries added. Click "Add School" to get started.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="relative bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveEdu(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-all duration-150"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Institution #{index + 1}</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">School / University</label>
                          <input
                            type="text"
                            placeholder="e.g. Stanford University"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.institution}
                            onChange={(e) => handleEduChange(index, 'institution', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Degree / Diploma</label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech Computer Engineering"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
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
                            placeholder="e.g. Computer Science"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleEduChange(index, 'fieldOfStudy', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Start Year</label>
                          <input
                            type="number"
                            placeholder="2022"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={edu.startYear}
                            onChange={(e) => handleEduChange(index, 'startYear', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">End Year (Expected)</label>
                          <input
                            type="number"
                            placeholder="2026"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
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

          {/* STEP 3: Experience */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-300">Add Professional Experience</h4>
                <button
                  type="button"
                  onClick={handleAddExp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer transition-colors duration-150"
                >
                  <Plus size={14} />
                  <span>Add Experience</span>
                </button>
              </div>

              {profileData.experience.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                  <p className="text-slate-500 text-sm">No experiences added. Click "Add Experience" to add internships or jobs.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="relative bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveExp(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-all duration-150"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Experience #{index + 1}</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Company Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Google, Startup Inc."
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.company}
                            onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Role / Position</label>
                          <input
                            type="text"
                            placeholder="e.g. Software Engineer Intern"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
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
                            placeholder="e.g. Mumbai (Remote)"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.location}
                            onChange={(e) => handleExpChange(index, 'location', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Start Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Jan 2024"
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={exp.startDate}
                            onChange={(e) => handleExpChange(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">End Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Present"
                            disabled={exp.current}
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none disabled:opacity-50"
                            value={exp.current ? 'Present' : exp.endDate}
                            onChange={(e) => handleExpChange(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id={`current-job-${index}`}
                          type="checkbox"
                          className="w-4 h-4 rounded accent-brand-secondary"
                          checked={exp.current}
                          onChange={(e) => handleExpChange(index, 'current', e.target.checked)}
                        />
                        <label htmlFor={`current-job-${index}`} className="text-xs text-slate-400 cursor-pointer select-none">
                          I currently work here
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Projects */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-300">Add Key Projects</h4>
                <button
                  type="button"
                  onClick={handleAddProj}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 text-brand-primary cursor-pointer transition-colors duration-150"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

              {profileData.projects.length === 0 ? (
                <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                  <p className="text-slate-500 text-sm">No project entries added. Click "Add Project" to log your portfolio works.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {profileData.projects.map((proj, index) => (
                    <div key={index} className="relative bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveProj(index)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-brand-error hover:bg-brand-error/10 cursor-pointer transition-all duration-150"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Project #{index + 1}</span>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Project Title</label>
                        <input
                          type="text"
                          placeholder="e.g. PlaceMate AI Agent"
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                          value={proj.title}
                          onChange={(e) => handleProjChange(index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Project Description</label>
                        <textarea
                          placeholder="Write a brief overview of the project and key deliverables..."
                          rows={2}
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
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
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={proj.githubLink}
                            onChange={(e) => handleProjChange(index, 'githubLink', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Live Demo Link</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                            value={proj.liveLink}
                            onChange={(e) => handleProjChange(index, 'liveLink', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Technologies Used (Comma-separated)</label>
                        <input
                          type="text"
                          placeholder="React, TailwindCSS, Express, MongoDB"
                          className="px-3.5 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
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

          {/* STEP 5: Preferences */}
          {step === 5 && (
            <div className="flex flex-col gap-6">
              
              {/* Job roles preference */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Job Roles</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer, Fullstack Developer"
                    className="flex-grow px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPrefRole(e)}
                  />
                  <button
                    onClick={handleAddPrefRole}
                    className="px-4 py-3 rounded-lg bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary border border-brand-secondary/30 font-semibold text-sm cursor-pointer transition-colors duration-150"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.preferences.targetRoles.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No roles selected.</span>
                  ) : (
                    profileData.preferences.targetRoles.map((role, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                        <span>{role}</span>
                        <button onClick={() => handleRemovePrefRole(role)} className="hover:text-brand-error text-slate-500 font-bold ml-1 cursor-pointer">×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Locations preference */}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Locations</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Remote, Bangalore, Mumbai"
                    className="flex-grow px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPrefLocation(e)}
                  />
                  <button
                    onClick={handleAddPrefLocation}
                    className="px-4 py-3 rounded-lg bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary border border-brand-secondary/30 font-semibold text-sm cursor-pointer transition-colors duration-150"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.preferences.targetLocations.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No locations selected.</span>
                  ) : (
                    profileData.preferences.targetLocations.map((loc, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                        <span>{loc}</span>
                        <button onClick={() => handleRemovePrefLocation(loc)} className="hover:text-brand-error text-slate-500 font-bold ml-1 cursor-pointer">×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Salary & Job Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Minimum Annual Salary (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 600000"
                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={profileData.preferences.minimumSalary}
                    onChange={(e) => handlePrefChange('minimumSalary', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Job Type Preference</label>
                  <select
                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:border-brand-primary/50 focus:outline-none"
                    value={profileData.preferences.jobType}
                    onChange={(e) => handlePrefChange('jobType', e.target.value)}
                  >
                    <option value="Any" className="bg-slate-900 text-white">Any Type</option>
                    <option value="Full-time" className="bg-slate-900 text-white">Full-time</option>
                    <option value="Part-time" className="bg-slate-900 text-white">Part-time</option>
                    <option value="Internship" className="bg-slate-900 text-white">Internship</option>
                    <option value="Contract" className="bg-slate-900 text-white">Contract</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
            <button
              type="button"
              disabled={step === 1}
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg shadow-brand-primary/20"
              >
                <span>Save & Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-bold cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-brand-secondary/25 active:scale-[0.98]"
              >
                <Sparkles size={16} />
                <span>Complete & Go to Dashboard</span>
              </button>
            )}
          </div>

        </section>
      </main>

      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-600 border-t border-white/10 pt-6">
        <p>© 2026 PlaceMate Team. Pair programmed with Antigravity AI.</p>
      </footer>
    </div>
  );
}

export default OnboardingWizard;
