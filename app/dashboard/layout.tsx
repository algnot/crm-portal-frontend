import { Suspense } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import Menu from "@/components/layout/menu/Menu";
import Top from "@/components/layout/menu/Top";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <RoleGuard>
        <div className="md:flex min-h-screen">
          <Menu />
          <div className="flex-1 flex flex-col min-w-0">
            <Top />
            <main className="flex-1 pt-14 md:pt-0">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
