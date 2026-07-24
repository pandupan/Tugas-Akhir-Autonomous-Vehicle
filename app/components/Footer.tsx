// app/components/Footer.tsx
'use client';

import Link from 'next/link';
import { ArrowUp, ChevronRight, Cpu, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-slate-100 bg-white px-6 pb-8 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-tr from-blue-500 to-cyan-300 text-white shadow-lg shadow-blue-500/20">
                <Cpu size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-blue-500">AutoVision</span>
            </Link>

            <p className="mb-6 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
              Tugas akhir pengembangan YOLOv12n dengan SKNet pada <em>neck</em> untuk variasi skala objek dan HVI-CIDNet sebagai pra-pemrosesan citra <em>low-light</em>.
            </p>

            <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:flex-wrap">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" />
                Universitas Siliwangi, Tasikmalaya
              </span>
              <a href="mailto:227006017@student.unsil.ac.id" className="flex items-center gap-2 hover:text-blue-600">
                <Mail size={16} className="text-blue-400" />
                Email Peneliti
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="mb-5 font-bold text-slate-800">Navigasi</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-500">
              {[
                ['Beranda', '/'],
                ['YOLOv12', '/#yolov12'],
                ['SKNet', '/#sknet'],
                ['HVI-CIDNet', '/#hvicidnet'],
                ['Hasil Pengujian', '/#hasil'],
                ['Tim Penelitian', '/#about'],
                ['Masuk Deteksi', '/#mulai-deteksi'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-2 transition-colors hover:text-blue-600">
                    <ChevronRight size={14} className="text-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 font-bold text-slate-800">Teknologi Utama</h4>
            <div className="flex flex-wrap gap-2">
              {['YOLOv12n', 'SKNet', 'HVI-CIDNet', 'FastAPI', 'Next.js', 'OpenCV'].map((tech) => (
                <span key={tech} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-6 text-sm font-medium text-slate-500 md:flex-row">
          <div className="text-center md:text-left">
            <p>&copy; {currentYear} Universitas Siliwangi. Hak cipta dilindungi.</p>
            <p className="mt-1 text-xs text-slate-400">Dikembangkan oleh Pandu Pangestu untuk penelitian tugas akhir Informatika.</p>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-5 py-2.5 font-semibold text-slate-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <span>Kembali ke atas</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
