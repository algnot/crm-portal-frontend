"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MODAL_EXIT_MS = 250;

type QrScannerModalProps = {
  onClose: () => void;
  onScan: (value: string) => void;
};

export default function QrScannerModal({
  onClose,
  onScan,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
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

      if (!("BarcodeDetector" in window)) {
        setError("เบราว์เซอร์นี้ไม่รองรับการสแกน QR กรุณากรอกข้อมูลด้วยตนเอง");
        setIsStarting(false);
        return;
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

        const detector = new BarcodeDetector({ formats: ["qr_code"] });

        const scanFrame = async () => {
          if (cancelled || !videoRef.current) return;

          try {
            const barcodes = await detector.detect(videoRef.current);
            const value = barcodes[0]?.rawValue?.trim();
            if (value) {
              stopCamera();
              onScan(value);
              closeModal();
              return;
            }
          } catch {
            // Ignore frame-level detection errors and keep scanning.
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
        setError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้องหรือกรอกข้อมูลด้วยตนเอง");
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
