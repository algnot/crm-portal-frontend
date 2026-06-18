import { Suspense } from "react";
import InviteAcceptPage from "@/components/auth/InviteAcceptPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brown-100" />
        </div>
      }
    >
      <InviteAcceptPage />
    </Suspense>
  );
}
