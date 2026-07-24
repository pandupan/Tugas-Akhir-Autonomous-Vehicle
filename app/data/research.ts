/**
 * Sumber data utama untuk konteks dan hasil penelitian di frontend.
 *
 * Angka atau istilah penelitian sebaiknya diubah di file ini terlebih dahulu,
 * bukan langsung di setiap komponen. Dengan begitu landing page dan halaman
 * komparasi tidak menampilkan hasil yang saling berbeda.
 */

export type PipelineKey = 'baseline' | 'sknet' | 'hvi_sknet';

export const thesis = {
  title:
    'Pengembangan Model YOLOv12 dengan Selective Kernel Network dan HVI-CIDNet untuk Deteksi Objek pada Kendaraan Otonom',
  author: 'Pandu Pangestu',
  npm: '227006017',
  institution: 'Informatika · Fakultas Teknik · Universitas Siliwangi',
  year: '2026',
  dataset: {
    name: 'KITTI',
    images: '7.481',
    classes: 8,
    split: '80 : 10 : 10',
    scenarios: 'E1–E6',
  },
} as const;

/**
 * Tiga pipeline ini merangkum model pembanding, model usulan, dan kombinasi
 * low-light yang diuji pada skripsi. HVI-CIDNet adalah preprocessing, bukan
 * detector yang berdiri sendiri.
 */
export const researchPipelines: {
  key: PipelineKey;
  shortName: string;
  title: string;
  role: string;
  flow: string[];
}[] = [
  {
    key: 'baseline',
    shortName: 'Model pembanding',
    title: 'YOLOv12n Baseline',
    role: 'Model dasar tanpa SKNet yang menjadi tolok ukur seluruh peningkatan.',
    flow: ['Citra', 'YOLOv12n', 'Deteksi'],
  },
  {
    key: 'sknet',
    shortName: 'Model usulan',
    title: 'YOLOv12n + SKNet',
    role: 'SKAttention pada neck memilih receptive field secara adaptif untuk variasi skala objek.',
    flow: ['Citra', 'YOLOv12n + SKNet', 'Deteksi'],
  },
  {
    key: 'hvi_sknet',
    shortName: 'Pipeline low-light',
    title: 'HVI-CIDNet → YOLOv12n + SKNet',
    role: 'HVI-CIDNet merestorasi citra low-light sebelum citra diproses oleh model usulan.',
    flow: ['Citra low-light', 'HVI-CIDNet', 'YOLOv12n + SKNet', 'Deteksi'],
  },
];

/** Hasil kondisi normal: E1 (baseline) dibandingkan dengan E3 (SKNet). */
export const normalMetrics = [
  { metric: 'Precision', baseline: 86.62, proposed: 89.19, delta: 2.57 },
  { metric: 'Recall', baseline: 73.02, proposed: 82.04, delta: 9.02 },
  { metric: 'mAP50', baseline: 81.72, proposed: 87.83, delta: 6.11 },
  { metric: 'mAP50–95', baseline: 65.16, proposed: 71.67, delta: 6.51 },
] as const;

/** Hasil low-light: E2 (baseline) dibandingkan dengan E6 (HVI-CIDNet + SKNet). */
export const lowLightMetrics = [
  { metric: 'Precision', baseline: 82.89, proposed: 90.24, delta: 7.35 },
  { metric: 'Recall', baseline: 45.32, proposed: 77.56, delta: 32.24 },
  { metric: 'mAP50', baseline: 65.29, proposed: 85.9, delta: 20.61 },
  { metric: 'mAP50–95', baseline: 48.75, proposed: 68.05, delta: 19.3 },
] as const;

export const kittiClasses = [
  'Car',
  'Van',
  'Truck',
  'Pedestrian',
  'Person sitting',
  'Cyclist',
  'Tram',
  'Misc',
] as const;

export function formatPercent(value: number) {
  return `${value.toFixed(2).replace('.', ',')}%`;
}
