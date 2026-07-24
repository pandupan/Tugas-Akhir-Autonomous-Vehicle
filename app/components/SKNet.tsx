// app/components/SKNetSection.tsx
'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { SplitSquareHorizontal, Combine, MousePointerClick, Target } from 'lucide-react';

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

const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20 }
  },
};

export default function SKNetSection() {
  return (
    <section id="sknet" className="scroll-mt-32 py-24 bg-slate-50 overflow-hidden relative border-t border-slate-100">

      {/* Background Ambient Effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-125 h-125 bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-150 h-150 bg-blue-50/60 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* HEADER SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold w-fit mb-6 shadow-sm">
            <Target size={16} /> Dynamic Receptive Field
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-6">
            Mekanisme Atensi Adaptif <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-blue-500">
              Selective Kernel Network (SKNet).
            </span>
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-slate-500 text-lg leading-relaxed">
            Arsitektur konvolusi standar memiliki bidang pandang (<em>receptive field</em>) yang tetap. Pada model usulan, SKAttention ditempatkan pada <em>neck</em> YOLOv12n setelah blok A2C2f di dua jalur <em>top-down</em>, sehingga fitur hasil fusi multi-skala dapat diseleksi sebelum masuk ke agregasi lanjutan dan <em>detection head</em>.
          </motion.p>
        </motion.div>

        {/* MAIN GRID: 12 Kolom untuk proporsi yang lebih baik */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">

          {/* KOLOM KIRI (Gambar): Mengambil 5 Kolom agar lebih tinggi dan seimbang */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" as const, stiffness: 80 }}
            className="relative perspective-1000 lg:col-span-12 flex flex-col"
          >
            {/* Card dibuat h-full agar tingginya mengikuti kolom teks di sebelahnya */}
            <div className="relative bg-white/60 backdrop-blur-2xl border border-white p-4 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 z-10 grow flex flex-col">

              <div className="relative w-full aspect-[4/1] min-h-56 bg-white rounded-[1.8rem] overflow-hidden border border-slate-200 flex items-center justify-center group grow">
                <Image
                  src="/images/sknet-architecture.png"
                  alt="Arsitektur Selective Kernel Network pada Gambar 2.9"
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* Floating Badge Label dipindah ke dalam agar lebih rapi */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-slate-100 flex items-center gap-2.5 w-max z-20">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-black text-slate-700 tracking-wider">GAMBAR 2.9 · SPLIT, FUSE &amp; SELECT</span>
              </div>
            </div>

            {/* Efek Glow di Belakang Visual */}
            <div className="absolute inset-0 bg-linear-to-bl from-indigo-400 to-blue-300 rounded-[3rem] blur-2xl opacity-20 -z-10 translate-y-4 -translate-x-2"></div>
          </motion.div>

          {/* KOLOM KANAN (Teks): Mengambil 7 Kolom agar teks lebih lebar dan tidak terlalu menumpuk tinggi */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-5 md:grid-cols-3 lg:col-span-12"
          >
            {/* TAHAP 1: SPLIT */}
            <motion.div variants={slideLeftVariants} className="group relative bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <SplitSquareHorizontal size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Split <span className="text-slate-400 text-base font-medium">(Pemisahan)</span></h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  <em>Feature map</em> diproses oleh dua lintasan: konvolusi 3×3 biasa dan konvolusi 3×3 dengan dilasi 2. Keduanya memberi <em>receptive field</em> berbeda tanpa mengubah ukuran spasial fitur.
                </p>
              </div>
            </motion.div>

            {/* TAHAP 2: FUSE */}
            <motion.div variants={slideLeftVariants} className="group relative bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <Combine size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Fuse <span className="text-slate-400 text-base font-medium">(Penggabungan)</span></h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Informasi lintasan digabungkan melalui <em>element-wise summation</em>. Operasi <em>Global Average Pooling</em> kemudian diterapkan guna memadatkan informasi menjadi vektor statistik khusus saluran.
                </p>
              </div>
            </motion.div>

            {/* TAHAP 3: SELECT */}
            <motion.div variants={slideLeftVariants} className="group relative bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-sm">
                <MousePointerClick size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Select <span className="text-slate-400 text-base font-medium">(Pemilihan)</span></h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  <em>Softmax</em> menghitung bobot kontribusi kedua lintasan. Fitur terpilih kemudian ditambahkan secara residual ke input melalui <code>x + alpha × selected</code>, dengan nilai <code>alpha</code> yang dipelajari saat pelatihan.
                </p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
