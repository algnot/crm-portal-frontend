"use client";

import { X } from "lucide-react";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

const MODAL_EXIT_MS = 250;
const SCAN_INTERVAL_MS = 200;
const CROP_RATIO = 0.72;

function getCenterCrop(
  videoWidth: number,
  videoHeight: number,
  ratio = CROP_RATIO,
) {
  const size = Math.floor(Math.min(videoWidth, videoHeight) * ratio);
  return {
    size,
    x: Math.floor((videoWidth - size) / 2),
    y: Math.floor((videoHeight - size) / 2),
  };
}

function decodeWithJsQr(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
) {
  const { width, height } = video;
  const crop = getCenterCrop(width, height);

  canvas.width = crop.size;
  canvas.height = crop.size;
  context.drawImage(
    video,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    crop.size,
    crop.size,
  );

  const imageData = context.getImageData(0, 0, crop.size, crop.size);
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });

  return result?.data?.trim() ?? null;
}

type QrScannerModalProps = {
  onClose: () => void;
  onScan: (value: string) => void;
};

function canUseCamera() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

type ScannerEngine =
  | { type: "barcode-detector"; detector: BarcodeDetector }
  | { type: "jsqr" };

function createScannerEngine(): ScannerEngine {
  if ("BarcodeDetector" in window) {
    return {
      type: "barcode-detector",
      detector: new BarcodeDetector({ formats: ["qr_code"] }),
    };
  }

  return { type: "jsqr" };
}

async function detectQrFromVideo(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  engine: ScannerEngine,
) {
  if (video.readyState < video.HAVE_ENOUGH_DATA) {
    return null;
  }

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return null;
  }

  if (engine.type === "barcode-detector") {
    const barcodes = await engine.detector.detect(video);
    return barcodes[0]?.rawValue?.trim() ?? null;
  }

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }

  return decodeWithJsQr(context, canvas, video);
}

export default function QrScannerModal({
  onClose,
  onScan,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastScanAtRef = useRef(0);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), MODAL_EXIT_MS);
  };

  useEffect(() => {
    let cancelled = false;

    const stopCamera = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const startScanner = async () => {
      setIsStarting(true);
      setError(null);

      if (!canUseCamera()) {
        setError(
          "ไม่สามารถเปิดกล้องได้ กรุณาใช้ HTTPS หรือกรอกข้อมูลด้วยตนเอง",
        );
        setIsStarting(false);
        return;
      }

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          throw new Error("video_not_ready");
        }

        video.srcObject = stream;
        await video.play();

        const scannerEngine = createScannerEngine();

        const scanFrame = async () => {
          if (cancelled || !videoRef.current || !canvasRef.current) return;

          const now = performance.now();
          if (now - lastScanAtRef.current >= SCAN_INTERVAL_MS) {
            lastScanAtRef.current = now;

            try {
              const value = await detectQrFromVideo(
                videoRef.current,
                canvasRef.current,
                scannerEngine,
              );
              if (value) {
                stopCamera();
                onScan(value);
                closeModal();
                return;
              }
            } catch {
              // Ignore frame-level detection errors and keep scanning.
            }
          }

          animationRef.current = requestAnimationFrame(() => {
            void scanFrame();
          });
        };

        setIsStarting(false);
        animationRef.current = requestAnimationFrame(() => {
          void scanFrame();
        });
      } catch {
        setError(
          "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้องหรือกรอกข้อมูลด้วยตนเอง",
        );
        setIsStarting(false);
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [onScan]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-black transition-opacity duration-250 ease-in-out${isClosing ? " opacity-0" : " opacity-100"}`}
    >
      <div className="flex items-center justify-between px-4 py-4 text-white">
        <div>
          <h2 className="text-lg font-semibold">สแกน QR สมาชิก</h2>
          <p className="mt-1 text-sm text-white/70">
            จัด QR ให้อยู่กลางจอ
          </p>
        </div>
        <button
          type="button"
          onClick={closeModal}
          className="rounded-full bg-white/10 p-3"
          aria-label="ปิด"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="size-full object-cover"
          playsInline
          muted
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="size-64 rounded-3xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
      </div>

      <div className="space-y-3 px-4 pb-8 pt-4">
        {isStarting ? (
          <p className="text-center text-sm text-white/80">กำลังเปิดกล้อง...</p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-red-500/20 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </p>
        ) : (
          <p className="text-center text-sm text-white/80">
            ระบบจะค้นหาสมาชิกให้อัตโนมัติเมื่อสแกนสำเร็จ
          </p>
        )}

        <button
          type="button"
          onClick={closeModal}
          className="w-full rounded-2xl bg-white/10 px-4 py-4 text-base font-medium text-white"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
