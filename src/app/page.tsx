"use client";

import Image from "next/image";
import { AIChat } from "@/components/AIChat";
import { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';

// Declare maplibre-gl types
declare global {
  interface Window {
    maplibregl: {
      Map: new (options: any) => any;
      Marker: new (options?: any) => any;
      Popup: new (options?: any) => any;
      NavigationControl: new () => any;
      ScaleControl: new () => any;
    };
  }
}

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  // Data indikator kisi-kisi
  const indicatorData = {
    "1.1": {
      title: "Rekayasa Perangkat Lunak",
      description: "Kemampuan memahami konsep dasar pengembangan software, dapat menggunakan aplikasi pengembangan sederhana, dan memahami prinsip-prinsip rekayasa perangkat lunak untuk pembelajaran."
    },
    "1.2": {
      title: "Pengembangan Gim", 
      description: "Kemampuan mengembangkan game pembelajaran sederhana, memahami konsep game design dasar, dan menggunakan game engine untuk membuat konten edukatif interaktif."
    },
    "1.3": {
      title: "Sistem Informasi, Jaringan, dan Aplikasi",
      description: "Kemampuan merancang sistem informasi sederhana, mengintegrasikan database dengan aplikasi, dan memahami konsep jaringan untuk mendukung sistem pembelajaran digital."
    },
    "1.4": {
      title: "Teknik Komputer dan Jaringan",
      description: "Pemahaman tentang hardware komputer, jaringan internet, troubleshooting dasar, keamanan jaringan, dan kemampuan mengelola infrastruktur TI untuk pembelajaran."
    },
    "1.5": {
      title: "Teknik Jaringan Akses Telekomunikasi",
      description: "Kemampuan memahami teknologi akses telekomunikasi, instalasi perangkat akses dasar, dan troubleshooting konektivitas untuk mendukung pembelajaran jarak jauh."
    },
    "1.6": {
      title: "Teknik Transmisi Telekomunikasi",
      description: "Pemahaman tentang sistem transmisi data, teknologi komunikasi wireless dan kabel, serta kemampuan mengoptimalkan kualitas transmisi untuk pembelajaran digital."
    },
    "2.1": {
      title: "Perancangan Pembelajaran Digital",
      description: "Merancang kegiatan pembelajaran digital, memilih platform dan media yang sesuai."
    },
    "2.2": {
      title: "Pembelajaran Kolaboratif",
      description: "Memfasilitasi kerja sama bermakna dalam lingkungan virtual menggunakan berbagai tools."
    },
    "2.3": {
      title: "Desain Pembelajaran Mandiri",
      description: "Mengembangkan kemampuan siswa belajar secara otonom melalui platform dan modul interaktif."
    },
    "2.4": {
      title: "Strategi Asesmen dan Umpan Balik Digital",
      description: "Mengintegrasikan evaluasi autentik berbasis kinerja, menganalisis data pembelajaran, dan memberikan umpan balik yang personal dan konstruktif."
    },
    "3.1": {
      title: "Etika Digital",
      description: "Memahami dan mengajarkan implikasi sosial teknologi, hak cipta, privasi, dan pengambilan keputusan etis."
    },
    "3.2": {
      title: "Praktik Reflektif",
      description: "Kemampuan melakukan evaluasi diri sistematis terhadap penggunaan teknologi untuk perbaikan berkelanjutan."
    },
    "3.3": {
      title: "Hubungan dengan Industri",
      description: "Menjalin kolaborasi dengan praktisi industri untuk memastikan relevansi kurikulum dengan kebutuhan profesional aktual."
    },
    "3.4": {
      title: "Kepemimpinan Digital",
      description: "Kemampuan menjadi agen perubahan dalam transformasi digital di lingkungan pendidikan."
    },
    "4.1": {
      title: "Aksesibilitas & Inklusi",
      description: "Kemampuan memastikan teknologi dan konten digital dapat diakses oleh semua siswa termasuk yang berkebutuhan khusus, serta memahami prinsip universal design dalam pembelajaran digital."
    },
    "4.2": {
      title: "Jaringan Profesional",
      description: "Kemampuan membangun dan memelihara jaringan profesional melalui platform digital, berpartisipasi dalam komunitas online, dan berbagi praktik baik dengan sesama pendidik."
    },
    "4.3": {
      title: "Kolaborasi Digital",
      description: "Kemampuan bekerja sama secara efektif dengan kolega, siswa, dan stakeholder lainnya menggunakan berbagai tools kolaborasi digital dan platform komunikasi online."
    },
    "4.4": {
      title: "Komunikasi Digital",
      description: "Kemampuan berkomunikasi secara efektif melalui berbagai medium digital, memahami etika komunikasi online, dan mampu menyampaikan informasi dengan jelas dan persuasif."
    }
  };

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Handle scroll to show/hide header
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowHeader(scrollY > window.innerHeight * 0.8); // Show header after scrolling 80% of viewport
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Simple scroll-based animations using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElements = document.querySelectorAll('.hero-animate');
    const featureCards = document.querySelectorAll('.feature-card');
    
    [...heroElements, ...featureCards].forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Initialize MapLibre GL JS map with better error handling
    const initializeMap = () => {
      if (!mapRef.current) {
        console.log('Map container not ready');
        return;
      }

      if (typeof window === 'undefined') {
        console.log('Window not available (SSR)');
        return;
      }

      if (!window.maplibregl) {
        console.log('MapLibre GL JS not loaded, retrying...');
        setTimeout(initializeMap, 1000);
        return;
      }

      try {
        console.log('Initializing MapLibre GL JS map...');
        const map = new window.maplibregl.Map({
          container: mapRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [115.0921, -8.1197], // Singaraja coordinates
          zoom: 6,
          pitch: 45,
          bearing: 0
        });

        map.on('load', () => {
          console.log('Map loaded successfully');
          setIsMapLoaded(true);
          // Ensure page stays at top after map loads
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        });

        map.on('error', (e: any) => {
          console.error('Map error:', e);
          setIsMapLoaded(true); // Still show the container even if there's an error
        });

        // Add marker for Universitas Pendidikan Ganesha
        const marker = new window.maplibregl.Marker({
          color: '#6366f1',
          scale: 1.2
        })
        .setLngLat([115.0921, -8.1197])
        .setPopup(
          new window.maplibregl.Popup({ offset: 25 })
            .setHTML(
              '<div style="color: black; font-weight: bold; margin-bottom: 5px;">Universitas Pendidikan Ganesha</div>' +
              '<div style="color: #666; font-size: 12px;">Singaraja, Buleleng, Bali</div>' +
              '<div style="color: #6366f1; font-size: 12px; margin-top: 5px;">Lokasi Sample Penelitian PELITA</div>'
            )
        )
        .addTo(map);

        // Add navigation control
        map.addControl(new window.maplibregl.NavigationControl(), 'top-right');

        // Add scale control
        map.addControl(new window.maplibregl.ScaleControl(), 'bottom-left');

        // Auto-open popup on load
        setTimeout(() => {
          marker.getPopup().addTo(map);
          // Ensure page stays at top after popup opens
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }, 1000);

        return () => {
          console.log('Cleaning up map...');
          map.remove();
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsMapLoaded(true); // Show container even with error
      }
    };

    // Wait longer for scripts to load
    setTimeout(initializeMap, 1000);
  }, []);

  return (
    <>
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Header - only shows after scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showHeader 
          ? 'translate-y-0 bg-black/20 backdrop-blur-md shadow-sm border-b border-white/10' 
          : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-30 h-20 overflow-hidden rounded-lg">
                <Image
                  src="/logo.png"
                  alt="PELITA Logo"
                  width={120}
                  height={120}
                  className="object-cover"
                  style={{ 
                    objectPosition: 'center',
                    transform: 'translateY(-11px)'
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex space-x-8">
                <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors">Framework</a>
                <a href="#panduan" className="text-gray-300 hover:text-purple-400 transition-colors">Model</a>
                <a href="#location" className="text-gray-300 hover:text-purple-400 transition-colors">Lokasi</a>
                <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">Kontak</a>
              </nav>
              <a 
                href="https://assessment.pelita-framework.cloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold text-sm transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 inline-block"
              >
                COBA PELITA SEKARANG
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Landing Section - With YouTube Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* YouTube Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/WqrE23yAIBI?si=pC0vDgdXWRmEyf7c&autoplay=1&mute=1&loop=1&playlist=WqrE23yAIBI&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
            title="YouTube video player" 
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120vw',
              height: '67.5vw', // 16:9 aspect ratio with 20% zoom
              minHeight: '120vh',
              minWidth: '213.33vh', // 16:9 aspect ratio with 20% zoom
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              border: 'none'
            }}
          />
        </div>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
              Pengukuran Online Kompetensi Digital
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl sm:text-2xl md:text-3xl font-medium mb-8"
          >
            <span className="bg-gradient-to-r from-purple-300 via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Untuk Calon Pendidik Kejuruan Bidang Keahlian Teknologi Informasi
            </span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href="https://assessment.pelita-framework.cloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-purple-500/30 inline-block"
            >
              Mulai Assessment
            </a>
            <a 
              href="#about" 
              className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-block"
            >
              Pelajari Framework
            </a>
          </motion.div>
        </div>
        
        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/80"
                style={{ transform: 'rotate(180deg)' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </section>


      {/* Framework Section */}
      <section id="about" className="relative w-full bg-black py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Framework Image */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="relative overflow-hidden rounded-xl cursor-pointer group" onClick={() => setIsFullscreen(true)}>
                  <Image
                    src="/framwork.png"
                    alt="Framework Asesmen PELITA"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  />
                  {/* Click overlay hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium">
                      Klik untuk memperbesar
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Description */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-white mb-6">
                  Framework PELITA
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed mb-4">
                  Framework PELITA (Pengukuran Online Kompetensi Digital) mengukur kompetensi digital calon pendidik melalui empat dimensi terintegrasi:
                </p>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-sky-400">Konten Teknologi Informasi:</span> Pengetahuan konten teknologi informasi</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-blue-600">Pedagogik Digital:</span> Kemampuan menerapkan pembelajaran berbasis teknologi</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-pink-400">Profesionalisme Digital:</span> Sikap profesional dalam pemanfaatan teknologi</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-purple-500">Keterlibatan Sosial Digital:</span> Kemampuan berkolaborasi melalui platform digital</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  Pengukuran dilakukan melalui lima level taksonomi teknologi dengan konteks pengetahuan teknologi informasi dan AI, memberikan penilaian holistik kesiapan calon pendidik di era digital.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Panduan Model PELITA Section */}
      <section id="panduan" className="relative w-full bg-slate-900 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Book Cover */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src="/BukuPanduan.png"
                    alt="Buku Panduan Model PELITA"
                    width={600}
                    height={800}
                    className="w-full h-auto object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  />
                </div>
              </motion.div>
            </div>

            {/* Right Side - Description & Download */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-bold text-white mb-6">
                  Panduan Model PELITA
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Dapatkan panduan lengkap tentang implementasi Model PELITA untuk pengukuran kompetensi digital calon pendidik kejuruan TI. Buku panduan ini berisi landasan konseptual, kerangka kerja, panduan teknis, prosedur analisis CDM-GDINA, dan interpretasi hasil.
                </p>
                
                <div className="space-y-4 text-gray-300 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-purple-400">Landasan Konseptual:</span> Teori dan konsep dasar pengukuran kompetensi digital</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-indigo-400">Kerangka Kerja:</span> Framework PELITA dengan 4 dimensi kompetensi terintegrasi</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-cyan-400">Panduan Teknis:</span> Langkah-langkah implementasi dan praktik terbaik</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold text-emerald-400">Analisis CDM-GDINA:</span> Prosedur analisis statistik dan interpretasi hasil assessment</p>
                  </div>
                </div>

                {/* Download Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <a
                    href="/BukuPanduan_PELITA.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-purple-500/30"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Unduh Buku Panduan
                  </a>
                  <p className="text-sm text-gray-400 mt-3">
                    * File tersedia dalam format PDF
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Kisi-kisi Section */}
      <section className="relative w-full bg-black py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-white mb-6">
              Kisi-kisi Kompetensi Digital
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Klik pada setiap indikator untuk melihat penjelasan detail kompetensi yang akan diukur
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Interactive Kisi-kisi Layout */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-lg">
                
                {/* Kisi-kisi Layout Recreation - Light Theme */}
                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 min-h-[600px] border border-slate-700/50 relative overflow-hidden shadow-lg">
                  
                  {/* Background glow effects */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                  
                  {/* Grid Layout for better organization */}
                  <div className="grid grid-cols-2 gap-8 h-full relative z-10">
                    
                    {/* Left Column */}
                    <div className="space-y-8">
                      
                      {/* Kompetensi 1 - Konten Teknologi Informasi */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group">
                        <div className="flex items-center mb-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center text-lg font-bold transform rotate-45 mr-4 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow duration-300">
                            1
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">Konten Teknologi Informasi</h4>
                            <p className="text-sm text-cyan-500/80">Calon Pendidik</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            { id: "1.1", title: "Rekayasa Perangkat Lunak" },
                            { id: "1.2", title: "Pengembangan Gim" },
                            { id: "1.3", title: "Sistem Informasi, Jaringan, dan Aplikasi" },
                            { id: "1.4", title: "Teknik Komputer dan Jaringan" },
                            { id: "1.5", title: "Teknik Jaringan Akses Telekomunikasi" },
                            { id: "1.6", title: "Teknik Transmisi Telekomunikasi" }
                          ].map((item) => (
                            <div key={item.id} className="flex items-center py-1 group/item">
                              <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center text-xs font-bold transform rotate-45 mr-3 flex-shrink-0 shadow-sm group-hover/item:shadow-cyan-500/40 transition-shadow duration-200">
                                {item.id}
                              </div>
                              <button 
                                onClick={() => setSelectedIndicator(item.id)}
                                className={`text-cyan-300 hover:text-cyan-100 transition-all cursor-pointer text-left text-sm font-medium hover:bg-cyan-500/20 px-3 py-2 rounded-lg flex-1 border border-transparent hover:border-cyan-400/50 backdrop-blur-sm ${selectedIndicator === item.id ? 'bg-cyan-500/30 border-cyan-400/50 text-cyan-100' : ''}`}
                              >
                                {item.title}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Kompetensi 3 - Profesionalisme Digital */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50 shadow-lg hover:shadow-pink-500/20 transition-all duration-300 group">
                        <div className="flex items-center mb-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center text-lg font-bold transform rotate-45 mr-4 shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-shadow duration-300">
                            3
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-pink-400 group-hover:text-pink-300 transition-colors">Profesionalisme Digital</h4>
                            <p className="text-sm text-pink-500/80">Calon Pendidik</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            { id: "3.1", title: "Etika Digital" },
                            { id: "3.2", title: "Praktik Reflektif" },
                            { id: "3.3", title: "Hubungan dengan Industri" },
                            { id: "3.4", title: "Kepemimpinan Digital" }
                          ].map((item) => (
                            <div key={item.id} className="flex items-center py-1 group/item">
                              <div className="w-7 h-7 bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center text-xs font-bold transform rotate-45 mr-3 flex-shrink-0 shadow-sm group-hover/item:shadow-pink-500/40 transition-shadow duration-200">
                                {item.id}
                              </div>
                              <button 
                                onClick={() => setSelectedIndicator(item.id)}
                                className={`text-pink-300 hover:text-pink-100 transition-all cursor-pointer text-left text-sm font-medium hover:bg-pink-500/20 px-3 py-2 rounded-lg flex-1 border border-transparent hover:border-pink-400/50 backdrop-blur-sm ${selectedIndicator === item.id ? 'bg-pink-500/30 border-pink-400/50 text-pink-100' : ''}`}
                              >
                                {item.title}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      
                      {/* Kompetensi 2 - Pedagogik Digital */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                        <div className="flex items-center mb-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-lg font-bold transform rotate-45 mr-4 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow duration-300">
                            2
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-purple-400 group-hover:text-purple-300 transition-colors">Pedagogik Digital</h4>
                            <p className="text-sm text-purple-500/80">Calon Pendidik</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            { id: "2.1", title: "Perancangan Pembelajaran Digital" },
                            { id: "2.2", title: "Pembelajaran Kolaboratif" },
                            { id: "2.3", title: "Desain Pembelajaran Mandiri" },
                            { id: "2.4", title: "Strategi Asesmen dan Umpan Balik Digital" }
                          ].map((item) => (
                            <div key={item.id} className="flex items-center py-1 group/item">
                              <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xs font-bold transform rotate-45 mr-3 flex-shrink-0 shadow-sm group-hover/item:shadow-purple-500/40 transition-shadow duration-200">
                                {item.id}
                              </div>
                              <button 
                                onClick={() => setSelectedIndicator(item.id)}
                                className={`text-purple-300 hover:text-purple-100 transition-all cursor-pointer text-left text-sm font-medium hover:bg-purple-500/20 px-3 py-2 rounded-lg flex-1 border border-transparent hover:border-purple-400/50 backdrop-blur-sm ${selectedIndicator === item.id ? 'bg-purple-500/30 border-purple-400/50 text-purple-100' : ''}`}
                              >
                                {item.title}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Kompetensi 4 - Keterlibatan Sosial Digital */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 group">
                        <div className="flex items-center mb-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-lg font-bold transform rotate-45 mr-4 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow duration-300">
                            4
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">Keterlibatan Sosial Digital</h4>
                            <p className="text-sm text-emerald-500/80">Calon Pendidik</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {[
                            { id: "4.1", title: "Aksesibilitas & inklusi" },
                            { id: "4.2", title: "Jaringan profesional" },
                            { id: "4.3", title: "Kolaborasi digital" },
                            { id: "4.4", title: "Komunikasi digital" }
                          ].map((item) => (
                            <div key={item.id} className="flex items-center py-1 group/item">
                              <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-xs font-bold transform rotate-45 mr-3 flex-shrink-0 shadow-sm group-hover/item:shadow-emerald-500/40 transition-shadow duration-200">
                                {item.id}
                              </div>
                              <button 
                                onClick={() => setSelectedIndicator(item.id)}
                                className={`text-emerald-300 hover:text-emerald-100 transition-all cursor-pointer text-left text-sm font-medium hover:bg-emerald-500/20 px-3 py-2 rounded-lg flex-1 border border-transparent hover:border-emerald-400/50 backdrop-blur-sm ${selectedIndicator === item.id ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-100' : ''}`}
                              >
                                {item.title}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Detail Panel */}
            <div className="space-y-6">
              {selectedIndicator ? (
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-bold text-white">
                      Indikator {selectedIndicator}
                    </h4>
                    <button
                      onClick={() => setSelectedIndicator(null)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <h5 className="text-xl font-semibold text-indigo-400 mb-4">
                    {indicatorData[selectedIndicator as keyof typeof indicatorData]?.title}
                  </h5>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {indicatorData[selectedIndicator as keyof typeof indicatorData]?.description}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-700/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h4 className="text-xl font-semibold text-white mb-3">
                    Pilih Indikator
                  </h4>
                  <p className="text-gray-300">
                    Klik pada salah satu indikator di kisi-kisi untuk melihat penjelasan detail tentang kompetensi yang akan diukur.
                  </p>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
                  <div className="text-2xl font-bold text-cyan-400">4</div>
                  <div className="text-sm text-cyan-300">Kompetensi Utama</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
                  <div className="text-2xl font-bold text-purple-400">18</div>
                  <div className="text-sm text-purple-300">Total Indikator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Location Section */}
      <section id="location" className="bg-black py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-white mb-4">Lokasi Implementasi Prototipe</h3>
            <p className="text-xl text-gray-300 mb-8">Universitas Pendidikan Ganesha - Bali, Indonesia</p>
            
            {/* MapLibre Attribution */}
            <div className="flex items-center justify-center space-x-3 opacity-70">
              <span className="text-sm text-gray-300">Powered by</span>
              <div className="flex items-center space-x-2">
                <Image
                  src="/globe.svg"
                  alt="MapLibre Logo"
                  width={20}
                  height={20}
                  className="grayscale opacity-70"
                />
                <a 
                  href="https://maplibre.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-gray-100 transition-colors"
                >
                  MapLibre
                </a>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Map */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg"
              >
                <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden relative">
                  <div 
                    ref={mapRef}
                    className="w-full h-full rounded-lg"
                    style={{ minHeight: '400px' }}
                  />
                  {/* Loading fallback */}
                  {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-700 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-300 text-sm">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Information Panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h4 className="text-xl font-semibold text-white mb-4">Tentang Universitas Pendidikan Ganesha</h4>
                <p className="text-gray-300 mb-4">
                  Universitas Pendidikan Ganesha (Undiksha) adalah universitas negeri yang berlokasi di Singaraja, Bali. 
                  Sebagai institusi pendidikan tinggi terkemuka, Undiksha menjadi lokasi strategis untuk implementasi 
                  prototipe sistem PELITA.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                    <span>Fakultas Teknik dan Kejuruan</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span>Program Studi Pendidikan Teknik Informatika</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    <span>Calon Pendidik Kejuruan TI</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* Technology Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Dukungan Teknologi</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Asesmen ini dikembangkan berbantu teknologi:
            </p>
          </motion.div>
          
          {/* Running Text Container */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-32 whitespace-nowrap">
              {/* First set of logos */}
              <div className="flex items-center space-x-32 flex-shrink-0">
                {/* React Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/react_logo.png"
                    alt="React Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>

                {/* Node.js Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/nodejs_logo.png"
                    alt="Node.js Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>

                {/* MongoDB Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/mongodblogo.png.jpeg"
                    alt="MongoDB Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>

                {/* R Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/R_logo-2.svg"
                    alt="R Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex items-center space-x-32 flex-shrink-0">
                {/* React Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/react_logo.png"
                    alt="React Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>

                {/* Node.js Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/nodejs_logo.png"
                    alt="Node.js Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>

                {/* MongoDB Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/mongodblogo.png.jpeg"
                    alt="MongoDB Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>

                {/* R Logo */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="/R_logo-2.svg"
                    alt="R Logo"
                    width={120}
                    height={120}
                    className="object-contain grayscale"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            {/* Brand Section */}
            <div className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src="/logo.png"
                    alt="PELITA Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    PELITA
                  </h3>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Platform pengukuran online kompetensi digital untuk calon pendidik kejuruan TI dengan framework yang sesuai konteks Indonesia serta Integrasi Generalized Deterministic-Input, Noisy 'And' Gate Model.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="w-5 h-5" />
                    <span>inyoman.2020@student.uny.ac.id</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <MapPin className="w-5 h-5" />
                    <span>Yogyakarta, Indonesia</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>


          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-slate-700/50 text-center"
          >
            <div className="text-gray-400 text-sm">
              © 2024 Wiradika, I.N.I., Hadi, S., Khairudin, M.. Semua hak dilindungi.
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-6xl max-h-full">
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
            >
              ✕
            </button>
            
            {/* Fullscreen image */}
            <Image
              src="/framwork.png"
              alt="Framework Asesmen PELITA"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
    <AIChat />
    </>
  );
}