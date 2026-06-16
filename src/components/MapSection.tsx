"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';

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
    const initializeMap = () => {
      if (!mapRef.current || typeof window === 'undefined') return;

      if (!window.maplibregl) {
        setTimeout(initializeMap, 1000);
        return;
      }

      try {
        const map = new window.maplibregl.Map({
          container: mapRef.current,
          style: 'https://demotiles.maplibre.org/style.json',
          center: [115.0921, -8.1197],
          zoom: 6,
          pitch: 45,
          bearing: 0,
        });

        map.on('load', () => setIsMapLoaded(true));
        map.on('error', () => setIsMapLoaded(true));

        const marker = new window.maplibregl.Marker({ color: '#7C3AED', scale: 1.2 })
          .setLngLat([115.0921, -8.1197])
          .setPopup(
            new window.maplibregl.Popup({ offset: 25 }).setHTML(
              '<div style="color:#111;font-weight:700;margin-bottom:4px;">Universitas Pendidikan Ganesha</div>' +
              '<div style="color:#555;font-size:12px;">Singaraja, Buleleng, Bali</div>' +
              '<div style="color:#7C3AED;font-size:12px;margin-top:4px;">PELITA Research Site</div>'
            )
          )
          .addTo(map);

        map.addControl(new window.maplibregl.NavigationControl(), 'top-right');
        map.addControl(new window.maplibregl.ScaleControl(), 'bottom-left');

        setTimeout(() => marker.getPopup().addTo(map), 1000);

        return () => map.remove();
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsMapLoaded(true);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        initializeMap();
        observer.disconnect();
      }
    });

    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="location" className="py-24 relative z-10 section-d">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="pill-badge mb-4 mx-auto w-fit">Location</div>
          <h3 className="text-4xl font-bold text-white mb-4">Prototype Implementation Site</h3>
          <div className="accent-line mx-auto mb-4" />
          <p className="text-slate-400">
            Universitas Pendidikan Ganesha — Bali, Indonesia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Map */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <div className="glass-card glass-card-hover p-5">
              <div className="rounded-xl overflow-hidden relative" style={{ minHeight: '380px' }}>
                <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: '380px' }} />
                {!isMapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl"
                    style={{ background: 'rgba(15,23,42,0.8)' }}>
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Loading map…</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-3 text-right">
                Powered by{' '}
                <a href="https://maplibre.org" target="_blank" rel="noopener noreferrer"
                  className="hover:text-slate-400 transition-colors">MapLibre</a>
              </p>
            </div>
          </motion.div>

          {/* Info panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-5">

            <div className="glass-card p-6">
              <h4 className="text-xl font-bold text-white mb-3">
                Universitas Pendidikan Ganesha
              </h4>
              <div className="accent-line mb-4" />
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Universitas Pendidikan Ganesha (Undiksha) is a public university located in Singaraja, Bali. As a leading institution in teacher education, Undiksha serves as the strategic implementation site for the PELITA prototype system.
              </p>
              <div className="space-y-3">
                {[
                  { dot: "#7C3AED", text: "Faculty of Engineering & Vocational Education" },
                  { dot: "#0D9488", text: "Informatics Engineering Education Program" },
                  { dot: "#0891B2", text: "Prospective Vocational IT Educators" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                    <span className="text-slate-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "Singaraja", label: "City, Bali", color: "#7C3AED" },
                { value: "Indonesia", label: "Country", color: "#0D9488" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <div className="text-lg font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
