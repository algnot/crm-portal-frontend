"use client";

import AdjustPointModal from "@/components/members/AdjustPointModal";
import { getUser } from "@/services/members/members";
import type { PortalUser } from "@/services/members/types";
import { handleError } from "@/utils/errors";
import { displayValue, formatNumber } from "@/utils/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type MemberDetailPageProps = {
  userId: number;
};

export default function MemberDetailPage({ userId }: MemberDetailPageProps) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await getUser(userId);
      setUser(data);
    } catch (loadError) {
      setError(handleError(loadError).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void loadUser();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [loadUser]);

  const handlePointAdjusted = async () => {
    setSuccessMessage("ปรับ point สำเร็จ");
    await loadUser();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-8">
        <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brown-100" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <Link
          href="/dashboard/members"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-100 hover:text-brown-100"
        >
          <ArrowLeft className="size-4" />
          กลับไปรายชื่อสมาชิก
        </Link>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-red-100">
          {error ?? "ไม่พบข้อมูลสมาชิก"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Link
        href="/dashboard/members"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-100 hover:text-brown-100"
      >
        <ArrowLeft className="size-4" />
        กลับไปรายชื่อสมาชิก
      </Link>

      {successMessage ? (
        <div className="mb-4 rounded-xl bg-brown-yellow-5 px-4 py-3 text-sm text-brown-100">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {user.picture_url ? (
              <img
                src={user.picture_url}
                alt={user.display_name}
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-brown-100 text-lg font-semibold text-white">
                {user.display_name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-defualt-text">
                {user.display_name}
              </h1>
              <p className="mt-1 text-sm text-gray-100">
                {user.tier.name} ({user.tier.code})
              </p>
              <p className="mt-1 text-sm text-gray-100">
                สมัครเมื่อ {user.create_date}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="เบอร์โทร" value={displayValue(user.phone)} />
            <InfoItem
              label="ยืนยันเบอร์โทร"
              value={user.is_phone_verified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
            />
            <InfoItem label="อีเมล" value={displayValue(user.email)} />
            <InfoItem
              label="ยืนยันอีเมล"
              value={user.is_email_verified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
            />
            <InfoItem label="วันเกิด" value={displayValue(user.birth_date)} />
            <InfoItem label="เพศ" value={displayValue(user.gender)} />
            <InfoItem label="LINE User ID" value={user.line_user_id} />
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-defualt-text">
              Point คงเหลือ
            </h2>
            <AdjustPointModal user={user} onSuccess={handlePointAdjusted} />
          </div>
          <div className="mt-4 space-y-3">
            {user.points.map((point) => (
              <div
                key={point.currency.id}
                className="flex items-center justify-between rounded-xl bg-gray-10 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-defualt-text">
                    {point.currency.name}
                  </p>
                  {point.currency.is_default ? (
                    <p className="text-xs text-gray-100">ค่าเริ่มต้น</p>
                  ) : null}
                </div>
                <p className="text-lg font-semibold text-brown-100">
                  {formatNumber(point.balance)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-gray-100">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-all text-defualt-text">
        {value}
      </dd>
    </div>
  );
}
