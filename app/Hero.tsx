// app/page.tsx
'use client';

/**
 * Komponen legacy dari prototipe awal dan tidak dirender oleh app/page.tsx.
 * Hero landing page yang aktif berada di app/components/Hero.tsx.
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Play, ShieldCheck, Sun } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center">

      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Background Ambient Effects */}
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] max-w-125 max-h-125 rounded-full bg-blue-100/60 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] max-w-100 max-h-100 rounded-full bg-cyan-100/50 blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto px-6 z-10 grid lg:grid-cols-2 gap-12 items-center">

          {/* Kolom Teks Kiri */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col text-center lg:text-left"
          >
            <div className="inline-flex items-center mx-auto lg:mx-0 gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-xs md:text-sm font-bold w-fit mb-6">
              <Zap size={14} className="text-blue-500" />
              Powered by YOLOv12s & Image Enhancement
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-slate-800 tracking-tight leading-[1.1] mb-6">
              Sistem Persepsi <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-400">
                Kendaraan Otonom.
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Visualisasi real-time performa model deteksi objek untuk jalan raya. Mengadaptasi kondisi lingkungan yang kompleks demi keamanan berkendara yang lebih baik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/demo"
                className="px-8 py-4 rounded-full bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-blue-600 hover:-translate-y-1 transition-all"
              >
                <Play size={18} className="mr-2 fill-white" /> Coba Live Demo
              </Link>
              <Link
                href="/comparison"
                className="px-8 py-4 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-lg hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center"
              >
                Lihat Komparasi <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Kolom Visual Kanan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/40 backdrop-blur-2xl border border-white/80 p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-blue-900/10">
              <div className="relative aspect-video bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-700/50">
                {/* Source video dari KITTI */}
                <video
                  src="https://ultralytics.com/assets/kitti-inference-vid.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 mix-blend-screen"
                />
                {/* Overlay Simulasi */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-white text-xs font-mono font-bold tracking-wider">YOLOv12s INFERENCE</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- QUICK FEATURES SECTION --- */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="grid md:grid-cols-3 gap-10 text-center md:text-left">

          <div className="flex flex-col items-center md:items-start p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Model YOLOv12s</h3>
            <p className="text-slate-500">Menggunakan varian <em>small</em> dari YOLOv12 untuk mencapai keseimbangan optimal antara kecepatan komputasi dan akurasi tinggi.</p>
          </div>

          <div className="flex flex-col items-center md:items-start p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
              <Sun size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Image Enhancement</h3>
            <p className="text-slate-500">Mekanisme prapemrosesan visual untuk meningkatkan ketajaman gambar pada kondisi pencahayaan jalan raya yang menantang.</p>
          </div>

          <div className="flex flex-col items-center md:items-start p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Adaptabilitas Tinggi</h3>
            <p className="text-slate-500">Telah dievaluasi menggunakan standard dataset untuk memastikan deteksi kendaraan, pejalan kaki, dan rambu yang presisi.</p>
          </div>

        </div>
      </section>

    </main>
  );
}
