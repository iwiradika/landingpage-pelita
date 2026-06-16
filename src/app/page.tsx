"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Menu, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapSection = dynamic(() => import('@/components/MapSection'), {
  loading: () => <div className="h-[400px] w-full rounded-xl animate-pulse" style={{ background: 'rgba(15,23,42,0.5)' }} />,
});

const AIChat = dynamic(() => import('@/components/AIChat').then(mod => mod.AIChat), {
  ssr: false,
});

/* ─── Static data (outside component to avoid re-creation on render) ─── */

const INDICATOR_DATA: Record<string, { title: string; description: string }> = {
  "1.1": { title: "Rekayasa Perangkat Lunak", description: "Kemampuan memahami konsep dasar pengembangan software, dapat menggunakan aplikasi pengembangan sederhana, dan memahami prinsip-prinsip rekayasa perangkat lunak untuk pembelajaran." },
  "1.2": { title: "Pengembangan Gim", description: "Kemampuan mengembangkan game pembelajaran sederhana, memahami konsep game design dasar, dan menggunakan game engine untuk membuat konten edukatif interaktif." },
  "1.3": { title: "Sistem Informasi, Jaringan, dan Aplikasi", description: "Kemampuan merancang sistem informasi sederhana, mengintegrasikan database dengan aplikasi, dan memahami konsep jaringan untuk mendukung sistem pembelajaran digital." },
  "1.4": { title: "Teknik Komputer dan Jaringan", description: "Pemahaman tentang hardware komputer, jaringan internet, troubleshooting dasar, keamanan jaringan, dan kemampuan mengelola infrastruktur TI untuk pembelajaran." },
  "1.5": { title: "Teknik Jaringan Akses Telekomunikasi", description: "Kemampuan memahami teknologi akses telekomunikasi, instalasi perangkat akses dasar, dan troubleshooting konektivitas untuk mendukung pembelajaran jarak jauh." },
  "1.6": { title: "Teknik Transmisi Telekomunikasi", description: "Pemahaman tentang sistem transmisi data, teknologi komunikasi wireless dan kabel, serta kemampuan mengoptimalkan kualitas transmisi untuk pembelajaran digital." },
  "2.1": { title: "Perancangan Pembelajaran Digital", description: "Merancang kegiatan pembelajaran digital, memilih platform dan media yang sesuai." },
  "2.2": { title: "Pembelajaran Kolaboratif", description: "Memfasilitasi kerja sama bermakna dalam lingkungan virtual menggunakan berbagai tools." },
  "2.3": { title: "Desain Pembelajaran Mandiri", description: "Mengembangkan kemampuan siswa belajar secara otonom melalui platform dan modul interaktif." },
  "2.4": { title: "Strategi Asesmen dan Umpan Balik Digital", description: "Mengintegrasikan evaluasi autentik berbasis kinerja, menganalisis data pembelajaran, dan memberikan umpan balik yang personal dan konstruktif." },
  "3.1": { title: "Etika Digital", description: "Memahami dan mengajarkan implikasi sosial teknologi, hak cipta, privasi, dan pengambilan keputusan etis." },
  "3.2": { title: "Praktik Reflektif", description: "Kemampuan melakukan evaluasi diri sistematis terhadap penggunaan teknologi untuk perbaikan berkelanjutan." },
  "3.3": { title: "Hubungan dengan Industri", description: "Menjalin kolaborasi dengan praktisi industri untuk memastikan relevansi kurikulum dengan kebutuhan profesional aktual." },
  "3.4": { title: "Kepemimpinan Digital", description: "Kemampuan menjadi agen perubahan dalam transformasi digital di lingkungan pendidikan." },
  "4.1": { title: "Aksesibilitas & Inklusi", description: "Kemampuan memastikan teknologi dan konten digital dapat diakses oleh semua siswa termasuk yang berkebutuhan khusus, serta memahami prinsip universal design dalam pembelajaran digital." },
  "4.2": { title: "Jaringan Profesional", description: "Kemampuan membangun dan memelihara jaringan profesional melalui platform digital, berpartisipasi dalam komunitas online, dan berbagi praktik baik dengan sesama pendidik." },
  "4.3": { title: "Kolaborasi Digital", description: "Kemampuan bekerja sama secara efektif dengan kolega, siswa, dan stakeholder lainnya menggunakan berbagai tools kolaborasi digital dan platform komunikasi online." },
  "4.4": { title: "Komunikasi Digital", description: "Kemampuan berkomunikasi secara efektif melalui berbagai medium digital, memahami etika komunikasi online, dan mampu menyampaikan informasi dengan jelas dan persuasif." },
};

