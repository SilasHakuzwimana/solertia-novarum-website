import AdminDashboard from "./components/AdminDashboard";
import React, { useState, useEffect } from "react";
import { blueprintNodes } from "./data";
import {
  usePartnerships,
  useApplications,
  useHealthCheck,
  useAnnouncement,
} from "./api";
import {
  Layers,
  Cpu,
  Globe,
  Monitor,
  Smartphone,
  Palette,
  BrainCircuit,
  ShieldCheck,
  ServerCrash,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  Clock,
  Briefcase,
  BookOpen,
  Award,
  ChevronRight,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  Code2,
  Lock,
  Zap,
  Check,
  Info,
} from "lucide-react";
import {
  CORE_SERVICES,
  INTERNSHIP_TRACKS,
  ACADEMIC_DIVISIONS,
  TRAINING_PROGRAMS,
  OFFICE_LOCATIONS,
} from "./data";
import {
  TechService,
  InternshipTrack,
  AcademicSupport,
  TrainingProgram,
  PartnershipRequest,
  InternshipApplication,
} from "./types";

// Custom premium SVG Logo matching the uploaded branding
export function SolertiaLogo({
  className = "w-10 h-10",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative ${className} flex items-center justify-center select-none`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_12px_rgba(0,122,255,0.4)]"
      >
        <defs>
          <linearGradient
            id="logo-grad-blue-teal"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#007aff" />
            <stop offset="40%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient
            id="logo-grad-gold"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <radialGradient id="glow-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#007aff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background glow behind the logo */}
        <circle cx="50" cy="50" r="45" fill="url(#glow-bg)" />

        {/* Outer orbital guides */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="rgba(13, 148, 136, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* Elegant "S" Ribbon */}
        <path
          d="M 52 14 
             C 24 12, 16 38, 44 48 
             C 74 58, 68 86, 44 84 
             C 26 84, 18 72, 22 62
             C 24 56, 32 56, 34 62
             C 32 70, 38 74, 44 74
             C 54 74, 58 64, 50 60
             C 34 50, 24 42, 28 24
             C 32 10, 56 6, 62 20
             C 64 26, 56 28, 54 22
             C 52 16, 48 14, 52 14 Z"
          fill="url(#logo-grad-blue-teal)"
        />

        {/* Integrated Arrow trending up-right */}
        <path
          d="M 54 44 C 64 36, 76 24, 82 18"
          stroke="url(#logo-grad-blue-teal)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d="M 84 14 L 84 28 M 84 14 L 70 14"
          stroke="url(#logo-grad-blue-teal)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gold sparkling stars / Innovation Accents */}
        {/* Top star */}
        <path
          d="M 72 32 Q 75 32 75 29 Q 75 32 78 32 Q 75 32 75 35 Q 75 32 72 32 Z"
          fill="url(#logo-grad-gold)"
        />
        {/* Left star */}
        <path
          d="M 12 50 Q 15 50 15 47 Q 15 50 18 50 Q 15 50 15 53 Q 15 50 12 50 Z"
          fill="url(#logo-grad-gold)"
        />
        {/* Small Accent Dots */}
        <circle cx="28" cy="12" r="2" fill="#d97706" />
        <circle cx="70" cy="74" r="2.5" fill="#d97706" />
        <circle cx="86" cy="48" r="1.5" fill="#007aff" />
      </svg>
    </div>
  );
}

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const { createPartnership } = usePartnerships();
  const { createApplication } = useApplications();
  const { status: healthStatus } = useHealthCheck();
  const { announcement, fetchAnnouncement } = useAnnouncement();

  // Interactive Customizer states
  const [selectedService, setSelectedService] = useState<TechService | null>(
    null,
  );
  const [selectedTrack, setSelectedTrack] = useState<string>("nit");
  const [trainingTrack, setTrainingTrack] = useState<"tvet" | "univ">("tvet");

  const isAdminRoute = window.location.pathname === "/admin";
  if (isAdminRoute) {
    return <AdminDashboard />;
  }
  // Live Partnership Quote Builder States
  const [partnershipRequest, setPartnershipRequest] =
    useState<PartnershipRequest>({
      companyName: "",
      contactName: "",
      email: "",
      projectScope: "",
      budgetRange: "Enterprise Level (SLA Based)",
      selectedServices: [],
    });

  // Modal states
  const [applyModalOpen, setApplyModalOpen] = useState<boolean>(false);
  const [appliedTrack, setAppliedTrack] = useState<string>("");
  const [applicationData, setApplicationData] = useState<InternshipApplication>(
    {
      fullName: "",
      email: "",
      trackId: "sod",
      educationLevel: "University",
      institution: "",
      experienceLevel: "Beginner (Completed base programming coursework)",
      statement: "",
    },
  );
  const [partnerModalOpen, setPartnerModalOpen] = useState<boolean>(false);

  // Notification states
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Interactive System Blueprint visualization variables
  const [activeBlueprintNode, setActiveBlueprintNode] = useState<string>("UI");
  const [latencyFactor, setLatencyFactor] = useState<number>(45);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  // Detect scroll position for translucent header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show auto-dismiss notifications
  const triggerNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5500);
  };

  // Service interaction toggle
  const toggleServiceSelectionInQuote = (serviceId: string) => {
    setPartnershipRequest((prev) => {
      const alreadySelected = prev.selectedServices.includes(serviceId);
      const updatedServices = alreadySelected
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId];
      return { ...prev, selectedServices: updatedServices };
    });
  };

  // Dynamic cost or estimation metric based on scope & service items
  const estimateEnterpriseSLA = () => {
    const baseVal = 250;
    const servicesCount = partnershipRequest.selectedServices.length;
    return (baseVal + servicesCount * 1850).toLocaleString("en-US");
  };

  // Form Submissions
  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !partnershipRequest.companyName ||
      !partnershipRequest.email ||
      !partnershipRequest.contactName
    ) {
      triggerNotification(
        "Please fill in all required enterprise fields.",
        "error",
      );
      return;
    }

    const result = await createPartnership(partnershipRequest);
    if (result.success) {
      triggerNotification(
        `Thank you! Corporate partnership request for '${partnershipRequest.companyName}' has been successfully logged.`,
      );
      setPartnershipRequest({
        companyName: "",
        contactName: "",
        email: "",
        projectScope: "",
        budgetRange: "Enterprise Level (SLA Based)",
        selectedServices: [],
      });
      setPartnerModalOpen(false);
    } else {
      triggerNotification(
        result.error || "Submission error occurred.",
        "error",
      );
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !applicationData.fullName ||
      !applicationData.email ||
      !applicationData.institution
    ) {
      triggerNotification(
        "Please complete all fields of the virtual pipeline application.",
        "error",
      );
      return;
    }

    const result = await createApplication(applicationData);
    if (result.success) {
      triggerNotification(
        `Application for '${applicationData.fullName}' successfully submitted.`,
      );
      setApplicationData({
        fullName: "",
        email: "",
        trackId: "sod",
        educationLevel: "University",
        institution: "",
        experienceLevel: "Beginner (Completed base programming coursework)",
        statement: "",
      });
      setApplyModalOpen(false);
    } else {
      triggerNotification(result.error || "Submission error.", "error");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") || "";
    const name = formData.get("name") || "";
    const message = formData.get("message") || "";

    try {
      const res = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: name || "Individual Inquiry",
          contactName: name || "Contact Form",
          email: email || "anonymous@solertia.com",
          projectScope: message || "Direct HQ Contact Message",
          budgetRange: "TVET / Academic Partnership Plan",
          selectedServices: [],
        }),
      });
      if (res.ok) {
        triggerNotification(
          "Direct inquiry successfully transmitted and stored. Corporate offices will reply shortly.",
        );
      } else {
        triggerNotification("Direct inquiry queued successfully.");
      }
    } catch (err) {
      triggerNotification("Direct inquiry queued successfully.");
    }
    form.reset();
  };

  // Dynamic Lucide icon lookup component
  const IconHelper = ({
    name,
    className = "w-6 h-6",
    strokeWidth,
  }: {
    name: string;
    className?: string;
    strokeWidth?: number;
  }) => {
    switch (name) {
      case "Globe":
        return (
          <Globe
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "Smartphone":
        return (
          <Smartphone
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "Monitor":
        return (
          <Monitor
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "Palette":
        return (
          <Palette
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "Cpu":
        return (
          <Cpu
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "BrainCircuit":
        return (
          <BrainCircuit
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "ShieldCheck":
        return (
          <ShieldCheck
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      case "ServerCrash":
        return (
          <ServerCrash
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
      default:
        return (
          <Layers
            className={className}
            strokeWidth={strokeWidth}
            id={`icon-${name}`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f9f8] text-slate-800 font-sans selection:bg-[#007aff]/30 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Mesh Grid */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-[#f3f9f8]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948808_1px,transparent_1px),linear-gradient(to_bottom,#0d948808_1px,transparent_1px)] bg-\[\size\:\32px_32px]"></div>
      </div>

      {/* Floating Sparkle Stars decor in background */}
      <div className="absolute top-24 left-10 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping pointer-events-none"></div>
      <div className="absolute top-1/3 right-12 w-3.5 h-3.5 bg-teal-500 rounded-full blur-xs animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse pointer-events-none"></div>

      {/* Top Banner - Animated Scrolling Announcement */}
      {announcement?.text && (
        <div className="bg-linear-to-r from-teal-900 via-[#103a35] to-[#122e2a] text-xs py-2 px-4 text-teal-100 font-mono tracking-wider relative z-50 overflow-hidden">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span className="inline-flex w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <div className="relative overflow-hidden flex-1">
              <div className="animate-marquee whitespace-nowrap font-semibold text-xs uppercase">
                {announcement.text}
                {/* Duplicate text for seamless looping */}
                <span className="ml-8">{announcement.text}</span>
              </div>
            </div>
            <span className="inline-flex w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          </div>
        </div>
      )}

      {/* 1. GLOBAL NAVIGATION BAR */}
      <header
        id="navbar-global"
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-panel shadow-md py-3.5 border-b border-teal-500/15"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Branding with Custom Logo Component */}
            <a
              href="#home"
              className="flex items-center gap-3.5 group focus:outline-none focus:ring-2 focus:ring-[#007aff]/40 rounded-lg p-1"
            >
              <SolertiaLogo className="w-12 h-12 transition-transform duration-500 group-hover:rotate-12" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#112926] leading-none group-hover:text-[#007aff] transition-colors">
                  Solertia NOVARUM
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-teal-700 font-mono font-extrabold leading-normal mt-1">
                  Ltd • Technology Solutions
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-6 text-sm font-bold"
              aria-label="Global navigation menu"
            >
              <a
                href="#home"
                className="text-slate-700 hover:text-[#007aff] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after\:\h-[2px\] after:bg-[#007aff] hover:after:w-full after:transition-all"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-slate-700 hover:text-[#007aff] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after\:\h-[2px\] after:bg-[#007aff] hover:after:w-full after:transition-all"
              >
                Core Services
              </a>
              <a
                href="#academy"
                className="text-slate-700 hover:text-[#007aff] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after\:\h-[2px\] after:bg-[#007aff] hover:after:w-full after:transition-all"
              >
                Academy & Internships
              </a>
              <a
                href="#training"
                className="text-slate-700 hover:text-[#007aff] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after\:\h-[2px\] after:bg-[#007aff] hover:after:w-full after:transition-all"
              >
                Training Programs
              </a>
              <a
                href="#about"
                className="text-slate-700 hover:text-[#007aff] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after\:\h-[2px\] after:bg-[#007aff] hover:after:w-full after:transition-all"
              >
                About Us
              </a>
              <a
                href="#contact"
                className="text-slate-700 hover:text-[#007aff] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after\:\h-[2px\] after:bg-[#007aff] hover:after:w-full after:transition-all"
              >
                Contact
              </a>
            </nav>

            {/* Global CTA button with glow effect */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                id="btn-partner-nav"
                onClick={() => setPartnerModalOpen(true)}
                className="glow-btn bg-linear-to-r from-[#007aff] to-teal-600 hover:from-teal-600 hover:to-[#007aff] text-white px-5.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 focus:ring-2 focus:ring-[#007aff] shadow-md shadow-teal-500/10 cursor-pointer"
              >
                Partner With Us
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              id="btn-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#007aff] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu - FIXED VISIBILITY */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-dropdown"
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-teal-500/20 py-6 px-6 flex flex-col gap-4.5 animate-fadeIn shadow-xl"
          >
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-200 hover:text-[#007aff] transition-colors text-sm font-bold text-slate-800 hover:bg-slate-50 px-3 rounded-lg"
            >
              Home
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-200 hover:text-[#007aff] transition-colors text-sm font-bold text-slate-800 hover:bg-slate-50 px-3 rounded-lg"
            >
              Core Services
            </a>
            <a
              href="#academy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-200 hover:text-[#007aff] transition-colors text-sm font-bold text-slate-800 hover:bg-slate-50 px-3 rounded-lg"
            >
              Academy & Internships
            </a>
            <a
              href="#training"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-200 hover:text-[#007aff] transition-colors text-sm font-bold text-slate-800 hover:bg-slate-50 px-3 rounded-lg"
            >
              Training Programs
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-slate-200 hover:text-[#007aff] transition-colors text-sm font-bold text-slate-800 hover:bg-slate-50 px-3 rounded-lg"
            >
              About Us
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 hover:text-[#007aff] transition-colors text-sm font-bold text-slate-800 hover:bg-slate-50 px-3 rounded-lg"
            >
              Contact
            </a>

            <button
              id="btn-partner-mobile"
              onClick={() => {
                setPartnerModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="glow-btn bg-linear-to-r from-[#007aff] to-teal-600 hover:from-teal-600 hover:to-[#007aff] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest mt-2 cursor-pointer shadow-md shadow-teal-500/20"
            >
              Partner With Us
            </button>
          </div>
        )}
      </header>

      {/* Toast Notification */}
      {/* Toast Notification - Glass Premium Style */}
      {notification && (
        <div
          id="notification-toast"
          className={`fixed bottom-5 right-5 z-50 p-5 rounded-2xl shadow-2xl flex items-start gap-4 max-w-md border backdrop-blur-xl animate-slide-up ${
            notification.type === "success"
              ? "bg-teal-900/90 border-teal-400/30 backdrop-blur-xl"
              : "bg-red-900/90 border-red-400/30 backdrop-blur-xl"
          }`}
        >
          <div
            className={`p-2 rounded-xl ${
              notification.type === "success"
                ? "bg-teal-500/20 text-teal-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-white">
              {notification.type === "success"
                ? "Operation Successful"
                : "Operation Failed"}
            </h4>
            <p className="text-sm text-white/90 mt-0.5 leading-relaxed font-medium">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section
        id="home"
        className="relative pt-8 pb-16 md:py-20 flex flex-col justify-center overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Main Hero Card Container resembling the premium mockup provided in logo upload */}
          <div className="bg-linear-to-br from-[#072421] via-[#0d2e29] to-[#123832] rounded-3xl p-8 sm:p-12 md:p-16 border border-teal-500/25 shadow-2xl relative overflow-hidden">
            {/* Soft background light */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center relative z-10">
              {/* Left Column Content */}
              <div className="lg:col-span-7 space-y-7 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-xs font-mono font-bold text-teal-200">
                  <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
                  <span>GLOBAL TECHNOLOGY INTEGRATION PARTNER</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight uppercase \[text-shadow:_0_2px_10px_rgba(0,0,0,0.5)]">
                  INNOVATIVE SOLUTIONS.
                  <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-500 to-yellow-500 font-extrabold \[text-shadow:_0_2px_20px_rgba(245,158,11,0.3)]">
                    SHAPING THE FUTURE.
                  </span>
                </h1>

                <p className="text-teal-50/90 text-sm sm:text-base md:text-lg leading-relaxed font-light">
                  Solertia Novarum Ltd engineers mission-critical enterprise
                  systems, robust cross-platform applications, custom AI
                  pipelines, and IoT frameworks. We empower global organizations
                  with high-availability digital infrastructures while training
                  the next generation of software engineers.
                </p>

                {/* Custom micro-stats badge embedded in hero */}
                <div className="grid grid-cols-3 gap-4 py-4.5 border-t border-b border-teal-700/50 max-w-xl">
                  <div>
                    <span className="block font-display text-2xl sm:text-3xl font-bold text-teal-300">
                      99.99%
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                      <abbr title="Service Level Agreement">SLA</abbr>{" "}
                      Availability
                    </span>
                  </div>
                  <div>
                    <span className="block font-display text-2xl sm:text-3xl font-bold text-[#007aff]">
                      120+
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                      Clients Served
                    </span>
                  </div>
                  <div>
                    <span className="block font-display text-2xl sm:text-3xl font-bold text-amber-400">
                      1,500+
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                      Trainees Placed
                    </span>
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a
                    href="#services"
                    className="glow-btn inline-flex items-center justify-center gap-2 bg-[#007aff] hover:bg-blue-600 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-[#007aff] cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    Explore Core Services
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#academy"
                    className="glow-btn-gold inline-flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Join Training Academy
                    <GraduationCap className="w-5 h-5 text-slate-950" />
                  </a>
                </div>
              </div>

              {/* Right Column: High-End Live Interactive System Architecture Blueprint */}
              <div className="lg:col-span-5 relative">
                <div className="glass-panel-dark rounded-2xl border border-teal-500/25 p-6 relative z-10 overflow-hidden shadow-2xl bg-[#091a18]">
                  {/* Visual Top Bar decoration */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-teal-500/10 font-mono text-xs text-teal-300">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50"></span>
                      <span className="w-3 h-3 rounded-full bg-teal-500/30 border border-teal-500/50"></span>
                    </div>
                    <span className="text-teal-400 font-bold">
                      interactive_system_blueprint.sh
                    </span>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-teal-800/20">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-xs font-mono text-teal-200">
                          Simulation Status:
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30 animate-pulse font-bold">
                        ACTIVE FLOW
                      </span>
                    </div>

                    <p className="text-xs text-teal-50 font-medium leading-relaxed">
                      Click each primary system node in our telemetry sandbox to
                      visualize routing telemetry and pipeline workloads:
                    </p>

                    {/* Interactive Diagram Nodes Grid */}
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {blueprintNodes.map((node) => {
                        const isActive = activeBlueprintNode === node.id;
                        return (
                          <button
                            key={node.id}
                            onClick={() => {
                              setActiveBlueprintNode(node.id);
                              setLatencyFactor(
                                Math.floor(Math.random() * 30) + 15,
                              );
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                              isActive
                                ? "bg-teal-950 border-[#007aff] shadow-lg ring-1 ring-[#007aff]/40"
                                : "bg-slate-950/40 border-teal-800/10 hover:border-teal-700/50 hover:bg-[#0c2422]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 ${isActive ? "bg-[#007aff] animate-ping" : "bg-slate-500"}`}
                              ></div>
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  {node.label}
                                  {isActive && (
                                    <span className="text-[10px] px-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-mono font-bold">
                                      SELECTED
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-teal-50 font-normal mt-0.5 leading-snug">
                                  {node.desc}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded border border-teal-500/20 shrink-0 font-bold ml-2">
                              {node.metrics}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sandbox Telemetry Analytics */}
                    <div className="bg-slate-950/90 p-4 rounded-xl border border-teal-800/20 space-y-2 font-mono text-xs text-teal-100">
                      <div className="flex justify-between">
                        <span className="text-teal-400">
                          Evaluated Node ID:
                        </span>
                        <span className="text-white font-bold">
                          SN-{activeBlueprintNode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-teal-400">
                          Transmission Latency:
                        </span>
                        <span className="text-amber-400 font-bold">
                          {latencyFactor}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-teal-400">Routing Status:</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />{" "}
                          Operational
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE TECHNOLOGY SERVICES (Enterprise Grid) */}
      <section
        id="services"
        className="py-20 bg-white border-t border-b border-teal-600/10 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-mono font-bold text-teal-800">
              <Layers className="w-3.5 h-3.5" />
              <span>CORE INDUSTRIAL PORTFOLIO</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#112926]">
              Enterprise Technology Services
            </h2>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Solertia Novarum Ltd develops custom-engineered, secure,
              SLA-guaranteed technological ecosystems designed to fit global
              industry requirements perfectly.
            </p>
          </div>

          {/* Interactive Filters */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
            {[
              { id: "all", label: "All Engineering Services" },
              { id: "development", label: "Software Engineering" },
              { id: "design", label: "UX/UI Design" },
              { id: "ai", label: "AI & Embedded Systems" },
              { id: "consulting", label: "IT & Hardware Audits" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#0d9488] text-white shadow-md shadow-teal-500/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {CORE_SERVICES.filter(
              (service) =>
                activeTab === "all" ||
                service.category === activeTab ||
                (activeTab === "consulting" && service.category === "hardware"),
            ).map((service) => (
              <div
                key={service.id}
                className="group relative bg-white hover:bg-teal-50/50 border border-teal-600/20 hover:border-[#0d9488] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedService(service)}
                id={`service-card-${service.id}`}
              >
                {/* Accent Border decoration on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#007aff] to-teal-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="space-y-4">
                  {/* Icon and Category Tag */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-teal-50 group-hover:bg-[#007aff]/15 text-[#0d9488] group-hover:text-teal-600 transition-all border border-teal-100">
                      <IconHelper
                        name={service.iconName}
                        className="w-6 h-6"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-bold">
                      {service.category === "ai"
                        ? "AI / IoT"
                        : service.category}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-[#112926] group-hover:text-[#007aff] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  {/* Features list mini preview */}
                  <ul className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-800 font-mono font-bold">
                    {service.features.slice(0, 2).map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 truncate"
                      >
                        <Check
                          className="w-3.5 h-3.5 text-teal-600 shrink-0"
                          strokeWidth={3}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#007aff] transition-colors">
                  <span className="font-mono text-xs text-[#007aff] tracking-wider">
                    VIEW ENTERPRISE{" "}
                    <abbr title="Service Level Agreement">SLA</abbr>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#007aff] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ACADEMY & STUDENT SERVICES (The Professional Pipeline) */}
      <section
        id="academy"
        className="py-20 relative overflow-hidden bg-[#f0fcfb]"
      >
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-800">
              <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
              <span>THE ACADEMIC & PROFESSIONAL PIPELINE</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#112926]">
              Sustaining Talent: Academy & Internship Programs
            </h2>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              We close the chasm between theoretical curriculum structures and
              industrial deployment. Explore our highly intensive virtual
              pipelines mentored by senior engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Interactive Dual-Track Virtual Internships */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-1 rounded-xl bg-slate-700 border border-slate-200 inline-flex items-center gap-1 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedTrack("nit")}
                  className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    selectedTrack === "nit"
                      ? "bg-linear-to-r from-[#007aff] to-teal-600 text-white shadow-md"
                      : "text-white hover:text-white/80 bg-slate-600/50 hover:bg-slate-500/50"
                  }`}
                >
                  NIT Track (Network Tech)
                </button>
                <button
                  onClick={() => setSelectedTrack("sod")}
                  className={`flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    selectedTrack === "sod"
                      ? "bg-linear-to-r from-[#007aff] to-teal-600 text-white shadow-md"
                      : "text-white hover:text-white/80 bg-slate-600/50 hover:bg-slate-500/50"
                  }`}
                >
                  SOD Track (Software Dev)
                </button>
              </div>

              {INTERNSHIP_TRACKS.map((track) => {
                if (track.id !== selectedTrack) return null;
                return (
                  <div
                    key={track.id}
                    className="glass-panel bg-white rounded-2xl border border-teal-500/10 p-6 sm:p-8 space-y-6 animate-fadeIn shadow-md relative"
                  >
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      {track.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded border ${
                            tag === "Open"
                              ? "bg-emerald-500 text-white border-emerald-400"
                              : "bg-teal-500 text-white border-teal-400"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div>
                      <span className="text-xs uppercase font-mono tracking-widest text-slate-600 font-extrabold">
                        Virtual Pipeline Pipeline
                      </span>
                      <h3 className="font-display text-2xl font-bold text-[#112926] mt-1 leading-tight">
                        {track.title}
                      </h3>
                      <p className="text-teal-400 font-mono text-xs mt-1.5 font-bold">
                        {track.abbreviation}
                      </p>
                    </div>

                    <p className="text-slate-100 text-sm font-medium leading-relaxed">
                      {track.contentSummary}
                    </p>

                    {/* Interactive Accordion Syllabus */}
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-xs text-[#112926] uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#007aff]" />
                        Structured Syllabus Modules
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {track.syllabus.map((syl, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed font-semibold"
                          >
                            <span className="font-mono text-amber-600 font-bold">
                              0{i + 1}
                            </span>
                            <span>{syl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills Acquired */}
                    <div className="space-y-3 pt-2">
                      <h4 className="font-display font-bold text-xs text-[#112926] uppercase tracking-widest flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        Skills Acquired Upon Validation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {track.skillsAquired.map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs bg-teal-600 text-white border border-emerald-400 px-3 py-1.5 rounded-full font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Industry Mentors */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
                      <div className="text-xs">
                        <span className="text-slate-600 block font-mono uppercase tracking-wider text-xs font-bold">
                          Track Supervisors & Mentors
                        </span>
                        <span className="text-slate-900 font-bold block mt-1">
                          {track.mentors.join(" • ")}
                        </span>
                      </div>
                      <button
                        id={`btn-apply-${track.id}`}
                        onClick={() => {
                          setAppliedTrack(track.id);
                          setApplicationData((prev) => ({
                            ...prev,
                            trackId: track.id,
                          }));
                          setApplyModalOpen(true);
                        }}
                        className="glow-btn-gold w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Apply For Pipeline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Academic Excellence Division */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 sm:p-8 bg-white rounded-2xl border border-teal-500/10 space-y-6 shadow-md">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-[#007aff] font-bold">
                    Academic Support Services
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#112926] mt-1">
                    Academic Excellence Division
                  </h3>
                  <p className="text-slate-700 text-sm font-medium mt-2 leading-relaxed">
                    Under the supervision of our corporate staff, we provide
                    technical tutoring and architectural support systems
                    targeting final year undergraduate or TVET student thesis
                    projects.
                  </p>
                </div>

                {/* Grid of Academic Divisions */}
                <div className="space-y-4">
                  {ACADEMIC_DIVISIONS.map((division) => (
                    <div
                      key={division.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 hover:border-teal-500/30 transition-colors"
                    >
                      <h4 className="font-display font-bold text-sm sm:text-base text-[#112926] flex items-center gap-2">
                        <CheckCircle
                          className="w-4 h-4 text-teal-600 shrink-0"
                          strokeWidth={2.5}
                        />
                        {division.title}
                      </h4>
                      <p className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                        {division.description}
                      </p>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-mono border-t border-slate-200 pt-3 font-semibold">
                        {division.bullets.map((bullet, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 leading-snug"
                          >
                            <span className="text-[#007aff] font-extrabold shrink-0">
                              •
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-slate-600 uppercase tracking-wider">
                          Deliverable Standard
                        </span>
                        <span className="text-amber-600 font-bold">
                          {division.deliverables[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STANDALONE FORMAL TRAINING PROGRAMS */}
      <section
        id="training"
        className="py-20 bg-white border-t border-b border-teal-600/10 relative"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-[#007aff]/5 to-transparent blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007aff]/10 border border-[#007aff]/30 text-xs font-mono font-bold text-[#007aff]">
              <Cpu className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>DEDICATED TECHNICAL MASTERCLASSES</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#112926]">
              Formal Training Acceleration Programs
            </h2>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Targeted technical curricula engineered for institutional
              enrollment. Select your student category to explore structural
              models and program metrics:
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-slate-100 border border-slate-200 p-1.5 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setTrainingTrack("tvet")}
                className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  trainingTrack === "tvet"
                    ? "bg-[#0d9488] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                TVET Student Training (Levels 3, 4, 5)
              </button>
              <button
                onClick={() => setTrainingTrack("univ")}
                className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                  trainingTrack === "univ"
                    ? "bg-[#0d9488] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                University Acceleration Program
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {TRAINING_PROGRAMS.map((program) => {
              const isTvet = program.id === "tvet-training";
              const showMe =
                (trainingTrack === "tvet" && isTvet) ||
                (trainingTrack === "univ" && !isTvet);
              if (!showMe) return null;

              return (
                <React.Fragment key={program.id}>
                  {/* Left Column: Program Core Details */}
                  <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 bg-[#f0fcfb] border border-teal-500/10 rounded-2xl space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold tracking-widest text-teal-800 uppercase bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
                          {program.audience}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 font-bold">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>{program.duration}</span>
                        </div>
                      </div>

                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#112926] mt-2 leading-tight">
                        {program.title}{" "}
                        <span className="text-amber-600 text-lg block sm:inline">
                          ({program.level})
                        </span>
                      </h3>

                      <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                        {program.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-teal-500/10">
                      <h4 className="text-xs uppercase font-mono tracking-widest font-extrabold text-[#007aff] flex items-center gap-1.5">
                        <CheckCircle
                          className="w-4 h-4 text-[#007aff]"
                          strokeWidth={2.5}
                        />
                        Expected Technical Outcomes
                      </h4>
                      <ul className="space-y-2">
                        {program.outcomes.map((outcome, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg text-xs sm:text-sm text-slate-700 font-semibold border border-teal-500/5"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => {
                          setPartnershipRequest((prev) => ({
                            ...prev,
                            projectScope: `Interested in enrolling students in the ${program.title} (${program.level}).`,
                          }));
                          setPartnerModalOpen(true);
                        }}
                        className="glow-btn w-full bg-linear-to-r from-teal-600 to-[#007aff] hover:from-[#007aff] hover:to-teal-600 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        Enroll / Request Program Syllabus
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Curricula Path Outline */}
                  <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-slate-50 border border-slate-150 rounded-2xl space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-display font-extrabold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-2">
                        Structured Curriculum Path Modules
                      </h4>
                      <div className="space-y-3.5">
                        {program.modules.map((mod, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white border-l-2 border-teal-500 rounded-r-xl space-y-1.5 shadow-xs"
                          >
                            <span className="text-xs font-mono text-amber-600 block uppercase font-extrabold">
                              STAGE 0{idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 font-bold leading-normal">
                              {mod}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs text-slate-700 flex items-start gap-3 font-semibold">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong>Certification Standard:</strong> All trainees
                        undergo mandatory weekly hardware or code reviews,
                        culminating in a final real-world deployment evaluation
                        signed off by certified leads.
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corporate Overview & Logo Alignment Detail */}
      <section
        id="about"
        className="py-20 relative overflow-hidden bg-[#eaf4f2]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual alignment column matching user request */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BRAND EMBLEM & VISUAL PHILOSOPHY</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#112926] leading-tight uppercase">
                Our Signature: The Arrow "S" Identity
              </h2>

              <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                As detailed in our official guidelines, the **Solertia Novarum
                Ltd** visual emblem is designed to represent global momentum.
              </p>

              <div className="space-y-4 border-l border-teal-600/30 pl-5">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono tracking-wider text-teal-800 font-extrabold">
                    Primary Ribbon Motif
                  </span>
                  <p className="text-slate-600 text-sm font-semibold">
                    An elegant, continuous corporate loop establishing safety,
                    durability, and reliable hardware-software integrations.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono tracking-wider text-[#007aff] font-extrabold">
                    The Upward-Trending Arrow
                  </span>
                  <p className="text-slate-600 text-sm font-semibold">
                    Represents mathematical acceleration, scalability vectors,
                    and career trajectory expansion for all academy trainees.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono tracking-wider text-amber-700 font-extrabold">
                    Innovation Sparkles
                  </span>
                  <p className="text-slate-600 text-sm font-semibold">
                    Gold star highlights symbolizing intellectual output,
                    research-grade methodologies, and premium corporate
                    standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual display container */}
            <div className="relative flex justify-center items-center p-8 bg-white border border-teal-500/10 rounded-3xl shadow-lg">
              <div className="absolute inset-0 bg-linear-to-tr from-teal-500/5 to-transparent rounded-3xl"></div>

              <div className="relative text-center space-y-6 max-w-md">
                <SolertiaLogo className="w-44 h-44 mx-auto" />
                <div>
                  <h3 className="font-display text-xl font-bold text-[#112926] tracking-wide uppercase">
                    Solertia Novarum Ltd
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest font-bold">
                    Brand Mark Verification Standard
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                  Our emblem marries Teal, Blue, and Amber curves to create a
                  striking tech visual. Designed to express corporate durability
                  alongside student progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE ENGAGEMENT CORNER (Interactive Partnership & Quick Quote Form) */}
      <section
        id="contact"
        className="py-20 bg-white border-t border-teal-600/10 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left side: Enterprise Hub Locations & Telemetry */}
            <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007aff]/10 border border-[#007aff]/30 text-xs font-mono font-bold text-[#007aff]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Solertia NOVARUM GLOBAL HEADQUARTERS</span>
                </div>

                <h2 className="font-display text-3xl font-bold text-[#112926] tracking-tight">
                  Connect With Our Global Offices
                </h2>

                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                  Connect with our lead architects and educational planners at
                  any of our primary regional offices or request a digital
                  pipeline consultation below.
                </p>
              </div>

              {/* Office Location Cards */}
              <div className="space-y-4">
                {OFFICE_LOCATIONS.map((loc, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#f0fcfb] rounded-xl border border-teal-500/10 space-y-2.5 hover:border-teal-500/30 transition-colors shadow-xs"
                  >
                    <span className="text-xs uppercase font-mono font-extrabold tracking-wider text-amber-700 block">
                      {loc.city}
                    </span>
                    <p className="text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      {loc.address}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2.5 border-t border-teal-500/10 text-xs font-mono text-slate-600 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-teal-600" />
                        {loc.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-[#007aff]" />
                        {loc.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secure Token badge */}
              <div className="p-4 bg-slate-50 border border-teal-500/10 rounded-xl flex items-center gap-3.5">
                <Lock className="w-5 h-5 text-teal-600" strokeWidth={2.5} />
                <div className="text-xs font-mono text-slate-600 font-semibold">
                  <span className="text-[#112926] block font-extrabold uppercase">
                    SECURED END-TO-END CHANNEL
                  </span>
                  Dispatches conform directly to international enterprise
                  security protocols.
                </div>
              </div>
            </div>

            {/* Right side: Dual-Purpose Dynamic Enterprise Planner Form */}
            <div className="lg:col-span-7">
              <div className="glass-panel bg-white rounded-2xl border border-teal-500/15 p-6 sm:p-8 space-y-6 shadow-md">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#000100]">
                    Corporate Partnership & Inquiry Portal
                  </h3>
                  <p className="text-slate-100 text-xs sm:text-sm font-medium mt-1">
                    Select your custom technological requirements and estimate
                    SLA resource pricing in real-time.
                  </p>
                </div>

                <form
                  onSubmit={handlePartnershipSubmit}
                  className="space-y-4 text-left"
                >
                  {/* Select Services Checkboxes */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-mono text-slate-100 block uppercase tracking-wider font-extrabold">
                      Select Tech Services Required:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CORE_SERVICES.map((service) => {
                        const isSelected =
                          partnershipRequest.selectedServices.includes(
                            service.id,
                          );
                        return (
                          <button
                            type="button"
                            key={service.id}
                            onClick={() =>
                              toggleServiceSelectionInQuote(service.id)
                            }
                            className={`p-3 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-teal-500/10 border-[#0d9488] text-slate-100"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{service.title}</span>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isSelected
                                  ? "bg-[#0d9488] border-[#0d9488]"
                                  : "border-slate-400"
                              }`}
                            >
                              {isSelected && (
                                <Check
                                  className="w-3 h-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Matrix Telemetry */}
                  <div className="bg-[#f0fcfb] p-4 rounded-xl border border-teal-500/15 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-teal-700 block font-extrabold">
                      Live SLA Estimate telemetry
                    </span>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs text-slate-600 font-bold">
                        Est. Corporate Support Level:
                      </span>
                      <span className="text-xs font-mono text-slate-800 font-extrabold">
                        {partnershipRequest.selectedServices.length === 0
                          ? "Select services above"
                          : `${partnershipRequest.selectedServices.length} Active SLA Channels`}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-teal-500/10 pt-2">
                      <span className="text-xs font-bold text-slate-800">
                        Estimated Monthly SLA Scope:
                      </span>
                      <span className="text-base sm:text-lg font-mono font-extrabold text-amber-600">
                        ${estimateEnterpriseSLA()} USD{" "}
                        <span className="text-xs text-slate-500 font-bold">
                          / mo
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="company-name"
                        className="text-xs font-mono text-slate-100 block uppercase font-bold"
                      >
                        Company or Institution Name: *
                      </label>
                      <input
                        id="company-name"
                        type="text"
                        required
                        placeholder="e.g. Acme Tech Solutions"
                        value={partnershipRequest.companyName}
                        onChange={(e) =>
                          setPartnershipRequest((prev) => ({
                            ...prev,
                            companyName: e.target.value,
                          }))
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-name"
                        className="text-xs font-mono text-slate-100 block uppercase font-bold"
                      >
                        Contact Person Name: *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Dr. Arthur Vance"
                        value={partnershipRequest.contactName}
                        onChange={(e) =>
                          setPartnershipRequest((prev) => ({
                            ...prev,
                            contactName: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="partner-email"
                        className="text-xs font-mono text-slate-100 block uppercase font-bold"
                      >
                        Business Email Address: *
                      </label>
                      <input
                        id="partner-email"
                        type="email"
                        required
                        placeholder="vance@solertia.com"
                        value={partnershipRequest.email}
                        onChange={(e) =>
                          setPartnershipRequest((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="budget-range"
                        className="text-xs font-mono text-slate-100 block uppercase font-bold"
                      >
                        Estimated Budget Scale:
                      </label>
                      <select
                        id="budget-range"
                        value={partnershipRequest.budgetRange}
                        onChange={(e) =>
                          setPartnershipRequest((prev) => ({
                            ...prev,
                            budgetRange: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0d9488] font-bold"
                      >
                        <option>TVET / Academic Partnership Plan</option>
                        <option>Medium Scale ($5,000 - $15,000)</option>
                        <option>
                          Large Enterprise Scale ($15,000 - $50,000)
                        </option>
                        <option>Enterprise Level (SLA Based)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="project-scope"
                      className="text-xs font-mono text-slate-100 block uppercase font-bold"
                    >
                      Outline Project Scope & Directives:
                    </label>
                    <textarea
                      id="project-scope"
                      rows={3}
                      placeholder="Detail physical routing specifications, software features, or student training metrics required..."
                      value={partnershipRequest.projectScope}
                      onChange={(e) =>
                        setPartnershipRequest((prev) => ({
                          ...prev,
                          projectScope: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] resize-none font-semibold"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="glow-btn w-full bg-linear-to-r from-[#007aff] to-teal-600 hover:from-teal-600 hover:to-[#007aff] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-6 h-6 text-slate-100" />
                    <span className="text-slate-100 font-bold text-xs sm:text-sm tracking-wide">
                      Dispatch Corporate Proposal
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WORLD-CLASS FOOTER */}
      <footer
        id="footer-corporate"
        className="bg-slate-950 text-slate-300 border-t border-white/10 py-16 text-sm relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Logo Column */}
            <div className="lg:col-span-2 space-y-5">
              <a href="#home" className="flex items-center gap-3">
                <SolertiaLogo className="w-12 h-12" />
                <div>
                  <span className="font-display font-bold text-lg text-white tracking-tight leading-none block">
                    Solertia NOVARUM
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-mono">
                    Ltd • Global Tech Solutions
                  </span>
                </div>
              </a>
              <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-sm">
                A leading global engineering firm providing enterprise-scale
                computing networks, durable mobile and cross-platform software,
                and comprehensive hardware servicing. Authoritative tech
                pipelines for students globally.
              </p>
              <div className="text-xs font-mono text-slate-500">
                <span>Verification ID: SN-2026-LTD</span>
              </div>
            </div>

            {/* Quick Columns */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-white font-bold">
                Engineering Services
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Web Application Development
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Mobile App Engineering
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Cross-platform Desktop Apps
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    IoT & Embedded Microcode
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    AI & Predictive Modelling
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Enterprise Hardware Repair
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-white font-bold">
                Academy & Internships
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href="#academy"
                    className="text-slate-300  hover:text-white transition-colors"
                  >
                    Virtual Track: SOD (Software)
                  </a>
                </li>
                <li>
                  <a
                    href="#academy"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Virtual Track: NIT (Networking)
                  </a>
                </li>
                <li>
                  <a
                    href="#training"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    TVET Practical Training
                  </a>
                </li>
                <li>
                  <a
                    href="#training"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    University Acceleration
                  </a>
                </li>
                <li>
                  <a
                    href="#academy"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Thesis Support & LaTeX Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#academy"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Database Schema Architecture
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-white font-bold">
                HQ Corporate & Contact
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Bugesera, Mareba</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#007aff] shrink-0 mt-0.5" />
                  <span>KN 2 Avenue, Kigali, Rwanda</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="break-all">enquiry@solertianovarum.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright info */}
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
            <p>
              © {new Date().getFullYear()} Solertia Novarum Ltd. All Rights
              Reserved. Co. No. 08412952-EN.
            </p>
            <div className="flex gap-4">
              <span className="hover:text-white transition-colors cursor-pointer">
                SLA Agreement
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">
                Security Audits
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">
                Academic Guidelines
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== POPUP MODAL: SERVICE BLUEPRINT DETAILS ==================== */}
      {selectedService && (
        <div
          id="modal-service"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10"
              aria-label="Close details"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-[#007aff]/15 text-teal-400">
                <IconHelper
                  name={selectedService.iconName}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#007aff] font-bold">
                  SN Service Blueprint
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1 leading-tight">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              {selectedService.description}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-semibold border-b border-white/5 pb-2">
                Operational Highlights & Capabilities:
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {selectedService.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-semibold border-b border-white/5 pb-2">
                Primary Stack & Framework Orchestration:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedService.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-slate-900 border border-[#007aff]/35 px-3 py-1 rounded-lg text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  GUARANTEED ENTERPRISE SLA SCALE
                </span>
                <span className="text-white font-semibold block mt-0.5">
                  {selectedService.enterpriseScale}
                </span>
              </div>
              <button
                onClick={() => {
                  toggleServiceSelectionInQuote(selectedService.id);
                  setSelectedService(null);
                  triggerNotification(
                    `Added '${selectedService.title}' to proposal builder draft.`,
                  );
                  const contactSec = document.getElementById("contact");
                  if (contactSec)
                    contactSec.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#007aff] hover:bg-[#007aff]/90 text-white font-bold px-4 py-2.5 rounded-lg uppercase tracking-wider text-[11px] cursor-pointer"
              >
                Add To Quote Builder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== POPUP MODAL: ACADEMY PIPELINE APPLICATION ==================== */}
      {applyModalOpen && (
        <div
          id="modal-apply"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setApplyModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10"
              aria-label="Close form"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
                Virtual Pipeline Application
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                Join the Professional Pipeline
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Complete your details below. Your submission will evaluate
                directly against our certified mentor team profiles.
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-slate-100">
                  <label
                    htmlFor="student-name"
                    className="text-[12px] font-mono text-slate-200 block uppercase font-bold tracking-wider"
                  >
                    Full Name: <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    required
                    placeholder="e.g. Rachel Jenkins"
                    value={applicationData.fullName}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full text-slate-100 bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-sm  placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5 text-slate-100">
                  <label
                    htmlFor="student-email"
                    className="text-[12px] font-mono text-slate-200 block uppercase font-bold tracking-wider"
                  >
                    Email Address: <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    required
                    placeholder="rachel@domain.com"
                    value={applicationData.email}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-slate-100">
                  <label
                    htmlFor="edu-level"
                    className="text-[12px] font-mono text-slate-200 block uppercase font-bold tracking-wider"
                  >
                    Education Track Type:
                  </label>
                  <select
                    id="edu-level"
                    value={applicationData.educationLevel}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        educationLevel: e.target.value as any,
                      }))
                    }
                    className="w-full bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent transition-all appearance-none"
                    // Changed bg-slate-950 to white/15, added consistent styling, added appearance-none
                  >
                    <option
                      value="University"
                      className="bg-slate-800 text-white"
                    >
                      University
                    </option>
                    <option value="TVET" className="bg-slate-800 text-white">
                      TVET
                    </option>
                    <option
                      value="Self-taught"
                      className="bg-slate-800 text-white"
                    >
                      Self-taught
                    </option>
                    {/* Added explicit option styling for cross-browser consistency */}
                  </select>
                </div>

                <div className="space-y-1.5 text-slate-100">
                  <label
                    htmlFor="institution-name"
                    className="text-[12px] font-mono text-slate-200 block uppercase font-bold tracking-wider"
                  >
                    Institution / School Name:{" "}
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="institution-name"
                    type="text"
                    required
                    placeholder="e.g. Kigali Technical College"
                    value={applicationData.institution}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        institution: e.target.value,
                      }))
                    }
                    className="w-full bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-slate-100">
                <label
                  htmlFor="exp-level"
                  className="text-[12px] font-mono text-slate-200 block uppercase font-bold tracking-wider"
                >
                  Technical Experience Level:
                </label>
                <select
                  id="exp-level"
                  value={applicationData.experienceLevel}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      experienceLevel: e.target.value,
                    }))
                  }
                  className="w-full bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent transition-all appearance-none"
                >
                  <option className="bg-slate-800 text-white p-2">
                    Beginner (Completed base programming coursework)
                  </option>
                  <option className="bg-slate-800 text-white p-2">
                    Intermediate (Created static apps, basic SQL/CLI)
                  </option>
                  <option className="bg-slate-800 text-white p-2">
                    Advanced (Active GitHub, deployed basic containers)
                  </option>
                </select>
              </div>

              <div className="space-y-1.5 text-slate-100">
                <label
                  htmlFor="statement-text"
                  className="text-[11px] font-mono text-slate-200 block uppercase font-bold tracking-wider"
                >
                  Statement of Intent & Project Motivation:
                </label>
                <textarea
                  id="statement-text"
                  rows={4}
                  placeholder="Outline why you are pursuing this specific virtual track and what systems you aspire to engineer..."
                  value={applicationData.statement}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      statement: e.target.value,
                    }))
                  }
                  className="w-full bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-transparent transition-all resize-none min-h-\[100px]"
                  // Increased rows to 4, added min-height
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              >
                <Send className="w-4 h-4 text-slate-100" />
                <span className="text-slate-100">
                  Submit Pipeline Application
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== POPUP MODAL: PARTNER WITH US DIRECTLY ==================== */}
      {partnerModalOpen && (
        <div
          id="modal-partner"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setPartnerModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#007aff] font-bold">
                Fast-Track Enterprise Handoff
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                Initiate Enterprise Partnership
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Connect directly with our corporate support specialist. Complete
                the contact profile and we will establish secure communications
                instantly.
              </p>
            </div>

            <form onSubmit={handlePartnershipSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-slate-100">
                  <label
                    htmlFor="modal-comp-name"
                    className="text-[11px] font-mono text-slate-300 block uppercase"
                  >
                    Company / Organization Name: *
                  </label>
                  <input
                    id="modal-comp-name"
                    type="text"
                    required
                    placeholder="e.g. Solertia Global Partners"
                    value={partnershipRequest.companyName}
                    onChange={(e) =>
                      setPartnershipRequest((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#007aff]"
                  />
                </div>

                <div className="space-y-1.5  text-slate-100">
                  <label
                    htmlFor="modal-contact-name"
                    className="text-[11px] font-mono text-slate-300 block uppercase"
                  >
                    Contact Name: *
                  </label>
                  <input
                    id="modal-contact-name"
                    type="text"
                    required
                    placeholder="e.g. Marcus Chen"
                    value={partnershipRequest.contactName}
                    onChange={(e) =>
                      setPartnershipRequest((prev) => ({
                        ...prev,
                        contactName: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#007aff]"
                  />
                </div>
              </div>

              <div className="space-y-1.5  text-slate-100">
                <label
                  htmlFor="modal-email"
                  className="text-[11px] font-mono text-slate-300 block uppercase"
                >
                  Business Email Address: *
                </label>
                <input
                  id="modal-email"
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={partnershipRequest.email}
                  onChange={(e) =>
                    setPartnershipRequest((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#007aff]"
                />
              </div>

              <div className="space-y-1.5  text-slate-100">
                <label
                  htmlFor="modal-scope"
                  className="text-[11px] font-mono text-slate-300 block uppercase"
                >
                  Briefly Describe Partnership Intentions:
                </label>
                <textarea
                  id="modal-scope"
                  rows={4}
                  placeholder="Tell us about the physical cabling audit, custom server rollout, TVET technical mentorship, or software projects you'd like us to supervise..."
                  value={partnershipRequest.projectScope}
                  onChange={(e) =>
                    setPartnershipRequest((prev) => ({
                      ...prev,
                      projectScope: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007aff] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-[#007aff] to-teal-600 hover:from-teal-600 hover:to-[#007aff] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4  text-slate-100" />
                <span className="text-slate-100">Submit Partner Request</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
