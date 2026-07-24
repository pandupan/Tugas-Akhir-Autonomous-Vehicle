// app/components/Architecture.tsx
'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { BrainCircuit, Cpu, Layers, Moon, Network } from 'lucide-react';
import { formatPercent, lowLightMetrics, normalMetrics } from '../data/research';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.16 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 18 },
  },
};

const architecturePoints = [
  {
    icon: Layers,
    title: 'Dataset dan Enam Skenario',
    body: 'Sebanyak 7.481 citra KITTI dibagi 80:10:10 dan dievaluasi melalui E1–E6 pada kondisi normal, low-light, dan hasil restorasi.',
  },
  {
    icon: BrainCircuit,
    title: 'SKAttention pada Neck',
    body: 'SKNet ditempatkan setelah A2C2f pada jalur top-down T4 dan T3 untuk memilih receptive field sebelum detection head.',
  },
  {
    icon: Moon,
    title: 'HVI-CIDNet untuk Low-Light',
    body: 'HVI-CIDNet merestorasi citra pada E5 dan E6 sebelum detector dijalankan; modul ini merupakan preprocessing, bukan detector ketiga.',
  },
];

const resultGroups = [
  {
    title: 'Kondisi normal · E1 vs E3',
    description: 'YOLOv12n baseline dibandingkan dengan YOLOv12n + SKNet.',
    baselineLabel: 'Baseline',
    proposedLabel: 'SKNet',
    metrics: normalMetrics,
  },
  {
    title: 'Kondisi low-light · E2 vs E6',
    description: 'Baseline low-light dibandingkan dengan kombinasi HVI-CIDNet + SKNet.',
    baselineLabel: 'Baseline low-light',
    proposedLabel: 'HVI + SKNet',
    metrics: lowLightMetrics,
  },
] as const;

export default function Architecture() {
  return (
    <section id="architecture" className="relative scroll-mt-32 overflow-hidden border-t border-slate-100 bg-white py-24">
      <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 rounded-full bg-blue-50 blur-[110px]" />
      <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 rounded-full bg-cyan-50 blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"
        >
          <div>
            <motion.div variants={itemVariants} className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 shadow-sm">
              <Network size={16} />
              Arsitektur Usulan
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-5xl">
              Arsitektur dan hasil mengikuti enam skenario skripsi.
            </motion.h2>
          </div>
          <motion.p variants={itemVariants} className="text-base font-medium leading-8 text-slate-500 md:text-lg">
            YOLOv12n menjadi baseline, SKNet memodifikasi <em>neck</em> untuk adaptasi skala objek, dan HVI-CIDNet merestorasi citra <em>low-light</em> sebelum deteksi. Evaluasi difokuskan pada akurasi dan efisiensi model, bukan pengendalian atau navigasi kendaraan.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring' as const, stiffness: 90, damping: 18 }}
            className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-200/60"
          >
            <div className="mb-4 flex items-center justify-between gap-3 px-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Gambar 4.1</p>
                <h3 className="mt-1 text-xl font-black text-slate-800">Arsitektur Umum Usulan</h3>
              </div>
              <Cpu className="text-blue-500" size={24} />
            </div>
            <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
              <Image
                src="/images/architecture-general-proposed.png"
                alt="Arsitektur umum usulan model deteksi objek"
                width={1200}
                height={820}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </motion.article>

          <div className="grid gap-6">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring' as const, stiffness: 90, damping: 18, delay: 0.08 }}
              className="rounded-[2rem] border border-slate-100 bg-slate-950 p-4 shadow-2xl shadow-slate-300/50"
            >
              <div className="mb-4 flex items-center justify-between gap-3 px-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Gambar 4.4 (b)</p>
                  <h3 className="mt-1 text-xl font-black text-white">Arsitektur Model Usulan</h3>
                </div>
                <BrainCircuit className="text-cyan-300" size={24} />
              </div>
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-white">
                <Image
                  src="/images/architecture-yolov12-sknet-final.png"
                  alt="Arsitektur model usulan YOLOv12n dengan SKNet pada neck"
                  width={1000}
                  height={760}
                  className="h-auto w-full object-contain p-3"
                />
              </div>
            </motion.article>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid gap-3"
            >
              {architecturePoints.map((point) => {
                const Icon = point.icon;
                return (
                  <motion.div key={point.title} variants={itemVariants} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-800">{point.title}</h4>
                      <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{point.body}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Ringkasan ini memakai sumber angka yang sama dengan halaman /comparison. */}
        <div id="hasil" className="-mt-18 grid scroll-mt-32 gap-6 pt-32 lg:grid-cols-2">
          {resultGroups.map((group) => (
            <motion.article
              key={group.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring' as const, stiffness: 90, damping: 18 }}
              className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50"
            >
              <div className="border-b border-slate-100 bg-slate-50/70 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Hasil Pengujian</p>
                <h3 className="mt-2 text-2xl font-black text-slate-800">{group.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{group.description}</p>
              </div>
              <div className="divide-y divide-slate-100 px-6">
                {group.metrics.map((metric) => (
                  <div key={metric.metric} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4 text-sm">
                    <strong className="text-slate-700">{metric.metric}</strong>
                    <span className="text-right text-slate-400">
                      <span className="block text-[10px] font-black uppercase tracking-wide">{group.baselineLabel}</span>
                      {formatPercent(metric.baseline)}
                    </span>
                    <span className="min-w-24 text-right font-black text-blue-600">
                      <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">{group.proposedLabel}</span>
                      {formatPercent(metric.proposed)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
