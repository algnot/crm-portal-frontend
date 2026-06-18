"use client";

import { useApp } from "@/providers/app-provider";
import { getDefaultDashboardPath, getUserRole } from "@/utils/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { me } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!me) return;
    router.replace(getDefaultDashboardPath(getUserRole(me)));
  }, [me, router]);

  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brown-100" />
    </div>
  );
}
