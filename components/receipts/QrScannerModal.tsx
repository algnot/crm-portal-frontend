"use client";

import { X } from "lucide-react";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

const MODAL_EXIT_MS = 250;
const SCAN_INTERVAL_MS = 150;
const MAX_SCAN_DIMENSION = 960;

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

function getCenterCrop(
  frameWidth: number,
  frameHeight: number,
  ratio = 0.7,
) {
  const size = Math.floor(Math.min(frameWidth, frameHeight) * ratio);
  return {
    size,
    x: Math.floor((frameWidth - size) / 2),
    y: Math.floor((frameHeight - size) / 2),
  };
}

function decodeImageDataWithJsQr(imageData: ImageData) {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });

  return result?.data?.trim() ?? null;
}

function decodeWithJsQr(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) {
    return null;
  }

  const scale = Math.min(
    1,
    MAX_SCAN_DIMENSION / Math.max(sourceWidth, sourceHeight),
  );
  const frameWidth = Math.floor(sourceWidth * scale);
  const frameHeight = Math.floor(sourceHeight * scale);

  canvas.width = frameWidth;
  canvas.height = frameHeight;
  context.drawImage(video, 0, 0, frameWidth, frameHeight);

  const fullFrame = context.getImageData(0, 0, frameWidth, frameHeight);
  const fullFrameResult = decodeImageDataWithJsQr(fullFrame);
  if (fullFrameResult) {
    return fullFrameResult;
  }

  const crop = getCenterCrop(frameWidth, frameHeight);
  if (crop.size <= 0) {
    return null;
  }

  const croppedFrame = context.getImageData(
    crop.x,
    crop.y,
    crop.size,
    crop.size,
  );

  return decodeImageDataWithJsQr(croppedFrame);
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
  context: CanvasRenderingContext2D,
  engine: ScannerEngine,
) {
  if (video.readyState < video.HAVE_ENOUGH_DATA) {
    return null;
  }

  if (!video.videoWidth || !video.videoHeight) {
    return null;
  }

  if (engine.type === "barcode-detector") {
    try {
      const barcodes = await engine.detector.detect(video);
      const nativeResult = barcodes[0]?.rawValue?.trim();
      if (nativeResult) {
        return nativeResult;
      }
    } catch {
      // Fall back to jsQR when native detection fails for a frame.
    }
  }

  return decodeWithJsQr(context, canvas, video);
}

export default function QrScannerModal({
  onClose,
  onScan,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
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
        contextRef.current = canvasRef.current.getContext("2d", {
          willReadFrequently: true,
        });
      }

      if (!contextRef.current) {
        setError("ไม่สามารถเริ่มสแกน QR ได้ กรุณากรอกข้อมูลด้วยตนเอง");
        setIsStarting(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
        video.setAttribute("playsinline", "true");
        await video.play();

        const scannerEngine = createScannerEngine();
        const canvas = canvasRef.current;
        const context = contextRef.current;

        const scanFrame = async () => {
          if (cancelled || !videoRef.current || !canvas || !context) return;

          const now = performance.now();
          if (now - lastScanAtRef.current >= SCAN_INTERVAL_MS) {
            lastScanAtRef.current = now;

            try {
              const value = await detectQrFromVideo(
                videoRef.current,
                canvas,
                context,
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

      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="size-full object-contain"
          playsInline
          muted
          autoPlay
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
