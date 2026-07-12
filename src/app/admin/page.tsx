'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type TabType = 'profile' | 'projects' | 'timeline' | 'skills-terminal' | 'about' | 'roadmap' | 'music' | 'inbox';

export default function Admin() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Data State
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPass = sessionStorage.getItem('admin_password');
      if (storedPass) {
        setIsAuthenticated(true);
        fetchData();
        fetchMessages();
      }
    }
  }, []);

  // Fetch messages if tab switches to inbox
  useEffect(() => {
    if (isAuthenticated && activeTab === 'inbox') {
      fetchMessages();
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ ping: true })
      });

      if (res.status === 401) {
        setLoginError('INVALID DECRYPT KEY');
        return;
      }

      if (res.status === 400 || res.ok) {
        sessionStorage.setItem('admin_password', password);
        setIsAuthenticated(true);
        fetchData();
        fetchMessages();
      } else {
        setLoginError('AUTH ERROR CODE: ' + res.status);
      }
    } catch (err) {
      setLoginError('CONNECTION ERROR');
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        setPortfolioData(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchMessages = async () => {
    const storedPass = sessionStorage.getItem('admin_password') || '';
    try {
      const res = await fetch('/api/messages', {
        headers: {
          'x-admin-password': storedPass
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSave = async () => {
    const storedPass = sessionStorage.getItem('admin_password') || '';
    setIsSaving(true);
    setStatusMessage('SYNCHRONIZING DATA STORE...');
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': storedPass
        },
        body: JSON.stringify(portfolioData)
      });
      if (res.ok) {
        setStatusMessage('DATA STORE OVERWRITTEN. PORTFOLIO.JSON SYNCHRONIZED.');
      } else {
        const errData = await res.json();
        setStatusMessage(`ERROR: ${errData.error || 'Failed to save'}`);
      }
    } catch (err) {
      setStatusMessage('ERROR: Connection failed.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const storedPass = sessionStorage.getItem('admin_password') || '';
    setStatusMessage('DELETING TRANSMISSION RECORD...');
    try {
      const res = await fetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': storedPass
        }
      });
      if (res.ok) {
        setStatusMessage('TRANSMISSION RECORD REMOVED.');
        fetchMessages();
      } else {
        const errData = await res.json();
        setStatusMessage(`DELETE ERROR: ${errData.error || 'Failed'}`);
      }
    } catch (err) {
      setStatusMessage('DELETE ERROR: Connection failed.');
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, pathType: 'avatar' | 'project', projectIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storedPass = sessionStorage.getItem('admin_password') || '';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', `${pathType}_${Date.now()}_${file.name}`);

    setStatusMessage('UPLOADING IMAGE...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-password': storedPass
        },
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        if (pathType === 'avatar') {
          setPortfolioData((prev: any) => ({
            ...prev,
            profile: { ...prev.profile, avatar: result.url }
          }));
        } else if (pathType === 'project' && projectIdx !== undefined) {
          const updatedProjects = [...portfolioData.projects];
          updatedProjects[projectIdx].image = result.url;
          setPortfolioData((prev: any) => ({
            ...prev,
            projects: updatedProjects
          }));
        }
        setStatusMessage('IMAGE UPLOAD COMPLETED.');
      } else {
        const errData = await res.json();
        setStatusMessage(`UPLOAD ERROR: ${errData.error || 'Failed'}`);
      }
    } catch (err) {
      setStatusMessage('UPLOAD ERROR: Connection failed.');
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Helper updates
  const updateProfileField = (field: string, value: any) => {
    setPortfolioData((prev: any) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateNowBuilding = (value: string) => {
    setPortfolioData((prev: any) => ({
      ...prev,
      nowBuilding: value
    }));
  };

  // About updates
  const updateAboutField = (field: string, value: any) => {
    setPortfolioData((prev: any) => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  // Skills toggle helper
  const handleSkillEquipToggle = (idx: number) => {
    const updatedSkills = [...portfolioData.skills];
    updatedSkills[idx].equipped = !updatedSkills[idx].equipped;
    setPortfolioData((prev: any) => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  // Project managers
  const updateProjectField = (idx: number, field: string, value: any) => {
    const updatedProjects = [...portfolioData.projects];
    updatedProjects[idx][field] = value;
    setPortfolioData((prev: any) => ({
      ...prev,
      projects: updatedProjects
    }));
  };

  const handleAddProject = () => {
    const newProj = {
      id: `new-project-${Date.now()}`,
      title: 'NEW PROJECT',
      subtitle: 'BETA',
      desc: 'Project Description',
      tech: ['React', 'Next.js'],
      image: '/images/network_nodes.png',
      status: 'IN PROGRESS',
      category: 'ACTIVE',
      link: '#'
    };
    setPortfolioData((prev: any) => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
  };

  const handleDeleteProject = (idx: number) => {
    const updatedProjects = portfolioData.projects.filter((_: any, i: number) => i !== idx);
    setPortfolioData((prev: any) => ({
      ...prev,
      projects: updatedProjects
    }));
  };

  // CV Timeline managers
  const updateTimelineField = (type: 'education' | 'experience', itemIdx: number, field: string, value: any) => {
    const updatedItems = [...portfolioData[type]];
    updatedItems[itemIdx][field] = value;
    setPortfolioData((prev: any) => ({
      ...prev,
      [type]: updatedItems
    }));
  };

  const updateTimelineBullets = (type: 'education' | 'experience', itemIdx: number, bulletIdx: number, value: string) => {
    const updatedItems = [...portfolioData[type]];
    updatedItems[itemIdx].bullets[bulletIdx] = value;
    setPortfolioData((prev: any) => ({
      ...prev,
      [type]: updatedItems
    }));
  };

  const handleAddTimelineBullet = (type: 'education' | 'experience', itemIdx: number) => {
    const updatedItems = [...portfolioData[type]];
    if (!updatedItems[itemIdx].bullets) updatedItems[itemIdx].bullets = [];
    updatedItems[itemIdx].bullets.push('New detail');
    setPortfolioData((prev: any) => ({
      ...prev,
      [type]: updatedItems
    }));
  };

  const handleRemoveTimelineBullet = (type: 'education' | 'experience', itemIdx: number, bulletIdx: number) => {
    const updatedItems = [...portfolioData[type]];
    updatedItems[itemIdx].bullets = updatedItems[itemIdx].bullets.filter((_: any, i: number) => i !== bulletIdx);
    setPortfolioData((prev: any) => ({
      ...prev,
      [type]: updatedItems
    }));
  };

  const handleAddTimelineItem = (type: 'education' | 'experience') => {
    const newItem = type === 'education' ? {
      yearRange: '[ 2024 - 2026 ]',
      institution: 'New Institution',
      degree: 'Degree Name',
      bullets: ['Major details']
    } : {
      yearRange: '[ 2024 - PRESENT ]',
      role: 'Role Title',
      company: 'Company Name',
      bullets: ['Responsible for...']
    };
    setPortfolioData((prev: any) => ({
      ...prev,
      [type]: [...prev[type], newItem]
    }));
  };

  const handleDeleteTimelineItem = (type: 'education' | 'experience', idx: number) => {
    const updatedItems = portfolioData[type].filter((_: any, i: number) => i !== idx);
    setPortfolioData((prev: any) => ({
      ...prev,
      [type]: updatedItems
    }));
  };

  // Roadmap tree managers
  const updateRoadmapField = (idx: number, field: string, value: any) => {
    const updatedRoadmap = [...portfolioData.roadmap];
    updatedRoadmap[idx][field] = value;
    setPortfolioData((prev: any) => ({
      ...prev,
      roadmap: updatedRoadmap
    }));
  };

  const handleAddRoadmapNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      title: 'NEW QUEST NODE',
      description: 'Quest details and summary.',
      type: 'aim',
      status: 'locked',
      year: 'Future'
    };
    setPortfolioData((prev: any) => ({
      ...prev,
      roadmap: [...prev.roadmap, newNode]
    }));
  };

  const handleDeleteRoadmapNode = (idx: number) => {
    const updatedRoadmap = portfolioData.roadmap.filter((_: any, i: number) => i !== idx);
    setPortfolioData((prev: any) => ({
      ...prev,
      roadmap: updatedRoadmap
    }));
  };

  // Music track managers
  const updateTrackField = (idx: number, field: string, value: any) => {
    const updatedTracks = [...portfolioData.tracks];
    updatedTracks[idx][field] = value;
    setPortfolioData((prev: any) => ({
      ...prev,
      tracks: updatedTracks
    }));
  };

  const handleAddTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      title: 'NEW_SONG.mp3',
      duration: '04:20',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    };
    setPortfolioData((prev: any) => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  const handleDeleteTrack = (idx: number) => {
    const updatedTracks = portfolioData.tracks.filter((_: any, i: number) => i !== idx);
    setPortfolioData((prev: any) => ({
      ...prev,
      tracks: updatedTracks
    }));
  };

  // Terminal commands managers
  const updateTerminalResponse = (idx: number, val: string) => {
    const updatedTerminal = [...portfolioData.terminalCommands];
    updatedTerminal[idx].response = val;
    setPortfolioData((prev: any) => ({
      ...prev,
      terminalCommands: updatedTerminal
    }));
  };

  // Render Login state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center relative font-code-sm grid-bg">
        <div className="absolute inset-0 bg-background/80 z-0"></div>
        <div className="relative z-10 border border-brand-ruled p-8 max-w-md w-full bg-[#111111] flex flex-col items-center">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-on-surface"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-on-surface"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-on-surface"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-on-surface"></div>

          <div className="w-full flex items-center gap-3 border-b border-brand-ruled pb-4 mb-8">
            <span className="material-symbols-outlined text-brand-amber">lock</span>
            <span className="font-pixel-label text-[10px] text-brand-amber">SECURE ADMIN CONSOLE</span>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-secondary uppercase text-xs">ENTER DECRYPT KEY:</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border border-brand-ruled text-brand-amber px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                placeholder="passphrase..."
              />
            </div>
            
            {loginError && (
              <p className="text-[10px] text-error uppercase border border-dashed border-error p-2 bg-error-container/10">
                {loginError}
              </p>
            )}

            <div className="flex gap-4">
              <button type="submit" className="btn-brutalist flex-1 py-3 text-code-sm font-bold">
                DECRYPT
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/')}
                className="border border-brand-ruled text-secondary px-6 py-3 hover:bg-surface-variant text-code-sm font-bold uppercase"
              >
                RETURN
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Console if loaded
  if (!portfolioData) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-brand-amber font-code-sm uppercase">
        LOADING DATABASE CONFIGURATIONS...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 relative z-20 min-h-[calc(100vh-64px)] pb-24">
      {/* Console Header */}
      <div className="border border-brand-ruled p-6 bg-brand-dark/80 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-xl text-primary uppercase tracking-widest blinking-cursor">
            ADMIN_CONTROL_PANEL
          </h1>
          <p className="text-code-sm text-secondary mt-1">CONFIGURING: PORTFOLIO.JSON DATABASE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-brutalist px-6 py-3 font-code-sm text-code-sm font-bold tracking-widest bg-brand-amber text-background border-brand-amber"
          >
            {isSaving ? "SYNCHRONIZING..." : "SAVE CHANGES"}
          </button>
        </div>
      </div>

      {/* Terminal log messages overlay */}
      {statusMessage && (
        <div className="border border-brand-amber bg-[#111111] p-4 text-brand-amber font-code-sm uppercase blinking-cursor text-xs">
          &gt; {statusMessage}
        </div>
      )}

      {/* Tab controls */}
      <div className="flex border-b border-brand-ruled gap-2 overflow-x-auto shrink-0">
        {(['profile', 'about', 'roadmap', 'projects', 'timeline', 'skills-terminal', 'music', 'inbox'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 uppercase font-bold text-code-sm border-t border-x -mb-px cursor-pointer whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-[#111111] border-brand-ruled text-brand-amber' 
                : 'bg-transparent border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab === 'skills-terminal' ? 'skills & terminal' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="border border-brand-ruled bg-[#111111] p-6 flex-1 flex flex-col gap-6">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <h2 className="text-headline-sm font-headline-md text-brand-amber border-b border-brand-ruled pb-2 uppercase">USER PROFILE DETAILS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-secondary text-code-sm uppercase">DISPLAY NAME:</label>
                <input 
                  type="text"
                  value={portfolioData.profile.name}
                  onChange={(e) => updateProfileField('name', e.target.value)}
                  className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-secondary text-code-sm uppercase">CHARACTER CLASS:</label>
                <input 
                  type="text"
                  value={portfolioData.profile.class}
                  onChange={(e) => updateProfileField('class', e.target.value)}
                  className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-secondary text-code-sm uppercase">OPERATIONAL BASE:</label>
                <input 
                  type="text"
                  value={portfolioData.profile.base}
                  onChange={(e) => updateProfileField('base', e.target.value)}
                  className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-secondary text-code-sm uppercase">GUILD / UNIVERSITY:</label>
                <input 
                  type="text"
                  value={portfolioData.profile.guild}
                  onChange={(e) => updateProfileField('guild', e.target.value)}
                  className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-secondary text-code-sm uppercase">SYSTEM LEVEL STATS:</label>
                <input 
                  type="text"
                  value={portfolioData.profile.level}
                  onChange={(e) => updateProfileField('level', e.target.value)}
                  className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-secondary text-code-sm uppercase">DEPLOYMENT STATUS:</label>
                <input 
                  type="text"
                  value={portfolioData.profile.status}
                  onChange={(e) => updateProfileField('status', e.target.value)}
                  className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-secondary text-code-sm uppercase">CURRENTLY BUILDING (HUD RUNNER):</label>
              <input 
                type="text"
                value={portfolioData.nowBuilding}
                onChange={(e) => updateNowBuilding(e.target.value)}
                className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-secondary text-code-sm uppercase">SHORT INTRO (HERO BIO):</label>
              <textarea 
                value={portfolioData.profile.intro || ''}
                onChange={(e) => updateProfileField('intro', e.target.value)}
                rows={3}
                className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber resize-none"
              />
            </div>

            {/* Avatar customization */}
            <div className="flex flex-col md:flex-row gap-6 items-start border border-dashed border-brand-ruled p-4 mt-4">
              <div className="w-24 h-24 border border-[#333333] bg-background flex items-center justify-center relative overflow-hidden shrink-0">
                <Image 
                  alt="Current Avatar" 
                  src={portfolioData.profile.avatar}
                  width={96}
                  height={96}
                  className="object-cover pixelated"
                />
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <label className="text-secondary text-code-sm uppercase font-bold">AVATAR SELECTION</label>
                <p className="text-code-sm text-secondary text-xs">Upload a custom pixel art or logo (saved to public/uploads/)</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text"
                    value={portfolioData.profile.avatar}
                    onChange={(e) => updateProfileField('avatar', e.target.value)}
                    className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber flex-1"
                  />
                  <label className="btn-brutalist px-4 py-2 text-center text-code-sm flex items-center justify-center cursor-pointer">
                    UPLOAD IMAGE
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <h2 className="text-headline-sm font-headline-md text-brand-amber border-b border-brand-ruled pb-2 uppercase">ABOUT ME CONFIGURATIONS</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-secondary text-code-sm uppercase">DETAILED BIOGRAPHY:</label>
              <textarea 
                value={portfolioData.about?.biography || ''}
                onChange={(e) => updateAboutField('biography', e.target.value)}
                rows={6}
                className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-secondary text-code-sm uppercase">TECHNICAL AIMS & ASPIRATIONS:</label>
              <textarea 
                value={portfolioData.about?.aims || ''}
                onChange={(e) => updateAboutField('aims', e.target.value)}
                rows={4}
                className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-secondary text-code-sm uppercase">AREAS OF FOCUS / INTERESTS (COMMA SEPARATED):</label>
              <input 
                type="text"
                value={portfolioData.about?.interests ? portfolioData.about.interests.join(', ') : ''}
                onChange={(e) => updateAboutField('interests', e.target.value.split(',').map(s => s.trim()))}
                className="bg-background border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
              />
            </div>
          </div>
        )}

        {/* ROADMAP TREE TAB */}
        {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-brand-ruled pb-2">
              <h2 className="text-headline-sm font-headline-md text-brand-amber uppercase">ROADMAP QUEST PATHWAY</h2>
              <button 
                onClick={handleAddRoadmapNode}
                className="btn-brutalist px-4 py-2 text-code-sm"
              >
                + ADD ROADMAP QUEST
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {portfolioData.roadmap?.map((node: any, idx: number) => (
                <div key={node.id} className="border border-brand-ruled p-6 bg-background flex flex-col gap-4 relative">
                  <button 
                    onClick={() => handleDeleteRoadmapNode(idx)}
                    className="absolute top-4 right-4 text-error hover:underline text-code-sm uppercase font-bold"
                  >
                    [DELETE]
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">QUEST TITLE:</label>
                      <input 
                        type="text"
                        value={node.title}
                        onChange={(e) => updateRoadmapField(idx, 'title', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">YEAR LOG:</label>
                      <input 
                        type="text"
                        value={node.year}
                        onChange={(e) => updateRoadmapField(idx, 'year', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">QUEST TYPE:</label>
                      <select 
                        value={node.type}
                        onChange={(e) => updateRoadmapField(idx, 'type', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      >
                        <option value="education">EDUCATION</option>
                        <option value="career">CAREER</option>
                        <option value="aim">AIMS & FUTURE</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">STATUS:</label>
                      <select 
                        value={node.status}
                        onChange={(e) => updateRoadmapField(idx, 'status', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      >
                        <option value="completed">COMPLETED</option>
                        <option value="active">ACTIVE</option>
                        <option value="locked">LOCKED</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-secondary text-xs uppercase">DESCRIPTION / LOG STATEMENTS:</label>
                    <input 
                      type="text"
                      value={node.description}
                      onChange={(e) => updateRoadmapField(idx, 'description', e.target.value)}
                      className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-brand-ruled pb-2">
              <h2 className="text-headline-sm font-headline-md text-brand-amber uppercase">EQUIPMENT PORTFOLIO (PROJECTS)</h2>
              <button 
                onClick={handleAddProject}
                className="btn-brutalist px-4 py-2 text-code-sm"
              >
                + ADD NEW BUILD
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {portfolioData.projects.map((proj: any, idx: number) => (
                <div key={proj.id} className="border border-brand-ruled p-6 bg-background flex flex-col gap-4 relative">
                  <button 
                    onClick={() => handleDeleteProject(idx)}
                    className="absolute top-4 right-4 text-error hover:underline text-code-sm uppercase font-bold"
                  >
                    [DELETE]
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">PROJECT TITLE:</label>
                      <input 
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProjectField(idx, 'title', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">SUBTITLE (VERSION/LABEL):</label>
                      <input 
                        type="text"
                        value={proj.subtitle}
                        onChange={(e) => updateProjectField(idx, 'subtitle', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">STATUS:</label>
                      <input 
                        type="text"
                        value={proj.status}
                        onChange={(e) => updateProjectField(idx, 'status', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">CATEGORY (ACTIVE / SHIPPED / TBD):</label>
                      <select 
                        value={proj.category}
                        onChange={(e) => updateProjectField(idx, 'category', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="TBD">TBD</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-secondary text-xs uppercase">DEPLOYMENT LINK URL:</label>
                      <input 
                        type="text"
                        value={proj.link}
                        onChange={(e) => updateProjectField(idx, 'link', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-secondary text-xs uppercase">DESCRIPTION:</label>
                    <textarea 
                      value={proj.desc}
                      onChange={(e) => updateProjectField(idx, 'desc', e.target.value)}
                      rows={2}
                      className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">TECH TAGS (COMMA SEPARATED):</label>
                      <input 
                        type="text"
                        value={proj.tech.join(', ')}
                        onChange={(e) => updateProjectField(idx, 'tech', e.target.value.split(',').map(s => s.trim()))}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      />
                    </div>
                    
                    <div className="flex gap-4 items-end border border-dashed border-brand-ruled p-3">
                      <div className="w-12 h-12 border border-[#333333] bg-surface flex items-center justify-center relative overflow-hidden shrink-0">
                        <Image 
                          alt="Project Preview" 
                          src={proj.image}
                          width={32}
                          height={32}
                          className="object-contain pixelated"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-secondary text-[10px] uppercase">IMAGE URL / UPLOAD</span>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={proj.image}
                            onChange={(e) => updateProjectField(idx, 'image', e.target.value)}
                            className="bg-surface border border-brand-ruled text-primary px-2 py-1 text-[11px] outline-none focus:border-brand-amber flex-1"
                          />
                          <label className="btn-brutalist px-3 py-1 text-[11px] cursor-pointer">
                            UPLOAD
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'project', idx)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-12">
            
            {/* Academy section */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-brand-ruled pb-2">
                <h2 className="text-headline-sm font-headline-md text-brand-amber uppercase">ACADEMY LOGS (EDUCATION)</h2>
                <button 
                  onClick={() => handleAddTimelineItem('education')}
                  className="btn-brutalist px-4 py-2 text-code-sm"
                >
                  + ADD EDUCATION LOG
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {portfolioData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="border border-brand-ruled p-6 bg-background relative flex flex-col gap-4">
                    <button 
                      onClick={() => handleDeleteTimelineItem('education', idx)}
                      className="absolute top-4 right-4 text-error hover:underline text-code-sm uppercase font-bold"
                    >
                      [DELETE]
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-secondary text-xs uppercase">YEAR RANGE:</label>
                        <input 
                          type="text"
                          value={edu.yearRange}
                          onChange={(e) => updateTimelineField('education', idx, 'yearRange', e.target.value)}
                          className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-secondary text-xs uppercase">INSTITUTION NAME:</label>
                        <input 
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateTimelineField('education', idx, 'institution', e.target.value)}
                          className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-secondary text-xs uppercase">DEGREE / LEVEL:</label>
                        <input 
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateTimelineField('education', idx, 'degree', e.target.value)}
                          className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-secondary text-xs uppercase">BULLET POINT DETAILS:</label>
                        <button 
                          type="button" 
                          onClick={() => handleAddTimelineBullet('education', idx)}
                          className="text-[11px] text-brand-amber hover:underline"
                        >
                          + ADD BULLET
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {edu.bullets && edu.bullets.map((bullet: string, bIdx: number) => (
                          <div key={bIdx} className="flex gap-2 items-center">
                            <span className="text-brand-amber">-</span>
                            <input 
                              type="text"
                              value={bullet}
                              onChange={(e) => updateTimelineBullets('education', idx, bIdx, e.target.value)}
                              className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber flex-1"
                            />
                            <button 
                              type="button"
                              onClick={() => handleRemoveTimelineBullet('education', idx, bIdx)}
                              className="text-error hover:underline text-xs"
                            >
                              [X]
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience section */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-brand-ruled pb-2">
                <h2 className="text-headline-sm font-headline-md text-brand-amber uppercase">FIELD EXPERIENCE (WORK HISTORY)</h2>
                <button 
                  onClick={() => handleAddTimelineItem('experience')}
                  className="btn-brutalist px-4 py-2 text-code-sm"
                >
                  + ADD WORK HISTORY LOG
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {portfolioData.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="border border-brand-ruled p-6 bg-background relative flex flex-col gap-4">
                    <button 
                      onClick={() => handleDeleteTimelineItem('experience', idx)}
                      className="absolute top-4 right-4 text-error hover:underline text-code-sm uppercase font-bold"
                    >
                      [DELETE]
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-secondary text-xs uppercase">YEAR RANGE:</label>
                        <input 
                          type="text"
                          value={exp.yearRange}
                          onChange={(e) => updateTimelineField('experience', idx, 'yearRange', e.target.value)}
                          className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-secondary text-xs uppercase">ROLE TITLE:</label>
                        <input 
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateTimelineField('experience', idx, 'role', e.target.value)}
                          className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-secondary text-xs uppercase">COMPANY NAME:</label>
                        <input 
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateTimelineField('experience', idx, 'company', e.target.value)}
                          className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-secondary text-xs uppercase">BULLET POINT DETAILS:</label>
                        <button 
                          type="button" 
                          onClick={() => handleAddTimelineBullet('experience', idx)}
                          className="text-[11px] text-brand-amber hover:underline"
                        >
                          + ADD BULLET
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {exp.bullets && exp.bullets.map((bullet: string, bIdx: number) => (
                          <div key={bIdx} className="flex gap-2 items-center">
                            <span className="text-brand-amber">&gt;</span>
                            <input 
                              type="text"
                              value={bullet}
                              onChange={(e) => updateTimelineBullets('experience', idx, bIdx, e.target.value)}
                              className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber flex-1"
                            />
                            <button 
                              type="button"
                              onClick={() => handleRemoveTimelineBullet('experience', idx, bIdx)}
                              className="text-error hover:underline text-xs"
                            >
                              [X]
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SKILLS & TERMINAL TAB */}
        {activeTab === 'skills-terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h2 className="text-headline-sm font-headline-md text-brand-amber border-b border-brand-ruled pb-2 uppercase">EQUIPPED SKILLS INVENTORY</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-brand-ruled p-4 bg-background">
                {portfolioData.skills.map((skill: any, idx: number) => (
                  <button
                    key={skill.name}
                    type="button"
                    onClick={() => handleSkillEquipToggle(idx)}
                    className={`p-3 border flex flex-col items-center justify-center font-code-sm cursor-pointer transition-none ${
                      skill.equipped 
                        ? 'border-brand-amber text-brand-amber bg-brand-amber-dim/10' 
                        : 'border-brand-ruled text-secondary bg-transparent hover:border-brand-amber'
                    }`}
                  >
                    <span className="text-xs font-bold">{skill.name}</span>
                    <span className="text-[9px] mt-1 opacity-70">
                      {skill.equipped ? '[EQUIPPED]' : '[INACTIVE]'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-4">
              <h2 className="text-headline-sm font-headline-md text-brand-amber border-b border-brand-ruled pb-2 uppercase">TERMINAL COMMAND OVERRIDES</h2>
              <div className="flex flex-col gap-4">
                {portfolioData.terminalCommands.map((tc: any, idx: number) => (
                  <div key={tc.command} className="border border-brand-ruled p-4 bg-background flex flex-col gap-2">
                    <span className="text-primary font-code-sm font-bold">COMMAND: <span className="text-brand-amber">{tc.command}</span></span>
                    <textarea 
                      value={tc.response}
                      onChange={(e) => updateTerminalResponse(idx, e.target.value)}
                      rows={3}
                      className="bg-surface border border-brand-ruled text-brand-amber px-3 py-2 text-code-sm outline-none focus:border-brand-amber resize-none font-mono mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MUSIC PLAYLIST TAB */}
        {activeTab === 'music' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-brand-ruled pb-2">
              <h2 className="text-headline-sm font-headline-md text-brand-amber uppercase">MUSIC PLAYLIST MANAGER</h2>
              <button 
                onClick={handleAddTrack}
                className="btn-brutalist px-4 py-2 text-code-sm"
              >
                + ADD PLAYLIST SONG
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {portfolioData.tracks?.map((track: any, idx: number) => (
                <div key={track.id} className="border border-brand-ruled p-6 bg-background relative flex flex-col gap-4">
                  <button 
                    onClick={() => handleDeleteTrack(idx)}
                    className="absolute top-4 right-4 text-error hover:underline text-code-sm uppercase font-bold"
                  >
                    [DELETE]
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">TRACK TITLE NAME:</label>
                      <input 
                        type="text"
                        value={track.title}
                        onChange={(e) => updateTrackField(idx, 'title', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">TRACK DURATION (MIN:SEC):</label>
                      <input 
                        type="text"
                        value={track.duration}
                        onChange={(e) => updateTrackField(idx, 'duration', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-secondary text-xs uppercase">STREAMING URL (MP3 PATH):</label>
                      <input 
                        type="text"
                        value={track.url}
                        onChange={(e) => updateTrackField(idx, 'url', e.target.value)}
                        className="bg-surface border border-brand-ruled text-primary px-3 py-2 text-code-sm outline-none focus:border-brand-amber"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INBOX MESSAGES TAB */}
        {activeTab === 'inbox' && (
          <div className="flex flex-col gap-8">
            <h2 className="text-headline-sm font-headline-md text-brand-amber border-b border-brand-ruled pb-2 uppercase">DIRECT MESSAGE INBOX</h2>
            
            {messages.length === 0 ? (
              <div className="text-center text-secondary py-12 border border-dashed border-brand-ruled font-code-sm">
                NO TRANSMISSIONS LOGGED IN DATABASE.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="border border-brand-ruled p-6 bg-background relative flex flex-col gap-3 font-code-sm text-xs">
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute top-4 right-4 text-error hover:underline uppercase font-bold"
                    >
                      [PURGE]
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-[#222] pb-3 mb-2 text-secondary">
                      <div>
                        <span className="font-bold text-primary">SENDER:</span> {msg.name}
                      </div>
                      <div>
                        <span className="font-bold text-primary">EMAIL:</span> {msg.email}
                      </div>
                      <div>
                        <span className="font-bold text-primary">TIMESTAMP:</span> {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-secondary">
                      <span className="font-bold text-primary block mb-1">SUBJECT: {msg.subject}</span>
                      <p className="bg-[#181818] p-4 text-brand-amber border border-[#222] whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
