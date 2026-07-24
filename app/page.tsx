import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import AboutUs from "./components/AboutUs";
import Architecture from "./components/Architecture";
import Hero from "./components/Hero";
import HviCidnetSection from "./components/HVICIDNet";
import SKNetSection from "./components/SKNet";
import Yolo12Section from "./components/Yolo12Section";

export default function Home() {
  return (
    <>
      {/* Urutan beranda mengikuti alur penjelasan saat presentasi skripsi. */}
      <Hero />
      <Yolo12Section />
      <SKNetSection />
      <HviCidnetSection />
      <Architecture />
      <AboutUs />
      <DetectionGate />
    </>
  );
}

function DetectionGate() {
  return (
    <section id="mulai-deteksi" className="relative scroll-mt-32 overflow-hidden border-t border-slate-100 bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-blue-100 bg-linear-to-br from-blue-50 via-white to-cyan-50 p-8 text-center shadow-2xl shadow-blue-100/60 md:p-12">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30">
          <PlayCircle size={26} className="fill-current" />
        </div>
        <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue-600">Realtime Demo</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
          Masuk ke halaman deteksi setelah memahami konteks model.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500">
          Demo mempertahankan pilihan baseline, SKNet, dan HVI untuk memperlihatkan alur inferensi. Overlay jarak, batas jalan, stir, dan garis objek adalah visualisasi tambahan aplikasi, bukan variabel yang dinilai pada skripsi.
        </p>
        <Link
          href="/demo"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-1 hover:bg-blue-700"
        >
          Buka Halaman Deteksi
          <ArrowRight size={19} />
        </Link>
      </div>
    </section>
  );
}
