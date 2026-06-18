"use client";

import { DashboardShellSkeleton } from "@/components/util/Skeleton";
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

  return <DashboardShellSkeleton />;
}
