'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Play, MoonStar, ScanLine } from 'lucide-react';
import { thesis } from '../data/research';

const Hero = () => {
  return (
    <div className="w-full">
      <main className="min-h-screen bg-white flex flex-col items-center">


      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16">

        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] max-w-125 max-h-125 rounded-full bg-blue-100/60 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] max-w-100 max-h-100 rounded-full bg-cyan-100/50 blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto px-6 z-10 grid lg:grid-cols-2 gap-12 items-center">


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col text-center lg:text-left"
          >
            <div className="inline-flex items-center mx-auto lg:mx-0 gap-2 px-4 py-2 rounded-full bg-indigo-50 text-blue-600 text-xs md:text-sm font-bold w-fit mb-6 shadow-xl shadow-blue-900/10">
              <Zap size={14} className="text-cyan-400" />
              Tugas Akhir · {thesis.author} · {thesis.year}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] font-black text-slate-800 tracking-tight leading-[1.1] mb-6">
              Pengembangan YOLOv12 <br />

              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-400">
                dengan SKNet &amp; <span className="whitespace-nowrap">HVI-CIDNet.</span>
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              Model dikembangkan untuk <strong>deteksi objek pada kendaraan otonom</strong>: SKNet ditempatkan pada <em>neck</em> YOLOv12n untuk variasi skala objek, sedangkan HVI-CIDNet menjadi pra-pemrosesan restorasi citra <em>low-light</em>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/#mulai-deteksi"
                className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center hover:bg-blue-700 hover:-translate-y-1 transition-all"
              >
                <Play size={18} className="mr-2 fill-white" /> Scroll ke Deteksi
              </Link>
              <Link
                href="/#architecture"
                className="px-8 py-4 rounded-full border-2 border-slate-200 text-slate-700 font-bold text-lg hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center group"
              >
                Lihat Arsitektur <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/40 backdrop-blur-2xl border border-white/80 p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50">
              <div className="relative aspect-video bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-700/50">


                <video
                  src="https://ultralytics.com/assets/kitti-inference-vid.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 mix-blend-screen"
                >
                  <track kind="captions" srcLang="id" label="Indonesia" />
                </video>


                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-white text-[10px] md:text-xs font-mono font-bold tracking-wider">DATASET KITTI · 8 KELAS OBJEK</span>
                </div>


                <div className="absolute bottom-4 right-4 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-md">
                   <span className="text-white text-[10px] font-bold tracking-widest">7.481 CITRA</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="grid md:grid-cols-3 gap-10 text-center md:text-left">

          <div className="group flex flex-col items-center md:items-start p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-blue-100 transition-all">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors shadow-md">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-3">YOLOv12n Baseline</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Model dasar tanpa SKNet digunakan sebagai pembanding untuk mengukur kontribusi setiap komponen pada enam skenario eksperimen E1–E6.
            </p>
          </div>

          <div className="group flex flex-col items-center md:items-start p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-indigo-100 transition-all">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-md">
              <ScanLine size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-3">YOLOv12n + SKNet</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              SKAttention ditempatkan setelah A2C2f pada dua jalur <em>top-down neck</em>, sehingga fitur dapat memilih <em>receptive field</em> yang sesuai dengan skala objek.
            </p>
          </div>

          <div className="group flex flex-col items-center md:items-start p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-cyan-100 transition-all">
            <div className="w-14 h-14 bg-cyan-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-md">
              <MoonStar size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-3">HVI-CIDNet → Model Usulan</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pada pipeline <em>low-light</em>, citra direstorasi HVI-CIDNet terlebih dahulu lalu diteruskan ke YOLOv12n + SKNet untuk proses deteksi.
            </p>
          </div>

        </div>
      </section>

      </main>
    </div>
  )
}

export default Hero;
