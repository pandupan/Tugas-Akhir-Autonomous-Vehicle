// app/components/HviCidnetSection.tsx
'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { MoonStar, SunMedium, Palette, GitBranch } from 'lucide-react';

// --- KONFIGURASI ANIMASI ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20 }
  },
};

const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20 }
  },
};

export default function HviCidnetSection() {
  return (
    <section id="hvicidnet" className="scroll-mt-32 py-24 bg-white overflow-hidden relative border-t border-slate-100">

      {/* Background Ambient Effects */}
      <div className="absolute top-1/4 right-0 translate-x-1/4 w-125 h-125 bg-cyan-100/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -translate-x-1/4 w-150 h-150 bg-blue-50/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* HEADER SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-sm font-bold w-fit mb-6 shadow-sm">
            <MoonStar size={16} /> Pre-Processing Restorasi Citra
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-6">
            Low-Light Image Enhancement <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
              HVI-CIDNet.
            </span>
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-slate-500 text-lg leading-relaxed">
            HVI-CIDNet digunakan secara kondisional sebagai unit pra-pemrosesan. Pada skenario E5 dan E6, citra simulasi <em>low-light</em> direstorasi terlebih dahulu; hasilnya baru diteruskan ke YOLOv12n atau YOLOv12n + SKNet untuk deteksi.
          </motion.p>
        </motion.div>

        {/* MAIN GRID: 12 Kolom */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">

          {/* KOLOM KIRI (Teks): Mengambil 7 Kolom */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-5 md:grid-cols-3 lg:col-span-12 order-2"
          >
            {/* TAHAP 1: DECOUPLING STRATEGY */}
            <motion.div variants={slideRightVariants} className="group relative bg-slate-50/50 rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors shadow-sm">
                <GitBranch size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Decoupling Strategy</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Transformasi HVI memisahkan representasi warna dan intensitas agar informasi pencahayaan rendah dapat diproses secara lebih terarah sebelum direkonstruksi kembali menjadi citra RGB.
                </p>
              </div>
            </motion.div>

            {/* TAHAP 2: INTENSITY BRANCH */}
            <motion.div variants={slideRightVariants} className="group relative bg-slate-50/50 rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-yellow-100/50 hover:border-yellow-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-400 group-hover:text-white transition-colors shadow-sm">
                <SunMedium size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Intensity Branch</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Cabang intensitas memulihkan informasi pencahayaan dan struktur pada area gelap. Keluaran restorasi ini berfungsi sebagai masukan baru bagi detector, bukan sebagai hasil deteksi.
                </p>
              </div>
            </motion.div>

            {/* TAHAP 3: COLOR BRANCH */}
            <motion.div variants={slideRightVariants} className="group relative bg-slate-50/50 rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-sm">
                <Palette size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Color Branch</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Cabang warna memproses informasi kromatik. Kedua cabang berinteraksi di dalam CIDNet sebelum hasil restorasi dikonversi kembali dan diteruskan ke pipeline YOLO.
                </p>
              </div>
            </motion.div>

          </motion.div>

          {/* KOLOM KANAN (Gambar): Mengambil 5 Kolom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" as const, stiffness: 80 }}
            className="relative perspective-1000 lg:col-span-12 flex flex-col order-1"
          >
            <div className="relative bg-white/60 backdrop-blur-2xl border border-white p-4 rounded-[2.5rem] shadow-2xl shadow-cyan-900/10 z-10 grow flex flex-col">

              <div className="relative w-full aspect-[4/1] min-h-56 bg-slate-900 rounded-[1.8rem] overflow-hidden border border-slate-700/50 flex items-center justify-center group grow">

                {/* Aset ini adalah Gambar 2.13 yang tertanam pada skripsi final. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-0 bg-slate-800 p-6 text-center">
                   <p className="text-sm font-bold text-slate-300">Diagram Pipeline HVI-CIDNet</p>
                </div>

                <Image
                  src="/images/hvi-cidnet-architecture.png"
                  alt="Arsitektur HVI-CIDNet pada Gambar 2.13"
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-contain p-4 z-10 bg-white hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Floating Badge Label */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 backdrop-blur-md px-6 py-2.5 rounded-full shadow-xl border border-slate-700 flex items-center gap-2.5 w-max z-20">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-black text-white tracking-wider">GAMBAR 2.13 · ARSITEKTUR HVI-CIDNET</span>
              </div>
            </div>

            {/* Efek Glow di Belakang Visual */}
            <div className="absolute inset-0 bg-linear-to-bl from-cyan-400 to-blue-300 rounded-[3rem] blur-2xl opacity-20 -z-10 translate-y-4 translate-x-2"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
