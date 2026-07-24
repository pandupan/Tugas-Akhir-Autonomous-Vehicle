// app/components/Yolo12Section.tsx
'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit, Focus, Layers, Zap, Crosshair } from 'lucide-react';

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

export default function Yolo12Section() {
  return (
    <section id="yolov12" className="scroll-mt-32 py-24 bg-white overflow-hidden relative border-t border-slate-100">

      {/* Background Ambient Effects */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-150 h-150 bg-purple-50/60 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-125 h-125 bg-blue-50/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* HEADER SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-bold w-fit mb-6 shadow-sm">
            <BrainCircuit size={16} /> Attention-Centric Detector
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-6">
            Model Dasar Penelitian <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-500">
              YOLOv12 Nano (YOLOv12n).
            </span>
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-slate-500 text-lg leading-relaxed">
            Varian Nano dipilih sebagai model pembanding karena merupakan varian paling ringan. Arsitektur ini kemudian dimodifikasi pada bagian <em>neck</em> tanpa mengubah fungsi <em>detection head</em> yang menghasilkan kelas, <em>bounding box</em>, dan <em>confidence score</em>.
          </motion.p>
        </motion.div>

        {/* MAIN GRID: 12 Kolom */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">

          {/* KOLOM KIRI (Gambar): Mengambil 5 Kolom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" as const, stiffness: 80 }}
            className="relative perspective-1000 lg:col-span-5 flex flex-col"
          >
            <div className="relative bg-white/60 backdrop-blur-2xl border border-white p-4 rounded-[2.5rem] shadow-2xl shadow-purple-900/10 z-10 grow flex flex-col">

              <div className="relative w-full aspect-square bg-slate-900 rounded-[1.8rem] overflow-hidden border border-slate-700/50 flex items-center justify-center group grow">

                {/* Diagram baseline merupakan panel (a) pada Gambar 4.4 skripsi final. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-0 bg-slate-800 p-6 text-center">
                   <Crosshair size={48} className="mb-4 opacity-30 text-purple-400" />
                   <p className="text-sm font-bold text-slate-300">Arsitektur YOLOv12n</p>
                </div>

                <Image
                  src="/images/architecture-yolov12-baseline.png"
                  alt="Arsitektur YOLOv12n baseline pada panel a Gambar 4.4"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain p-5 z-10 hover:scale-105 transition-transform duration-500 bg-white"
                />

              </div>

              {/* Floating Badge Label */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-slate-100 flex items-center gap-2.5 w-max z-20">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-black text-slate-700 tracking-wider">GAMBAR 4.4 (A) · BASELINE</span>
              </div>
            </div>

            {/* Efek Glow di Belakang Visual */}
            <div className="absolute inset-0 bg-linear-to-bl from-purple-400 to-blue-300 rounded-[3rem] blur-2xl opacity-20 -z-10 translate-y-4 -translate-x-2"></div>
          </motion.div>

          {/* KOLOM KANAN (Teks Deskripsi Fitur YOLO12): Mengambil 7 Kolom */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col justify-center gap-5 lg:col-span-7"
          >
            {/* FITUR 1: AREA ATTENTION */}
            <motion.div variants={slideRightVariants} className="group relative bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-100/50 hover:border-purple-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                <Focus size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Area Attention (A2)</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Mekanisme atensi pada YOLOv12 membagi fitur ke beberapa wilayah agar konteks visual dapat diproses lebih efisien. Bagian ini merupakan fitur bawaan model baseline, bukan kontribusi SKNet.
                </p>
              </div>
            </motion.div>

            {/* FITUR 2: R-ELAN */}
            <motion.div variants={slideRightVariants} className="group relative bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <Layers size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">R-ELAN Architecture</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  R-ELAN dan blok A2C2f membantu aliran serta agregasi fitur pada YOLOv12. Pada model usulan, keluaran A2C2f di jalur <em>top-down neck</em> menjadi masukan SKAttention.
                </p>
              </div>
            </motion.div>

            {/* FITUR 3: NANO VARIANT OPTIMIZATION */}
            <motion.div variants={slideRightVariants} className="group relative bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <Zap size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Lightweight Nano (YOLOv12n)</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Varian Nano digunakan secara konsisten pada baseline dan model usulan agar perbandingan pengaruh SKNet tetap adil dengan konfigurasi pelatihan yang sama.
                </p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
