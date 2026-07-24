'use client';

import {
  AlertTriangle,
  BrainCircuit,
  Camera,
  CheckCircle2,
  CircleGauge,
  Gauge,
  Loader2,
  Moon,
  Pause,
  Play,
  Radar,
  Server,
  UploadCloud,
  Video,
  Wand2,
  X,
} from 'lucide-react';
import { type ComponentType, useEffect, useRef, useState } from 'react';

type HealthResponse = {
  status: string;
  models?: Record<string, { exists: boolean; path: string }>;
  hvi_repo_exists?: boolean;
  storage?: string;
  class_names?: Record<string, string>;
  demo_video_url?: string;
};

type Detection = {
  class_id: number;
  class_name: string;
  confidence: number;
  box: number[];
  distance_m?: number;
};

type FrameResponse = {
  annotated_image: string;
  detections: Detection[];
  detections_total: number;
  class_counts: Record<string, number>;
  latency_ms: number;
  model_key: string;
  hvi_mode: 'off' | 'auto' | 'on';
  hvi_applied: boolean;
  brightness: number;
  distance_enabled: boolean;
  lane_enabled: boolean;
  lane_count: number;
  steering_enabled: boolean;
  steering_angle: number | null;
  center_line_enabled: boolean;
};

type SourceKind = 'empty' | 'file' | 'demo';
type ModelKey = 'baseline' | 'sknet';
type HviMode = 'off' | 'auto' | 'on';
type IconType = ComponentType<{ size?: number; className?: string }>;
type InferenceOptions = {
  modelKey: ModelKey;
  hviMode: HviMode;
  distanceEnabled: boolean;
  laneEnabled: boolean;
  steeringEnabled: boolean;
  centerLineEnabled: boolean;
};
type CaptureFrameOptions = {
  allowPaused?: boolean;
  hviMode: HviMode;
};
type SendFrameOptions = {
  requireStreaming?: boolean;
  allowPaused?: boolean;
  abortPrevious?: boolean;
  updateFps?: boolean;
};

// Browser hanya mengirim frame; seluruh pemuatan model dan inferensi terjadi di FastAPI.
const API_BASE = process.env.NEXT_PUBLIC_INFERENCE_API_URL || 'http://localhost:8000';
const KITTI_PROXY_VIDEO_URL = `${API_BASE}/demo/kitti-video`;
const DEFAULT_CONF = 0.35;
const DEFAULT_IMGSZ = 640;
const DEFAULT_CAPTURE_MAX_WIDTH = 960;
const HVI_CAPTURE_MAX_WIDTH = 720;
const HVI_MODES: { value: HviMode; label: string }[] = [
  { value: 'off', label: 'HVI Off' },
  { value: 'auto', label: 'HVI Auto' },
  { value: 'on', label: 'HVI On' },
];

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFps(fps: number) {
  if (!Number.isFinite(fps) || fps <= 0) return '0.0';
  return fps > 99 ? Math.round(fps).toString() : fps.toFixed(1);
}

function featureClass(active: boolean) {
  return active
    ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700';
}