const TECH_LOGOS = [
  { src: "/react_logo.png", alt: "React" },
  { src: "/nodejs_logo.png", alt: "Node.js" },
  { src: "/mongodblogo.png.jpeg", alt: "MongoDB" },
  { src: "/R_logo-2.svg", alt: "R" },
];

const NAV_LINKS = [
  { href: "#about", label: "Framework" },
  { href: "#panduan", label: "Model" },
  { href: "#location", label: "Location" },
  { href: "#contact", label: "Contact" },
];

/* 4 competency dimensions with cohesive color scheme */
const DIMENSIONS = [
  {
    id: "1",
    label: "Information Technology Content",
    color: "violet",
    dotColor: "#7C3AED",
    indicators: [
      { id: "1.1", title: "Software Engineering" },
      { id: "1.2", title: "Game Development" },
      { id: "1.3", title: "Information Systems, Networks & Applications" },
      { id: "1.4", title: "Computer & Network Engineering" },
      { id: "1.5", title: "Telecommunication Access Network" },
      { id: "1.6", title: "Telecommunication Transmission" },
    ],
    activeClass: "bg-violet-500/20 border-violet-500/50 text-violet-200",
    hoverClass: "hover:bg-violet-500/15 hover:border-violet-400/40 hover:text-violet-100",
    textClass: "text-violet-300",
    badgeGradient: "from-violet-600 to-violet-800",
    badgeShadow: "shadow-violet-500/30",
    headerText: "text-violet-400",
    ringGlow: "rgba(124,58,237,0.2)",
  },
  {
    id: "2",
    label: "Digital Pedagogy",
    color: "teal",
    dotColor: "#0D9488",
    indicators: [
      { id: "2.1", title: "Digital Learning Design" },
      { id: "2.2", title: "Collaborative Learning" },
      { id: "2.3", title: "Self-Directed Learning Design" },
      { id: "2.4", title: "Digital Assessment & Feedback Strategies" },
    ],
    activeClass: "bg-teal-500/20 border-teal-500/50 text-teal-200",
    hoverClass: "hover:bg-teal-500/15 hover:border-teal-400/40 hover:text-teal-100",
    textClass: "text-teal-300",
    badgeGradient: "from-teal-600 to-teal-800",
    badgeShadow: "shadow-teal-500/30",
    headerText: "text-teal-400",
    ringGlow: "rgba(13,148,136,0.2)",
  },
  {
    id: "3",
    label: "Digital Professionalism",
    color: "indigo",
    dotColor: "#4F46E5",
    indicators: [
      { id: "3.1", title: "Digital Ethics" },
      { id: "3.2", title: "Reflective Practice" },
      { id: "3.3", title: "Industry Relations" },
      { id: "3.4", title: "Digital Leadership" },
    ],
    activeClass: "bg-indigo-500/20 border-indigo-500/50 text-indigo-200",
    hoverClass: "hover:bg-indigo-500/15 hover:border-indigo-400/40 hover:text-indigo-100",
    textClass: "text-indigo-300",
    badgeGradient: "from-indigo-600 to-indigo-800",
    badgeShadow: "shadow-indigo-500/30",
    headerText: "text-indigo-400",
    ringGlow: "rgba(79,70,229,0.2)",
  },
  {
    id: "4",
    label: "Digital Social Engagement",
    color: "cyan",
    dotColor: "#0891B2",
    indicators: [
      { id: "4.1", title: "Accessibility & Inclusion" },
      { id: "4.2", title: "Professional Networking" },
      { id: "4.3", title: "Digital Collaboration" },
      { id: "4.4", title: "Digital Communication" },
    ],
    activeClass: "bg-cyan-500/20 border-cyan-500/50 text-cyan-200",
    hoverClass: "hover:bg-cyan-500/15 hover:border-cyan-400/40 hover:text-cyan-100",
    textClass: "text-cyan-300",
    badgeGradient: "from-cyan-600 to-cyan-800",
    badgeShadow: "shadow-cyan-500/30",
    headerText: "text-cyan-400",
    ringGlow: "rgba(8,145,178,0.2)",
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function Home() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowHeader(window.scrollY > window.innerHeight * 0.8);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate-fade-in-up');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.hero-animate, .feature-card').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const selectedDim = selectedIndicator
    ? DIMENSIONS.find(d => selectedIndicator.startsWith(d.id + '.'))
    : null;

  return (
    <>
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>

        {/* ── Sticky Header ──────────────────────────────────────────── */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showHeader ? 'translate-y-0 backdrop-blur-md border-b border-white/[0.06]' : '-translate-y-full'
        }`} style={showHeader ? { background: 'rgba(2,8,23,0.85)' } : {}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center" style={{ width: 44, height: 44 }}>
                  <Image src="/Logo_undiksha.png" alt="Undiksha Logo" width={44} height={44} className="w-full h-full object-contain" />
                </div>
                <div className="w-px h-7 bg-white/15 rounded-full" />
                <div className="flex items-center justify-center" style={{ width: 44, height: 44 }}>
                  <Image src="/logo_uny.png" alt="UNY Logo" width={44} height={44} className="w-full h-full object-contain" />
                </div>
                <div className="w-px h-7 bg-white/15 rounded-full" />
                <div className="flex items-center justify-center" style={{ width: 44, height: 44 }}>
                  <Image src="/logo_pelita.png" alt="PELITA Logo" width={44} height={44} className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-7">
                  {NAV_LINKS.map((link) => (
                    <a key={link.href} href={link.href}
                      className="text-sm font-medium text-slate-400 hover:text-violet-300 transition-colors">
                      {link.label}
                    </a>
                  ))}
                </nav>
                <a href="https://assessment.pelita-framework.cloud" target="_blank" rel="noopener noreferrer"
                  className="hidden md:inline-block btn-primary text-sm px-5 py-2.5">
                  Try PELITA
                </a>
                <button className="md:hidden text-slate-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                className="md:hidden border-t border-white/[0.06] px-4 py-4 space-y-2"
                style={{ background: 'rgba(2,8,23,0.95)' }}>
                {NAV_LINKS.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-base font-medium text-slate-300 hover:text-violet-300 transition-colors">
                    {link.label}
                  </a>
                ))}
                <a href="https://assessment.pelita-framework.cloud" target="_blank" rel="noopener noreferrer"
                  className="block mt-3 btn-primary text-center text-sm">
                  Try PELITA Now
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden section-hero">
          {/* Video background */}
          <div className="absolute inset-0 w-full h-full">
            <iframe
              width="100%" height="100%"
              src="https://www.youtube.com/embed/WqrE23yAIBI?si=pC0vDgdXWRmEyf7c&autoplay=1&mute=1&loop=1&playlist=WqrE23yAIBI&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
              title="PELITA background"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '120vw', height: '67.5vw',
                minHeight: '120vh', minWidth: '213.33vh',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none', border: 'none',
              }}
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(2,8,23,0.55) 0%, rgba(2,8,23,0.7) 100%)' }} />

          {/* Hero content */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6 flex justify-center">
              <span className="pill-badge">Digital Assessment Platform</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-tight">
              <span className="gradient-text-violet">Online Assessment of</span>
              <br />
              <span className="text-white">Digital Competency</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75 }}
              className="text-lg sm:text-xl md:text-2xl font-medium mb-10 text-slate-300 max-w-3xl mx-auto">
              For Prospective Vocational Educators in Information Technology
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://assessment.pelita-framework.cloud" target="_blank" rel="noopener noreferrer"
                className="btn-primary text-base glow-pulse">
                Start Assessment
              </a>
              <a href="#about" className="btn-outline text-base">
                Explore Framework
              </a>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-white/70"
                style={{ transform: 'rotate(180deg)' }} />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Framework Section ──────────────────────────────────────── */}
        <section id="about" className="relative w-full py-24 overflow-hidden section-a">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* Image */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }} viewport={{ once: true }}>
                <div className="glass-card glass-card-hover p-6 cursor-pointer group"
                  onClick={() => setIsFullscreen(true)}>
                  <div className="relative overflow-hidden rounded-xl">
                    <Image src="/framwork.png" alt="Framework Asesmen PELITA" width={600} height={400}
                      className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(2,8,23,0.3)' }}>
                      <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold">
                        Klik untuk memperbesar
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Text */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-6">
                <div>
                  <div className="pill-badge mb-4">Framework</div>
                  <h3 className="text-4xl font-bold text-white mb-4">PELITA Framework</h3>
                  <div className="accent-line mb-6" />
                  <p className="text-slate-400 leading-relaxed mb-6">
                    The PELITA framework measures digital competency of prospective educators across four integrated dimensions:
                  </p>
                </div>
                <div className="space-y-3.5">
                  {[
                    { dot: "#7C3AED", label: "IT Content Knowledge:", desc: "Mastery of information technology content" },
                    { dot: "#0D9488", label: "Digital Pedagogy:", desc: "Ability to apply technology-based learning" },
                    { dot: "#4F46E5", label: "Digital Professionalism:", desc: "Professional conduct in technology use" },
                    { dot: "#0891B2", label: "Digital Social Engagement:", desc: "Ability to collaborate through digital platforms" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                      <p className="text-slate-300 text-sm leading-relaxed">
                        <span className="font-semibold text-white">{item.label}</span>{' '}{item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pt-2">
                  Assessment is conducted across five levels of technology taxonomy within an IT and AI knowledge context, providing a holistic evaluation of educator readiness in the digital era.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Panduan Model Section ──────────────────────────────────── */}
        <section id="panduan" className="relative w-full py-24 overflow-hidden section-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* Book cover */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }} viewport={{ once: true }}>
                <div className="glass-card glass-card-hover p-6">
                  <Image src="/BukuPanduan.png" alt="Buku Panduan Model PELITA" width={600} height={800}
                    className="w-full h-auto object-cover rounded-xl shadow-lg" />
                </div>
              </motion.div>

              {/* Text */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-6">
                <div>
                  <div className="pill-badge mb-4">Model</div>
                  <h3 className="text-4xl font-bold text-white mb-4">PELITA Model Guide</h3>
                  <div className="accent-line mb-6" />
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Get the complete implementation guide for the PELITA Model — covering conceptual foundations, framework structure, technical guidelines, CDM-GDINA analysis procedures, and result interpretation.
                  </p>
                </div>
                <div className="space-y-3.5">
                  {[
                    { dot: "#7C3AED", label: "Conceptual Foundation:", desc: "Theory and core concepts of digital competency assessment" },
                    { dot: "#0D9488", label: "Framework Structure:", desc: "PELITA framework with 4 integrated competency dimensions" },
                    { dot: "#4F46E5", label: "Technical Guidelines:", desc: "Step-by-step implementation and best practices" },
                    { dot: "#0891B2", label: "CDM-GDINA Analysis:", desc: "Statistical analysis procedures and result interpretation" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                      <p className="text-slate-300 text-sm leading-relaxed">
                        <span className="font-semibold text-white">{item.label}</span>{' '}{item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }} viewport={{ once: true }} className="pt-2">
                  <a href="/BukuPanduan_PELITA.pdf" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 btn-primary text-base">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Guide
                  </a>
                  <p className="text-xs text-slate-500 mt-2">Available in PDF format</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Kisi-kisi Section ──────────────────────────────────────── */}
        <section className="relative w-full py-24 overflow-hidden section-c">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }} viewport={{ once: true }} className="text-center mb-14">
              <div className="pill-badge mb-4 mx-auto w-fit">Competency</div>
              <h3 className="text-4xl font-bold text-white mb-4">Digital Competency Framework</h3>
              <div className="accent-line mx-auto mb-4" />
              <p className="text-slate-400 max-w-2xl mx-auto">
                Click on any indicator to view a detailed description of the competency being assessed
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Kisi-kisi grid */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {DIMENSIONS.map((dim) => (
                      <div key={dim.id}
                        className="rounded-xl p-4 border border-white/[0.06] transition-all duration-300"
                        style={{ background: 'rgba(15,23,42,0.5)' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${dim.badgeGradient} text-white flex items-center justify-center text-sm font-bold rounded-lg shadow-lg ${dim.badgeShadow}`}>
                            {dim.id}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold leading-tight ${dim.headerText}`}>{dim.label}</h4>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {dim.indicators.map((item) => (
                            <button key={item.id} onClick={() => setSelectedIndicator(item.id)}
                              className={`indicator-btn border ${dim.hoverClass} ${
                                selectedIndicator === item.id ? dim.activeClass : 'text-slate-400 border-transparent'
                              }`}>
                              <span className="font-mono text-xs mr-2 opacity-60">{item.id}</span>
                              {item.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detail panel */}
              <div className="space-y-5">
                <AnimatePresence mode="wait">
                  {selectedIndicator ? (
                    <motion.div key={selectedIndicator}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                      className="glass-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs text-slate-500">Indicator {selectedIndicator}</span>
                        <button onClick={() => setSelectedIndicator(null)}
                          className="text-slate-500 hover:text-white transition-colors text-lg leading-none">×</button>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-3">
                        {INDICATOR_DATA[selectedIndicator]?.title}
                      </h4>
                      <div className="accent-line mb-4" style={{
                        background: `linear-gradient(90deg, ${selectedDim?.dotColor ?? '#7C3AED'}, #0D9488)`
                      }} />
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {INDICATOR_DATA[selectedIndicator]?.description}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="glass-card p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                        🎯
                      </div>
                      <h4 className="text-base font-semibold text-white mb-2">Select an Indicator</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Click any indicator in the framework to view a detailed explanation of the competency.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "4", label: "Core Dimensions", color: "#7C3AED" },
                    { value: "18", label: "Total Indicators", color: "#0D9488" },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card p-4 text-center">
                      <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Map Section ───────────────────────────────────────────── */}
        <MapSection />

        {/* ── Technology Section ────────────────────────────────────── */}
        <section className="py-24 section-d">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }} viewport={{ once: true }} className="text-center mb-14">
              <div className="pill-badge mb-4 mx-auto w-fit">Stack</div>
              <h3 className="text-4xl font-bold text-white mb-4">Technology Stack</h3>
              <div className="accent-line mx-auto mb-4" />
              <p className="text-slate-400">This assessment platform is built with:</p>
            </motion.div>

            <div className="relative overflow-hidden">
              <div className="flex animate-scroll">
                {[...Array(2)].map((_, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-20 flex-shrink-0 px-10">
                    {TECH_LOGOS.map((logo) => (
                      <div key={logo.alt}
                        className="opacity-40 hover:opacity-80 transition-all duration-300 hover:scale-110 flex-shrink-0">
                        <Image src={logo.src} alt={`${logo.alt} Logo`} width={100} height={100}
                          className="object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer id="contact" className="py-16 border-t" style={{ background: '#020817', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center">
              <div className="max-w-lg text-center">
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }} viewport={{ once: true }}>
                  {/* Logos: Undiksha · UNY · PELITA */}
                  <div className="flex items-center justify-center gap-4 mb-5">
                    <Image src="/Logo_undiksha.png" alt="Undiksha Logo" width={48} height={48} className="object-contain" />
                    <div className="w-px h-8 bg-white/15 rounded-full" />
                    <Image src="/logo_uny.png" alt="UNY Logo" width={48} height={48} className="object-contain" />
                    <div className="w-px h-8 bg-white/15 rounded-full" />
                    <Image src="/logo_pelita.png" alt="PELITA Logo" width={48} height={48} className="object-contain" />
                  </div>
                  <h3 className="text-xl font-bold gradient-text-violet mb-3">PELITA</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    An online digital competency assessment platform for prospective vocational IT educators, built on the PELITA framework with GDINA integration.
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                      <Mail className="w-4 h-4 text-violet-500" />
                      <span>iwiradika@undiksha.ac.id</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-teal-500" />
                      <span>Yogyakarta, Indonesia</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}
              className="mt-12 pt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-slate-600 text-sm">
                © {new Date().getFullYear()} Wiradika, I.N.I., Hadi, S., Khairudin, M. All rights reserved.
              </p>
            </motion.div>
          </div>
        </footer>

        {/* ── Fullscreen Modal ──────────────────────────────────────── */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              style={{ background: 'rgba(2,8,23,0.92)' }}
              onClick={() => setIsFullscreen(false)}>
              <div className="relative max-w-6xl max-h-full">
                <button onClick={() => setIsFullscreen(false)}
                  className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors z-10 font-bold">
                  ×
                </button>
                <Image src="/framwork.png" alt="Framework Asesmen PELITA" width={1200} height={800}
                  className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <AIChat />
    </>
  );
}
