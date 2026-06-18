"use client";

import { Info, ChevronDown } from "lucide-react";
import dialog from "@/components/util/dialog";
import { useApp } from "@/providers/app-provider";
import { logout } from "@/services/auth/auth";
import { useEffect, useRef, useState } from "react";

function getInitials(fullName?: string): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return "";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return parts[0][0]?.toUpperCase() ?? "";
}

export default function Profile() {
  const { me } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    const result = await dialog.fire({
      title: "ยืนยันการออกจากระบบ",
      description: "คุณต้องการออกจากระบบหรือไม่",
      icon: <Info className="text-red-100" />,
      confirmText: "ออกจากระบบ",
      confirmVariant: "danger",
    });
    setIsOpen(false);

    if (result.isConfirmed) {
      logout();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-4 font-medium cursor-pointer"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div
        className="size-8 shrink-0 rounded-full bg-brown-100 flex items-center justify-center text-white text-xs font-medium"
        aria-hidden
      >
        {getInitials(me?.user.name)}
      </div>
      <div className="text-gray-100 font-medium text-sm truncate max-w-[200px]">
        {me?.user.name}
      </div>
      <button
        type="button"
        className="size-6 shrink-0 flex items-center justify-center text-brown-100 cursor-pointer [&_svg]:shrink-0"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="เมนูโปรไฟล์"
      >
        <ChevronDown
          className={`transition-transform duration-200${isOpen ? " rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 min-w-44 bg-white rounded-2xl border border-gray-200 py-2 shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] z-50"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm hover:text-brown-100 cursor-pointer text-gray-100"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
