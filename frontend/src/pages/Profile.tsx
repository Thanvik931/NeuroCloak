import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  User, 
  Lock, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  Mail, 
  Briefcase,
  Key,
  Save
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  
  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.email ? user.email.split('@')[0].toUpperCase() : 'AI AUDITOR',
    email: user?.email || 'admin@neurocloak.ai',
    role: user?.role || 'ADMIN',
    title: 'Senior AI Compliance Lead',
    department: 'Model Governance & Safety',
    bio: 'Responsible for real-time Cognitive Digital Twin oversight, algorithmic bias detection, and ethical risk verification.'
  });

  // Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Social Links State
  const [socials, setSocials] = useState({
    github: 'https://github.com/Thanvik931/NeuroCloak',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    website: 'https://neurocloak.ai'
  });

  // Success Feedback Messages
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [socialSuccess, setSocialSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordSuccess(true);
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleSocialSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSocialSuccess(true);
    setTimeout(() => setSocialSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header Profile Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 border border-slate-700/60 bg-slate-900/80 shadow-xl">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/30 shrink-0 border-2 border-white/20">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              {profile.role}
            </span>
          </div>

          <p className="text-slate-400 text-sm">{profile.title} • {profile.department}</p>
          <p className="text-slate-400 text-xs flex items-center justify-center md:justify-start gap-1.5 pt-1">
            <Mail className="w-3.5 h-3.5 text-primary" />
            <span>{profile.email}</span>
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Info & Social Links */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Personal Information Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile details saved successfully!
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled
                    value={profile.email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Bio / Profile Notes</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Info</span>
              </button>
            </form>
          </div>

          {/* Social Links Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <Globe className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Social & External Links</h2>
            </div>

            {socialSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Social profiles updated!
              </div>
            )}

            <form onSubmit={handleSocialSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-400" /> GitHub Profile
                </label>
                <input
                  type="url"
                  value={socials.github}
                  onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={socials.linkedin}
                  onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-sky-400" /> Twitter / X Profile
                </label>
                <input
                  type="url"
                  value={socials.twitter}
                  onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" /> Personal Website
                </label>
                <input
                  type="url"
                  value={socials.website}
                  onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Social Links</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Password & Security */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Change Password Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <Key className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Change Password</h2>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Password changed successfully!
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                ⚠️ {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Account Permissions Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Role Permissions</span>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>Access Level:</span>
                <span className="text-emerald-400 font-bold">FULL ADMIN</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>Audit Logs View:</span>
                <span className="text-emerald-400 font-bold">ENABLED</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>System Configuration:</span>
                <span className="text-emerald-400 font-bold">ALLOWED</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
