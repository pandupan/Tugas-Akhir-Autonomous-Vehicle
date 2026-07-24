// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cpu, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/#yolov12', label: 'YOLOv12' },
  { href: '/#sknet', label: 'SKNet' },
  { href: '/#hvicidnet', label: 'HVI-CIDNet' },
  { href: '/#hasil', label: 'Hasil' },
  { href: '/#about', label: 'Tim' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed left-0 right-0 top-6 z-50 mx-auto w-[92%] max-w-6xl"
      >
        <div className="relative flex items-center justify-between rounded-full border border-white/40 bg-white/70 px-5 py-3 shadow-[0_8px_32px_0_rgba(14,165,233,0.1)] backdrop-blur-xl transition-all md:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-800 transition-opacity hover:opacity-80 md:text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-blue-500 to-cyan-300 text-white shadow-md shadow-blue-500/20">
              <Cpu size={18} />
            </div>
            <span className="hidden font-black text-blue-500 sm:block">AutoVision</span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-slate-200/50 bg-slate-100/50 p-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#mulai-deteksi"
              className="hidden items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-600 active:scale-95 md:flex"
            >
              Ke Deteksi <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 md:hidden"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-x-4 top-24 z-40 rounded-3xl border border-white bg-white/95 p-6 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 text-lg font-semibold text-slate-700 hover:text-blue-500"
                >
                  {link.label}
                  <ArrowRight size={16} className="text-slate-300" />
                </Link>
              ))}
              <Link
                href="/#mulai-deteksi"
                onClick={() => setIsOpen(false)}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-500 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
              >
                Scroll ke halaman deteksi
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
