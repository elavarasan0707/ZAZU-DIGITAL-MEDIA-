import React, { useState, useEffect } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import {
  fetchSiteConfig,
  saveSiteConfig,
  fetchWorks,
  saveWork,
  deleteWorkItem,
  fetchReviews,
  saveReview,
  deleteReviewItem,
  fetchServices,
  saveService,
  deleteServiceItem,
  fetchClientInquiries,
  deleteInquiryItem
} from '../firebase/firestoreService';
import {
  AgencyContactConfig,
  CaseStudyItem,
  TestimonialItem,
  ServiceItem,
  ClientInquiry
} from '../types';
import {
  X,
  Home,
  User,
  HelpCircle,
  Briefcase,
  Layers,
  FolderGit2,
  Star,
  Mail,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Database,
  IndianRupee,
  RefreshCw
} from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onDataChange?: () => void;
}

type TabType = 'home' | 'about' | 'why-zazu' | 'services' | 'process' | 'works' | 'reviews' | 'contact';

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'home',
  onDataChange
}) => {
  const { user, isAdmin, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>((initialTab as TabType) || 'home');

  // State data
  const [siteConfig, setSiteConfig] = useState<AgencyContactConfig | null>(null);
  const [works, setWorks] = useState<CaseStudyItem[]>([]);
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editing forms
  const [editingWork, setEditingWork] = useState<Partial<CaseStudyItem> | null>(null);
  const [editingReview, setEditingReview] = useState<Partial<TestimonialItem> | null>(null);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [editingAboutText, setEditingAboutText] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [cfg, w, r, s] = await Promise.all([
        fetchSiteConfig(),
        fetchWorks(),
        fetchReviews(),
        fetchServices()
      ]);
      setSiteConfig(cfg);
      setEditingAboutText(cfg.aboutVijayakumar || '');
      setWorks(w);
      setReviews(r);
      setServices(s);

      if (isAdmin) {
        try {
          const inq = await fetchClientInquiries(user?.email);
          setInquiries(inq);
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Handlers for Work
  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can add or edit works.');
      return;
    }
    if (!editingWork || !editingWork.title) return;
    try {
      await saveWork(editingWork, user?.email);
      showFeedback('success', 'Work item saved to Firestore!');
      setEditingWork(null);
      await loadAllData();
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save work.');
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can delete works.');
      return;
    }
    if (!confirm('Are you sure you want to delete this work item?')) return;
    try {
      await deleteWorkItem(id, user?.email);
      showFeedback('success', 'Work item deleted.');
      await loadAllData();
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Handlers for Review
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can add or edit reviews.');
      return;
    }
    if (!editingReview || !editingReview.clientName) return;
    try {
      await saveReview(editingReview, user?.email);
      showFeedback('success', 'Review saved to Firestore!');
      setEditingReview(null);
      await loadAllData();
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save review.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can delete reviews.');
      return;
    }
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReviewItem(id, user?.email);
      showFeedback('success', 'Review deleted.');
      await loadAllData();
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Handlers for Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can add or edit services.');
      return;
    }
    if (!editingService || !editingService.title) return;
    try {
      await saveService(editingService, user?.email);
      showFeedback('success', 'Service saved to Firestore!');
      setEditingService(null);
      await loadAllData();
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can delete services.');
      return;
    }
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteServiceItem(id, user?.email);
      showFeedback('success', 'Service deleted.');
      await loadAllData();
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Handlers for About context & Contact Config
  const handleSaveAboutContext = async () => {
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can update About content.');
      return;
    }
    if (!siteConfig) return;
    try {
      const updated = { ...siteConfig, aboutVijayakumar: editingAboutText };
      await saveSiteConfig(updated, user?.email);
      setSiteConfig(updated);
      showFeedback('success', 'About Vijayakumar bio saved to Firestore & live site!');
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleSaveContactConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('error', 'Only digitalmediazazu@gmail.com can update contact settings.');
      return;
    }
    if (!siteConfig) return;
    try {
      await saveSiteConfig(siteConfig, user?.email);
      showFeedback('success', 'Agency contact details updated!');
      onDataChange?.();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteInquiryItem(id, user?.email);
      showFeedback('success', 'Inquiry removed.');
      const inq = await fetchClientInquiries(user?.email);
      setInquiries(inq);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'why-zazu', label: 'Why ZAZU', icon: HelpCircle },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'process', label: 'Process', icon: Layers },
    { id: 'works', label: 'Works', icon: FolderGit2 },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col rounded-2xl bg-[#0c0c0c] border border-[#262626] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-white/10 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/30 flex items-center justify-center text-[#F5C542] shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-base font-display font-bold text-white tracking-wide truncate">
                  ZAZU DASHBOARD
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5C542]/15 text-[#FFD966] border border-[#F5C542]/30 uppercase font-semibold">
                  Live
                </span>
              </div>
              <p className="hidden sm:block text-xs text-[#A0A0A0]">
                Manage website content, inquiries, and agency resources in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">Admin</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-[#A0A0A0]">Viewer Mode</span>
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-bold px-2.5 py-1 rounded bg-[#F5C542] text-[#080808] hover:bg-[#FFD966]"
                >
                  Admin Login
                </button>
              </div>
            )}

            <button
              onClick={() => { loadAllData(); showFeedback('success', 'Refreshed latest data.'); }}
              title="Refresh"
              className="p-1.5 sm:p-2 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div
            className={`px-4 sm:px-6 py-2 text-xs font-medium flex items-center justify-between border-b ${
              statusMsg.type === 'success'
                ? 'bg-green-950/60 border-green-500/30 text-green-300'
                : 'bg-red-950/60 border-red-500/30 text-red-300'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body: Responsive Flex-Col on Mobile, Flex-Row on md+ */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Navigation Bar / Sidebar */}
          <div className="w-full md:w-52 bg-[#0E0E0E] border-b md:border-b-0 md:border-r border-white/5 p-2 md:p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none">
            <span className="hidden md:block text-[10px] font-mono uppercase text-[#666666] px-3 py-1 font-semibold">
              Sections & Views
            </span>

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#F5C542] text-[#080808] font-bold shadow-md shadow-[#F5C542]/20'
                      : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Admin Notice on Sidebar (Desktop only to save mobile screen height) */}
            <div className="hidden md:block mt-auto p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#A0A0A0] space-y-1">
              <div className="flex items-center gap-1 text-[#FFD966] font-bold">
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{isAdmin ? 'Admin Authorized' : 'Read-Only Mode'}</span>
              </div>
              <p className="text-[10px] text-[#888888] leading-tight">
                {isAdmin
                  ? 'Full permissions to add, edit, and delete.'
                  : 'Log in as digitalmediazazu@gmail.com to edit.'}
              </p>
            </div>
          </div>

          {/* Tab Content Display Area */}
          <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[#090909]">
            
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Dashboard Overview</h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Real-time operational portal for ZAZU Digital Media.
                  </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#131313] border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#A0A0A0]">Active Works</span>
                    <p className="text-2xl font-bold text-white mt-1">{works.length}</p>
                    <span className="text-[10px] text-[#FFD966]">Case Studies</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#131313] border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#A0A0A0]">Client Reviews</span>
                    <p className="text-2xl font-bold text-white mt-1">{reviews.length}</p>
                    <span className="text-[10px] text-[#FFD966]">5-Star Testimonials</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#131313] border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#A0A0A0]">Services</span>
                    <p className="text-2xl font-bold text-white mt-1">{services.length}</p>
                    <span className="text-[10px] text-[#FFD966]">Disciplines</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#131313] border border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#A0A0A0]">Inquiries</span>
                    <p className="text-2xl font-bold text-white mt-1">{inquiries.length}</p>
                    <span className="text-[10px] text-[#FFD966]">Client Leads</span>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#F5C542]" />
                    <span>Database & Security Configuration</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A0A0A0]">
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-[#777777] block">Firestore Database ID</span>
                      <span className="text-white font-mono">ai-studio-zazudigitalmedia</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-[#777777] block">Admin Authorization Rule</span>
                      <span className="text-[#FFD966] font-mono">digitalmediazazu@gmail.com</span>
                    </div>
                  </div>
                </div>

                {/* Direct Agency Contact Summary */}
                <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#F5C542]" />
                    <span>Live Agency Profile</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5">
                      <span className="text-[10px] font-mono text-[#777777] block">PHONE & WHATSAPP</span>
                      <span className="text-white font-semibold">{siteConfig?.phone || '+91 9789504702'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5">
                      <span className="text-[10px] font-mono text-[#777777] block">EMAIL</span>
                      <span className="text-white font-semibold">{siteConfig?.email || 'digitalmediazazu@gmail.com'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5">
                      <span className="text-[10px] font-mono text-[#777777] block">LOCATION</span>
                      <span className="text-white font-semibold">{siteConfig?.location || 'Tirumangalam, Tamil Nadu, India'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">About Vijayakumar</h3>
                    <p className="text-xs text-[#A0A0A0]">
                      The creative professional behind ZAZU Digital Media.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={handleSaveAboutContext}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F5C542] text-[#080808] hover:bg-[#FFD966] transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  )}
                </div>

                {/* Editor or Content Display */}
                <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Official Biography & Agency Context
                    </label>
                    <span className="text-[10px] font-mono text-[#FFD966]">
                      {isAdmin ? 'Editable by Admin' : 'Read-only preview'}
                    </span>
                  </div>

                  <textarea
                    rows={16}
                    disabled={!isAdmin}
                    value={editingAboutText}
                    onChange={(e) => setEditingAboutText(e.target.value)}
                    className="w-full p-4 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-sans leading-relaxed focus:outline-none focus:border-[#F5C542] disabled:opacity-85"
                  />

                  {/* Social and live link buttons */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href="https://www.instagram.com/zazudigitalmedia?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-xs text-white flex items-center gap-2"
                    >
                      <span>Instagram Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#F5C542]" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/vijayakumar-s-2a48a8394/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-xs text-white flex items-center gap-2"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#0A66C2]" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 3. WHY ZAZU TAB */}
            {activeTab === 'why-zazu' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Why ZAZU Differentiators</h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Core methodology and business-focused competitive advantage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      num: '01',
                      title: 'Strategy Before Execution',
                      desc: 'We never waste client budget on haphazard ads. Every deliverable is preceded by competitor benchmarking, target audience profiling, and high-level funnel architecture.'
                    },
                    {
                      num: '02',
                      title: 'Creative Content That Connects',
                      desc: 'Generic templates are invisible. Our in-house creative production marries direct-response psychology with visual polish that demands viewer attention.'
                    },
                    {
                      num: '03',
                      title: 'Data-Driven Marketing',
                      desc: 'Likes and vanity impressions do not pay the bills. We orient our entire agency around pipeline velocity, qualified inbound consultations, and measurable bottom-line revenue.'
                    },
                    {
                      num: '04',
                      title: 'Direct Strategic Partnership',
                      desc: 'Work directly with creative professional Vijayakumar and senior digital marketing strategists with weekly transparency and real-time communication.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono text-[#F5C542] font-bold">PILLAR {item.num}</span>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-[#A0A0A0] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Services & Pricing (in ₹ Rupees)</h3>
                    <p className="text-xs text-[#A0A0A0]">
                      Manage agency service offerings and deliverables.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingService({ number: String(services.length + 1).padStart(2, '0'), deliverables: [] })}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5C542] text-[#080808] hover:bg-[#FFD966] transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Service</span>
                    </button>
                  )}
                </div>

                {/* Service Edit/Create Form */}
                {editingService && (
                  <form onSubmit={handleSaveService} className="p-5 rounded-2xl bg-[#141414] border border-[#F5C542]/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold uppercase text-[#FFD966]">
                        {editingService.id ? 'Edit Service' : 'New Service'}
                      </h4>
                      <button type="button" onClick={() => setEditingService(null)} className="text-[#A0A0A0] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Service Title *</label>
                        <input
                          type="text"
                          required
                          value={editingService.title || ''}
                          onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Price Range (in ₹ Rupees)</label>
                        <input
                          type="text"
                          value={editingService.priceRange || ''}
                          placeholder="e.g. Starting at ₹35,000 / mo"
                          onChange={(e) => setEditingService({ ...editingService, priceRange: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Short Description *</label>
                      <textarea
                        rows={3}
                        required
                        value={editingService.shortDescription || ''}
                        onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-3 py-1.5 text-xs text-[#A0A0A0] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold bg-[#F5C542] text-[#080808] rounded-lg hover:bg-[#FFD966]"
                      >
                        Save Service
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((svc) => (
                    <div key={svc.id} className="p-4 rounded-xl bg-[#111111] border border-white/10 flex flex-col justify-between group">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-[#F5C542] font-bold">DISCIPLINE {svc.number}</span>
                          {isAdmin && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingService(svc)}
                                className="p-1 rounded text-[#A0A0A0] hover:text-[#F5C542]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(svc.id)}
                                className="p-1 rounded text-[#A0A0A0] hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">{svc.title}</h4>
                        <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed line-clamp-2">{svc.shortDescription}</p>
                      </div>

                      {svc.priceRange && (
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1 text-[11px] font-mono text-[#FFD966]">
                          <IndianRupee className="w-3 h-3" />
                          <span>{svc.priceRange}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. PROCESS TAB */}
            {activeTab === 'process' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Execution Process</h3>
                  <p className="text-xs text-[#A0A0A0]">
                    The 6-stage operational sprint driving predictable client growth.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { step: '01', title: 'Audit & Analysis', desc: 'Competitor teardown, market audience profile, and existing bottleneck detection.' },
                    { step: '02', title: 'Positioning & Strategy', desc: 'Clarifying brand narrative, high-intent angles, and target funnel blueprints.' },
                    { step: '03', title: 'Creative Production', desc: 'Short-form reels, bespoke video assets, and conversion-engineered ad creatives.' },
                    { step: '04', title: 'Channel Distribution', desc: 'Precision Google Ads, search dominance, and omnichannel promotional campaigns.' },
                    { step: '05', title: 'Conversion Optimization', desc: 'Speed optimization, landing page friction removal, and attribution tracking.' },
                    { step: '06', title: 'Scale & Compounding', desc: 'Doubling down on winning angles, lowering acquisition cost, and revenue acceleration.' }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-mono text-[#F5C542] font-bold">STAGE {s.step}</span>
                      <h4 className="text-sm font-bold text-white">{s.title}</h4>
                      <p className="text-xs text-[#A0A0A0] leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. WORKS TAB (Renamed from Portfolio) */}
            {activeTab === 'works' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Works & Case Studies</h3>
                    <p className="text-xs text-[#A0A0A0]">
                      Portfolio of verified campaigns, brand identities, and video projects.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingWork({
                        category: 'Branding',
                        sampleMetrics: [{ label: 'Impact', value: '+100%' }],
                        deliverables: ['Custom Assets']
                      })}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5C542] text-[#080808] hover:bg-[#FFD966] transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Work</span>
                    </button>
                  )}
                </div>

                {/* Work Edit / Add Form */}
                {editingWork && (
                  <form onSubmit={handleSaveWork} className="p-5 rounded-2xl bg-[#141414] border border-[#F5C542]/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold uppercase text-[#FFD966]">
                        {editingWork.id ? 'Edit Work Item' : 'Create New Work Item'}
                      </h4>
                      <button type="button" onClick={() => setEditingWork(null)} className="text-[#A0A0A0] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Work Title *</label>
                        <input
                          type="text"
                          required
                          value={editingWork.title || ''}
                          onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Category</label>
                        <select
                          value={editingWork.category || 'Branding'}
                          onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        >
                          <option value="Branding">Branding</option>
                          <option value="SEO">SEO</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Paid Advertising">Paid Advertising</option>
                          <option value="Content Creation">Content Creation</option>
                          <option value="Video Marketing">Video Marketing</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Client Profile</label>
                        <input
                          type="text"
                          value={editingWork.clientType || ''}
                          onChange={(e) => setEditingWork({ ...editingWork, clientType: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Featured Metric (e.g. +₹3,50,000 Deal Size)</label>
                        <input
                          type="text"
                          placeholder="Label: Value"
                          value={editingWork.sampleMetrics?.[0]?.value || ''}
                          onChange={(e) => setEditingWork({
                            ...editingWork,
                            sampleMetrics: [{ label: 'Key Metric', value: e.target.value }]
                          })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Strategy & Solution *</label>
                      <textarea
                        rows={3}
                        required
                        value={editingWork.solution || ''}
                        onChange={(e) => setEditingWork({ ...editingWork, solution: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingWork(null)}
                        className="px-3 py-1.5 text-xs text-[#A0A0A0] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold bg-[#F5C542] text-[#080808] rounded-lg hover:bg-[#FFD966]"
                      >
                        Save to Firestore
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Works */}
                <div className="space-y-3">
                  {works.map((w) => (
                    <div key={w.id} className="p-4 rounded-xl bg-[#111111] border border-white/10 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#F5C542] border border-white/10">
                            {w.category}
                          </span>
                          <span className="text-xs text-[#777777]">{w.clientType}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{w.title}</h4>
                        <p className="text-xs text-[#A0A0A0] line-clamp-2">{w.solution}</p>
                        {w.sampleMetrics && w.sampleMetrics.length > 0 && (
                          <div className="flex items-center gap-3 pt-1">
                            {w.sampleMetrics.map((m, idx) => (
                              <span key={idx} className="text-[11px] text-[#FFD966] font-mono">
                                {m.label}: <strong>{m.value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingWork(w)}
                            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#F5C542] hover:bg-white/5"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWork(w.id)}
                            className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-white/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. REVIEWS TAB (Renamed from Testimonials) */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Client Reviews & Testimonials</h3>
                    <p className="text-xs text-[#A0A0A0]">
                      Client feedback and verified satisfaction ratings.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingReview({ stars: 5, highlight: 'High Business Impact' })}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5C542] text-[#080808] hover:bg-[#FFD966] transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Review</span>
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {editingReview && (
                  <form onSubmit={handleSaveReview} className="p-5 rounded-2xl bg-[#141414] border border-[#F5C542]/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold uppercase text-[#FFD966]">
                        {editingReview.id ? 'Edit Review' : 'New Client Review'}
                      </h4>
                      <button type="button" onClick={() => setEditingReview(null)} className="text-[#A0A0A0] hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Client Name *</label>
                        <input
                          type="text"
                          required
                          value={editingReview.clientName || ''}
                          onChange={(e) => setEditingReview({ ...editingReview, clientName: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Company / Business</label>
                        <input
                          type="text"
                          value={editingReview.businessName || ''}
                          onChange={(e) => setEditingReview({ ...editingReview, businessName: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#A0A0A0] mb-1">Role</label>
                        <input
                          type="text"
                          value={editingReview.role || ''}
                          onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                          className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Review Text *</label>
                      <textarea
                        rows={3}
                        required
                        value={editingReview.testimonial || ''}
                        onChange={(e) => setEditingReview({ ...editingReview, testimonial: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="px-3 py-1.5 text-xs text-[#A0A0A0] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold bg-[#F5C542] text-[#080808] rounded-lg hover:bg-[#FFD966]"
                      >
                        Save Review
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Reviews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-[#111111] border border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-[#F5C542]">
                            {[...Array(r.stars || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#F5C542]" />
                            ))}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingReview(r)}
                                className="p-1 rounded text-[#A0A0A0] hover:text-[#F5C542]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(r.id)}
                                className="p-1 rounded text-[#A0A0A0] hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[#D4D4D4] italic leading-relaxed">“{r.testimonial}”</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">{r.clientName}</span>
                          <span className="text-[10px] text-[#777777]">{r.role} • {r.businessName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#FFD966]">{r.highlight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. CONTACT & INQUIRIES TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Contact & Client Inquiries</h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Official phone number, location, email, and live incoming message center.
                  </p>
                </div>

                {/* Contact Configuration Form */}
                <form onSubmit={handleSaveContactConfig} className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase text-white">Agency Contact Details</span>
                    {isAdmin && (
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F5C542] text-[#080808] hover:bg-[#FFD966] flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Contact Settings</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Phone & WhatsApp *</label>
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={siteConfig?.phone || ''}
                        onChange={(e) => siteConfig && setSiteConfig({ ...siteConfig, phone: e.target.value, whatsapp: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Email *</label>
                      <input
                        type="email"
                        disabled={!isAdmin}
                        value={siteConfig?.email || ''}
                        onChange={(e) => siteConfig && setSiteConfig({ ...siteConfig, email: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Location *</label>
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={siteConfig?.location || ''}
                        onChange={(e) => siteConfig && setSiteConfig({ ...siteConfig, location: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">Instagram Link</label>
                      <input
                        type="url"
                        disabled={!isAdmin}
                        value={siteConfig?.instagram || ''}
                        onChange={(e) => siteConfig && setSiteConfig({ ...siteConfig, instagram: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0A0] mb-1">LinkedIn Link</label>
                      <input
                        type="url"
                        disabled={!isAdmin}
                        value={siteConfig?.linkedin || ''}
                        onChange={(e) => siteConfig && setSiteConfig({ ...siteConfig, linkedin: e.target.value })}
                        className="w-full p-2.5 bg-black border border-white/10 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </form>

                {/* Client Inquiries List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#F5C542]" />
                      <span>Incoming Client Inquiries ({inquiries.length})</span>
                    </h4>
                    <span className="text-[10px] font-mono text-[#A0A0A0]">
                      Redirects to +91 9789504702 on submission
                    </span>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#111111] border border-white/5 text-center text-xs text-[#777777]">
                      No inquiries yet. Submissions from the website contact form will appear here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="p-4 rounded-xl bg-[#111111] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{inq.name}</span>
                              {inq.businessName && <span className="text-xs text-[#A0A0A0]">({inq.businessName})</span>}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5C542]/10 text-[#FFD966]">
                                {inq.serviceRequired}
                              </span>
                            </div>
                            <p className="text-xs text-[#A0A0A0]">{inq.message}</p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#777777] pt-1">
                              <span>Tel: {inq.phone}</span>
                              <span>Email: {inq.email}</span>
                              <span>Budget: {inq.monthlyBudget}</span>
                              <span>Time: {new Date(inq.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/919789504702?text=${encodeURIComponent(`Hi Vijayakumar, regarding inquiry from ${inq.name} (${inq.phone}): ${inq.message}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-[#080808] font-bold text-xs flex items-center gap-1 hover:brightness-110"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="p-2 rounded-lg text-[#A0A0A0] hover:text-red-400 hover:bg-white/5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
