import { Activity, BarChart3, BrainCircuit, Gauge, Moon, Route } from 'lucide-react';
import { formatPercent, lowLightMetrics, normalMetrics } from '../data/research';

// Angka berasal dari sumber data yang sama dengan landing page.
const comparisonGroups = [
  {
    title: 'Kondisi normal · E1 vs E3',
    baselineLabel: 'YOLOv12n',
    proposedLabel: 'YOLOv12n + SKNet',
    metrics: normalMetrics,
  },
  {
    title: 'Kondisi low-light · E2 vs E6',
    baselineLabel: 'Baseline low-light',
    proposedLabel: 'HVI-CIDNet + SKNet',
    metrics: lowLightMetrics,
  },
] as const;

export default function ComparisonPage() {
  return (
    <main className="min-h-screen bg-[#05070c] pt-28 text-slate-100">
      <div className="av-grid fixed inset-0 opacity-60" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            <BarChart3 size={15} />
            Hasil Eksperimen E1–E6
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">Komparasi sesuai hasil akhir skripsi.</h1>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            Kondisi normal mengisolasi kontribusi SKNet, sedangkan kondisi <em>low-light</em> membandingkan baseline dengan kombinasi HVI-CIDNet dan SKNet. Angka di bawah adalah hasil evaluasi dataset test, bukan hasil yang dihitung ulang saat pengguna menjalankan demo video.
          </p>
        </div>

        <div className="mt-10 grid gap-6">
          {comparisonGroups.map((group) => (
            <section key={group.title} className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
              <div className="border-b border-white/10 bg-white/[0.04] px-4 py-4 md:px-6">
                <h2 className="text-lg font-black text-white">{group.title}</h2>
              </div>
              <div className="grid grid-cols-4 border-b border-white/10 bg-white/[0.02] px-4 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400 md:px-6">
                <span>Metrik</span>
                <span>{group.baselineLabel}</span>
                <span>{group.proposedLabel}</span>
                <span>Delta</span>
              </div>
              {group.metrics.map((metric) => (
                <div key={metric.metric} className="grid grid-cols-4 gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 md:px-6">
                  <strong className="text-white">{metric.metric}</strong>
                  <span className="text-slate-300">{formatPercent(metric.baseline)}</span>
                  <span className="font-bold text-cyan-100">{formatPercent(metric.proposed)}</span>
                  <span className="text-emerald-200">+{metric.delta.toFixed(2).replace('.', ',')} poin</span>
                </div>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: BrainCircuit,
              title: 'Variasi skala objek',
              body: 'SKAttention berada pada neck setelah A2C2f di dua jalur top-down untuk menyeleksi receptive field fitur hasil fusi.',
            },
            {
              icon: Moon,
              title: 'Kondisi low-light',
              body: 'HVI-CIDNet ditempatkan sebelum YOLO sebagai preprocessing restorasi pada skenario E5 dan E6.',
            },
            {
              icon: Gauge,
              title: 'Batas penelitian',
              body: 'Evaluasi berfokus pada akurasi dan efisiensi deteksi berbasis kamera, tanpa menilai pengendalian atau navigasi kendaraan.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.title} className="av-panel p-5">
                <Icon className="mb-5 text-cyan-200" size={24} />
                <h2 className="text-xl font-black text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.body}</p>
              </section>
            );
          })}
        </div>

        <section className="av-panel mt-8 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Route className="text-cyan-200" size={24} />
            <h2 className="text-2xl font-black text-white">Pipeline deployment</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {['Frame dari browser', 'FastAPI', 'HVI sesuai mode', 'YOLOv12n/SKNet', 'Bounding box'].map((step, index) => (
              <div key={step} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
                <span className="text-xs font-bold text-cyan-200">0{index + 1}</span>
                <p className="mt-3 text-sm font-bold text-white">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-400">
            <Activity size={16} />
            Demo memproses frame berikutnya setelah respons sebelumnya selesai, sehingga FPS bergantung pada pipeline, perangkat, dan resolusi input.
          </p>
        </section>
      </div>
    </main>
  );
}
