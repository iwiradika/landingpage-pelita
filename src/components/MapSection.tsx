"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';
import Image from "next/image";

// Declare maplibre-gl types locally for this component
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

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Initialize MapLibre GL JS map with better error handling
    const initializeMap = () => {
      if (!mapRef.current) {
        return;
      }

      if (typeof window === 'undefined') {
        return;
      }

      if (!window.maplibregl) {
        // Retry if library not loaded yet
        setTimeout(initializeMap, 1000);
        return;
      }

      try {
        const map = new window.maplibregl.Map({
          container: mapRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [115.0921, -8.1197], // Singaraja coordinates
          zoom: 6,
          pitch: 45,
          bearing: 0
        });

        map.on('load', () => {
          setIsMapLoaded(true);
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
        }, 1000);

        return () => {
          map.remove();
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsMapLoaded(true); // Show container even with error
      }
    };

    // Initialize only when in view or after a delay to save initial resources
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        initializeMap();
        observer.disconnect();
      }
    });

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
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
  );
}