function FeatureToggle({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: IconType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-xs font-black transition md:text-sm ${featureClass(active)}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function HviModeControl({
  value,
  onChange,
}: {
  value: HviMode;
  onChange: (mode: HviMode) => void;
}) {
  return (
    <div className="inline-flex h-11 items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-xs font-black text-slate-600 shadow-sm">
      <Moon size={16} className="ml-2 text-blue-500" />
      {HVI_MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`h-8 rounded-full px-3 transition ${
            value === mode.value
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

export default function InferenceStudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  // Ref menyimpan opsi terbaru agar loop asynchronous tidak memakai state React yang lama.
  const inferenceOptionsRef = useRef<InferenceOptions>({
    modelKey: 'sknet',
    hviMode: 'auto',
    distanceEnabled: false,
    laneEnabled: false,
    steeringEnabled: false,
    centerLineEnabled: false,
  });
  const requestAbortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);
  const lastProcessedAtRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceKind, setSourceKind] = useState<SourceKind>('empty');
  const [sourceName, setSourceName] = useState('');
  const [modelKey, setModelKey] = useState<ModelKey>('sknet');
  const [hviMode, setHviMode] = useState<HviMode>('auto');
  const [distanceEnabled, setDistanceEnabled] = useState(false);
  const [laneEnabled, setLaneEnabled] = useState(false);
  const [steeringEnabled, setSteeringEnabled] = useState(false);
  const [centerLineEnabled, setCenterLineEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [result, setResult] = useState<FrameResponse | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((payload: HealthResponse) => setHealth(payload))
      .catch(() => setHealth(null));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      stopRealtime();
      cleanupObjectUrl();
    };
  }, []);

  const selectedModelReady = health?.models?.[modelKey]?.exists ?? false;
  const hviReady = Boolean(health?.models?.hvi?.exists && health?.hvi_repo_exists);
  const backendOnline = Boolean(health);
  const activeClasses = result ? Object.entries(result.class_counts) : [];
  const currentInferenceOptions: InferenceOptions = {
    modelKey,
    hviMode,
    distanceEnabled,
    laneEnabled,
    steeringEnabled,
    centerLineEnabled,
  };
  inferenceOptionsRef.current = currentInferenceOptions;

  function cleanupObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function resetOutput() {
    setResult(null);
    setFrameCount(0);
    setFps(0);
    setError(null);
    lastProcessedAtRef.current = 0;
  }

  function handleFileChange(nextFile: File | null) {
    stopRealtime();
    cleanupObjectUrl();
    resetOutput();
    setFile(nextFile);
    if (!nextFile) {
      setSourceKind('empty');
      setSourceName('');
      setSourceUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(nextFile);
    objectUrlRef.current = nextUrl;
    setSourceKind('file');
    setSourceName(nextFile.name);
    setSourceUrl(nextUrl);
  }

  function useKittiSimulation() {
    stopRealtime();
    cleanupObjectUrl();
    resetOutput();
    setFile(null);
    setSourceKind('demo');
    setSourceName('KITTI public road sequence');
    setSourceUrl(KITTI_PROXY_VIDEO_URL);
    window.setTimeout(() => videoRef.current?.load(), 0);
  }

  function clearSource() {
    stopRealtime();
    cleanupObjectUrl();
    resetOutput();
    setFile(null);
    setSourceKind('empty');
    setSourceName('');
    setSourceUrl(null);
  }

  function stopRealtime() {
    streamingRef.current = false;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    inFlightRef.current = false;
    lastProcessedAtRef.current = 0;
    videoRef.current?.pause();
    setStreaming(false);
    setWarmingUp(false);
  }

  function canRefreshPausedFrame(options: InferenceOptions) {
    const video = videoRef.current;
    return Boolean(
      sourceUrl &&
        health &&
        health.models?.[options.modelKey]?.exists &&
        (options.hviMode === 'off' || hviReady) &&
        video &&
        video.paused &&
        !video.ended &&
        video.readyState >= 2,
    );
  }

  function refreshPausedFrame(options: InferenceOptions) {
    if (!canRefreshPausedFrame(options)) return;
    void sendFrame(options, {
      requireStreaming: false,
      allowPaused: true,
      abortPrevious: true,
      updateFps: false,
    });
  }

  function commitInferenceOptions(options: InferenceOptions) {
    inferenceOptionsRef.current = options;
    refreshPausedFrame(options);
  }

  function toggleModelKey() {
    const nextModelKey: ModelKey = modelKey === 'sknet' ? 'baseline' : 'sknet';
    const nextOptions = { ...currentInferenceOptions, modelKey: nextModelKey };
    setModelKey(nextModelKey);
    commitInferenceOptions(nextOptions);
  }

  function selectHviMode(nextHviMode: HviMode) {
    const nextOptions = { ...currentInferenceOptions, hviMode: nextHviMode };
    setHviMode(nextHviMode);
    commitInferenceOptions(nextOptions);
  }

  function toggleDistance() {
    const nextOptions = { ...currentInferenceOptions, distanceEnabled: !distanceEnabled };
    setDistanceEnabled(nextOptions.distanceEnabled);
    commitInferenceOptions(nextOptions);
  }

  function toggleLane() {
    const nextOptions = { ...currentInferenceOptions, laneEnabled: !laneEnabled };
    setLaneEnabled(nextOptions.laneEnabled);
    commitInferenceOptions(nextOptions);
  }

  function toggleSteering() {
    const nextOptions = { ...currentInferenceOptions, steeringEnabled: !steeringEnabled };
    setSteeringEnabled(nextOptions.steeringEnabled);
    commitInferenceOptions(nextOptions);
  }

  function toggleCenterLine() {
    const nextOptions = { ...currentInferenceOptions, centerLineEnabled: !centerLineEnabled };
    setCenterLineEnabled(nextOptions.centerLineEnabled);
    commitInferenceOptions(nextOptions);
  }

  async function captureFrameBlob({ allowPaused = false, hviMode: captureHviMode }: CaptureFrameOptions) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || (!allowPaused && video.paused) || video.ended || video.readyState < 2) return null;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    // HVI lebih berat daripada YOLO saja, sehingga frame HVI diperkecil untuk menjaga respons demo.
    const maxWidth = captureHviMode === 'off' ? DEFAULT_CAPTURE_MAX_WIDTH : HVI_CAPTURE_MAX_WIDTH;
    const scale = Math.min(1, maxWidth / width);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext('2d');
    if (!context) return null;

    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.84));
    } catch {
      throw new Error('Frame video tidak bisa dibaca canvas. Gunakan simulasi KITTI atau video lokal yang kompatibel browser.');
    }
  }

  async function sendFrame(options = inferenceOptionsRef.current, frameOptions: SendFrameOptions = {}) {
    const { requireStreaming = true, allowPaused = false, abortPrevious = false, updateFps = true } = frameOptions;
    if (requireStreaming && !streamingRef.current) return;
    if (inFlightRef.current) {
      if (!abortPrevious) return;
      requestAbortRef.current?.abort();
      requestAbortRef.current = null;
      inFlightRef.current = false;
    }

    let blob: Blob | null = null;
    try {
      blob = await captureFrameBlob({ allowPaused, hviMode: options.hviMode });
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Frame tidak dapat dibaca.');
      if (requireStreaming) {
        stopRealtime();
      }
      return;
    }

    if (!blob) return;
    inFlightRef.current = true;
    const frameController = new AbortController();
    requestAbortRef.current = frameController;

    // Nama field di bawah harus sama dengan parameter Form pada POST /detect/frame.
    const form = new FormData();
    form.append('file', blob, 'frame.jpg');
    form.append('model_key', options.modelKey);
    form.append('hvi_mode', options.hviMode);
    form.append('distance_enabled', String(options.distanceEnabled));
    form.append('lane_enabled', String(options.laneEnabled));
    form.append('steering_enabled', String(options.steeringEnabled));
    form.append('center_line_enabled', String(options.centerLineEnabled));
    form.append('conf', String(DEFAULT_CONF));
    form.append('imgsz', String(DEFAULT_IMGSZ));

    try {
      const response = await fetch(`${API_BASE}/detect/frame`, {
        method: 'POST',
        body: form,
        signal: frameController.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail || `Frame gagal diproses (${response.status})`);
      if (requireStreaming && !streamingRef.current) return;

      const now = performance.now();
      const elapsedSinceLast = lastProcessedAtRef.current ? now - lastProcessedAtRef.current : Number(payload?.latency_ms) || 0;
      if (updateFps) {
        lastProcessedAtRef.current = now;
      }
      if (updateFps && elapsedSinceLast > 0) {
        setFps(1000 / elapsedSinceLast);
      }

      setResult(payload as FrameResponse);
      setFrameCount((value) => value + 1);
      setWarmingUp(false);
      setError(null);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Frame gagal diproses.');
      if (requireStreaming) {
        stopRealtime();
      }
    } finally {
      if (requestAbortRef.current === frameController) {
        requestAbortRef.current = null;
        inFlightRef.current = false;
      }
    }
  }

  async function realtimeLoop() {
    if (!streamingRef.current) return;
    await sendFrame(inferenceOptionsRef.current);
    if (streamingRef.current) {
      // Frame berikutnya baru dikirim setelah respons selesai; tidak ada batas FPS buatan.
      window.setTimeout(() => {
        void realtimeLoop();
      }, 0);
    }
  }

  async function startRealtime() {
    if (!sourceUrl) {
      setError('Pilih video lokal atau gunakan simulasi KITTI terlebih dahulu.');
      return;
    }
    if (!health) {
      setError('Backend FastAPI belum aktif di http://localhost:8000.');
      return;
    }
    if (health && !selectedModelReady) {
      setError(`Weight model ${modelKey === 'sknet' ? 'SKNet' : 'YOLOv12n baseline'} belum terbaca backend.`);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setStreaming(true);
    setWarmingUp(true);
    setResult(null);
    setFps(0);
    lastProcessedAtRef.current = 0;
    streamingRef.current = true;

    try {
      await video.play();
    } catch {
      setError('Browser menolak autoplay. Tekan play pada video, lalu klik Mulai lagi.');
      stopRealtime();
      return;
    }

    void realtimeLoop();
  }

  function handleVideoPlay() {
    if (!sourceUrl || streamingRef.current) return;
    void startRealtime();
  }

  const modelLabel = modelKey === 'sknet' ? 'YOLOv12n + SKNet' : 'YOLOv12n Baseline';
  const hviLabel = hviMode === 'off' ? 'HVI off' : hviMode === 'on' ? 'HVI on' : result?.hvi_applied ? 'HVI aktif' : 'HVI auto';

  return (
    <main className="min-h-screen bg-white pt-24 text-slate-800">
      {!health && (
        <div className="fixed inset-x-0 top-0 z-[60] border-b border-blue-100 bg-white/90 px-4 py-2 text-center text-xs font-bold text-blue-600 backdrop-blur-xl">
          Menunggu FastAPI aktif di {API_BASE}
        </div>
      )}

      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_58%,#ffffff_100%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 shadow-sm">
                <Radar size={16} />
                Realtime Perception Studio
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-5xl">
                Deteksi video dengan dua layar sinkron.
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                Input video tetap di browser, setiap frame dikirim ke FastAPI dalam memori, lalu hasil anotasi dikembalikan tanpa menyimpan file upload atau output.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${backendOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {backendOnline ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">FastAPI Backend</p>
                  <p className="max-w-60 truncate text-sm font-black text-slate-700">{API_BASE}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-[1.5rem] border border-slate-100 bg-white/80 p-4 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={useKittiSimulation}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition ${sourceKind === 'demo' ? featureClass(true) : featureClass(false)}`}
                >
                  <Wand2 size={17} />
                  Simulasi KITTI
                </button>

                <label className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition ${sourceKind === 'file' ? featureClass(true) : featureClass(false)}`}>
                  <UploadCloud size={17} />
                  Upload video
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    className="hidden"
                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                  />
                </label>

                {sourceKind !== 'empty' && (
                  <button
                    type="button"
                    onClick={clearSource}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={16} />
                    Reset
                  </button>
                )}

                <div className="min-w-0 flex-1 rounded-full border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 sm:text-sm">
                  {sourceKind === 'empty' ? 'Belum ada video aktif' : sourceKind === 'file' && file ? `${sourceName} - ${formatSize(file.size)}` : sourceName}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FeatureToggle active={modelKey === 'sknet'} icon={BrainCircuit} label="SKNet" onClick={toggleModelKey} />
                <HviModeControl value={hviMode} onChange={selectHviMode} />
                <FeatureToggle active={distanceEnabled} icon={Gauge} label="Jarak" onClick={toggleDistance} />
                <FeatureToggle active={laneEnabled} icon={Video} label="Batas jalan" onClick={toggleLane} />
                <FeatureToggle active={steeringEnabled} icon={CircleGauge} label="Stir" onClick={toggleSteering} />
                <FeatureToggle active={centerLineEnabled} icon={Camera} label="Garis objek" onClick={toggleCenterLine} />

                <button
                  type="button"
                  onClick={streaming ? stopRealtime : startRealtime}
                  className={`ml-auto inline-flex h-12 min-w-38 items-center justify-center gap-2 rounded-full px-5 text-sm font-black text-white shadow-xl transition ${
                    streaming ? 'bg-slate-800 shadow-slate-400/30 hover:bg-slate-900' : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700'
                  }`}
                >
                  {streaming ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                  {streaming ? 'Jeda' : 'Mulai'}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}
          {health && hviMode !== 'off' && !hviReady && (
            <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
              {hviMode === 'on' ? 'HVI On' : 'HVI Auto'} aktif, tetapi path weight/repo HVI belum lengkap di backend. Pilih HVI Off jika ingin menjalankan deteksi tanpa enhancer.
            </div>
          )}

          <section className="relative rounded-[2rem] border border-white bg-white/75 p-3 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl sm:p-4">
            {warmingUp && (
              <div className="absolute inset-3 z-30 flex items-center justify-center rounded-[1.5rem] bg-white/82 backdrop-blur-md sm:inset-4">
                <div className="max-w-sm rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-2xl shadow-blue-100/60">
                  <Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={34} />
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">Preloader</p>
                  <p className="mt-2 text-xl font-black text-slate-800">Menyiapkan frame pertama</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Model dipanaskan dulu agar video input dan hasil deteksi mulai terlihat bersamaan.</p>
                </div>
              </div>
            )}

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-950">
                <div className="relative aspect-video">
                  {sourceUrl ? (
                    <video
                      ref={videoRef}
                      src={sourceUrl}
                      controls
                      muted
                      playsInline
                      loop={sourceKind === 'demo'}
                      crossOrigin="anonymous"
                      className="h-full w-full bg-slate-950 object-contain"
                      onPlay={handleVideoPlay}
                      onPause={stopRealtime}
                      onEnded={stopRealtime}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-950 px-6 text-center text-sm font-bold text-slate-500">
                      Pilih simulasi KITTI atau upload video lokal.
                    </div>
                  )}
                  <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                    Input
                  </div>
                  {sourceKind !== 'empty' && (
                    <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black text-slate-800">{sourceKind === 'demo' ? 'KITTI simulation' : sourceName}</span>
                      <span className="rounded-full bg-blue-500/90 px-3 py-1.5 text-[11px] font-black text-white">{modelLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-950">
                <div className="relative aspect-video">
                  {result?.annotated_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.annotated_image} alt="Realtime detection output" className="h-full w-full bg-slate-950 object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-950 px-6 text-center text-sm font-bold text-slate-500">
                      Hasil deteksi muncul setelah tombol Mulai ditekan.
                    </div>
                  )}

                  <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-400/90 px-3 py-1.5 text-xs font-black text-slate-950">{formatFps(fps)} FPS</span>
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-800">{result ? `${result.latency_ms} ms` : 'idle'}</span>
                  </div>

                  <div className="pointer-events-none absolute right-3 top-3 flex max-w-[70%] flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-blue-500/90 px-3 py-1.5 text-[11px] font-black text-white">{modelLabel}</span>
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-black ${result?.hvi_applied ? 'bg-cyan-300 text-slate-950' : 'bg-slate-800/85 text-white'}`}>
                      {hviLabel}
                    </span>
                  </div>

                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-3">
                    <div className="flex max-w-full flex-wrap gap-2">
                      {activeClasses.length ? (
                        activeClasses.map(([className, count]) => (
                          <span key={className} className="rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black text-slate-900">
                            {className} {count}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-800/85 px-3 py-1.5 text-[11px] font-black text-white">Belum ada objek</span>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 text-[11px] font-black">
                      {distanceEnabled && <span className="rounded-full bg-blue-500/90 px-3 py-1.5 text-white">distance</span>}
                      {laneEnabled && <span className="rounded-full bg-emerald-400/90 px-3 py-1.5 text-slate-950">lane {result?.lane_count ?? 0}</span>}
                      {steeringEnabled && <span className="rounded-full bg-white/92 px-3 py-1.5 text-slate-900">steer {result?.steering_angle ?? 0}deg</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Frame', value: frameCount, icon: Camera },
              { label: 'Deteksi', value: result?.detections_total ?? 0, icon: Radar },
              { label: 'Brightness', value: result ? result.brightness.toFixed(1) : '-', icon: Moon },
              { label: 'Storage', value: health?.storage ? 'In-memory' : '-', icon: Server },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <Icon className="mb-3 text-blue-500" size={20} />
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
                  <p className="mt-1 text-xl font-black text-slate-800">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
