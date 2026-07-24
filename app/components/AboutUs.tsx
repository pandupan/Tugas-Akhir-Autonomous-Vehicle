// app/components/AboutUs.tsx
'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Award, BookOpen, Copy, GraduationCap, Instagram, Mail } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface ProfileData {
  role: string;
  name: string;
  id: string;
  expertise?: string;
  instagram?: string;
  email: string;
  image: string;
  icon: ReactNode;
}

const teamMembers: ProfileData[] = [
  {
    role: 'Penulis / Peneliti',
    name: 'Pandu Pangestu',
    id: 'NPM. 227006017',
    instagram: 'https://www.instagram.com/pandupan__/',
    email: '227006017@student.unsil.ac.id',
    image: '/images/foto-pandu.jpeg',
    icon: <BookOpen size={18} className="text-blue-500" />,
  },
  {
    role: 'Dosen Pembimbing I',
    name: 'Dr. Ir. Aradea, S.T., M.T.',
    id: 'NIDN. 0424097601',
    expertise: 'Artificial Intelligence, Self-Adaptive Systems, Software Engineering',
    instagram: 'https://www.instagram.com/aradea_dipalokaswara/',
    email: 'aradea@unsil.ac.id',
    image: '/images/foto-ara.jpg',
    icon: <GraduationCap size={18} className="text-indigo-500" />,
  },
  {
    role: 'Dosen Pembimbing II',
    name: 'Vega Purwayoga, S.Kom., M.Kom.',
    id: 'NIDN. 0407039501',
    expertise: 'Skyline Query, Data Mining, Machine Learning',
    instagram: 'https://www.instagram.com/37vega_purwayoga/',
    email: 'vega@unsil.ac.id',
    image: '/images/foto-vega.jpg',
    icon: <GraduationCap size={18} className="text-indigo-500" />,
  },
  {
    role: 'Dosen Penguji I',
    name: 'Ir. Rianto, S.T., M.T.',
    id: 'NIDN. 0424128401',
    expertise: 'Database, Software Engineering, Data Engineering',
    email: 'rianto@unsil.ac.id',
    image: '/images/foto-pa-rianto.png',
    icon: <Award size={18} className="text-cyan-500" />,
  },
  {
    role: 'Dosen Penguji II',
    name: 'Irani Hoeronis, S.Si., M.T., CRP., CIISA.',
    id: 'NIDN. 0019028504',
    expertise: 'Artificial Intelligence, Machine Learning, Graph Neural Network',
    email: 'iranihoeronis@unsil.ac.id',
    image: '/images/foto-bu-irani.png',
    icon: <Award size={18} className="text-cyan-500" />,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 16 },
  },
};

function ProfileCard({ data }: { data: ProfileData }) {
  const [copied, setCopied] = useState(false);

  return (
    <motion.article
      variants={cardVariants}
      className="group relative flex min-h-[370px] w-full max-w-85 flex-col overflow-visible rounded-3xl border border-slate-100 bg-white/80 p-7 text-center shadow-md shadow-slate-100/80 backdrop-blur-xl transition-all duration-500 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
    >
      <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-slate-100 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
        {data.icon} {data.role}
      </div>

      <div className="relative mx-auto mt-5 h-28 w-28">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 transition-colors duration-500 group-hover:border-blue-400" />
        <div className="absolute inset-2 overflow-hidden rounded-full bg-slate-100">
          <Image src={data.image} alt={data.name} fill sizes="112px" className="object-cover" />
        </div>
      </div>

      <h3 className="mt-6 text-lg font-extrabold text-slate-800 transition-colors duration-300 group-hover:text-blue-600 md:text-xl">
        {data.name}
      </h3>
      <div className="mx-auto mt-3 w-fit rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600 transition-colors duration-300 group-hover:bg-blue-50 group-hover:text-blue-700">
        {data.id}
      </div>
      <p className="mx-auto mt-4 min-h-12 max-w-60 text-xs font-medium leading-relaxed text-slate-500">
        {data.expertise || 'Mahasiswa Tingkat Akhir Informatika Universitas Siliwangi'}
      </p>

      <div className="mt-auto flex items-center justify-center gap-3 pt-5">
        {data.instagram && (
          <a
            href={data.instagram}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition-all duration-300 hover:bg-linear-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 hover:text-white"
            aria-label={`${data.name} on Instagram`}
          >
            <Instagram size={18} />
          </a>
        )}
        <a href={`mailto:${data.email}`} className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors duration-300 hover:bg-blue-600 hover:text-white" aria-label={`Email ${data.name}`}>
          <Mail size={18} />
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(data.email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
          className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors duration-300 hover:bg-emerald-500 hover:text-white"
          aria-label={`Copy email ${data.name}`}
        >
          <Copy size={18} />
        </button>
        {copied && <span className="text-xs font-bold text-emerald-600">Disalin</span>}
      </div>
    </motion.article>
  );
}

export default function AboutUs() {
  return (
    <section id="about" className="relative scroll-mt-32 overflow-hidden border-t border-slate-100 bg-slate-50 py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="relative mb-24 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl font-black tracking-tight text-slate-800 md:text-5xl"
          >
            Tim <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Penelitian</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg font-medium text-slate-500"
          >
            Struktur akademik pengembangan, pembimbingan, dan pengujian tugas akhir sistem persepsi kendaraan otonom.
          </motion.p>
          <div className="absolute -bottom-10 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-blue-200" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-16"
        >
          {teamMembers.map((member) => (
            <ProfileCard key={member.name} data={member} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
