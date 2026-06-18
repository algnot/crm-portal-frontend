"use client";

import CouponFormModal from "@/components/coupons/CouponFormModal";
import CouponRedemptionsModal from "@/components/coupons/CouponRedemptionsModal";
import { getCoupon, getCoupons } from "@/services/coupons/coupons";
import type { PortalCoupon } from "@/services/coupons/types";
import { formatDateTime } from "@/utils/datetime";
import { handleError } from "@/utils/errors";
import { formatNumber } from "@/utils/format";
import { History, Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<PortalCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalCoupon, setModalCoupon] = useState<PortalCoupon | null | undefined>(
    undefined,
  );
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [redemptionsCoupon, setRedemptionsCoupon] = useState<PortalCoupon | null>(
    null,
  );

  const loadCoupons = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (loadError) {
      setError(handleError(loadError).message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const openCreateModal = () => {
    setModalCoupon(null);
  };

  const openEditModal = async (couponId: number) => {
    setEditingCouponId(couponId);
    try {
      const coupon = await getCoupon(couponId);
      setModalCoupon(coupon);
    } catch (loadError) {
      setError(handleError(loadError).message);
    } finally {
      setEditingCouponId(null);
    }
  };

  const closeModal = () => {
    setModalCoupon(undefined);
  };

  const handleSuccess = async () => {
    setSuccessMessage("บันทึกคูปองสำเร็จ");
    await loadCoupons();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-defualt-text">
            จัดการคูปอง
          </h1>
          <p className="mt-1 text-sm text-gray-100">
            สร้างและจัดการคูปองสำหรับลูกค้าแลก point
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-brown-100 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brown-100/80"
        >
          <Plus className="size-4" />
          เพิ่มคูปอง
        </button>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-xl bg-brown-yellow-5 px-4 py-3 text-sm text-brown-100">
          {successMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brown-100" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-100">{error}</div>
        ) : coupons.length === 0 ? (
          <div className="p-6 text-sm text-gray-100">ยังไม่มีคูปอง</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-10 text-gray-100">
                <tr>
                  <th className="px-4 py-4 font-medium">คูปอง</th>
                  <th className="px-4 py-4 font-medium">มูลค่า</th>
                  <th className="px-4 py-4 font-medium">ช่วงเวลา</th>
                  <th className="px-4 py-4 font-medium">โค้ด</th>
                  <th className="px-4 py-4 font-medium">แลก/ใช้</th>
                  <th className="px-4 py-4 font-medium">แสดงใน UI</th>
                  <th className="px-4 py-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {coupon.image_url ? (
                          <img
                            src={String(coupon.image_url)}
                            alt={coupon.name}
                            className="size-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-brown-yellow-5" />
                        )}
                        <div>
                          <p className="font-medium text-defualt-text">
                            {coupon.name}
                          </p>
                          <p className="text-xs text-gray-100">
                            {coupon.code_source === "generate"
                              ? "Generate"
                              : "Import"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-defualt-text">
                      {formatNumber(coupon.value)}{" "}
                      <span className="text-gray-100">
                        {coupon.currency_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-defualt-text">
                      <div>{formatDateTime(coupon.start_time)}</div>
                      <div className="text-gray-100">
                        {formatDateTime(coupon.end_time)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-defualt-text">
                      {formatNumber(coupon.available_code_count)} /{" "}
                      {formatNumber(coupon.total_code_count)}
                    </td>
                    <td className="px-4 py-4 text-defualt-text">
                      {formatNumber(coupon.redeemed_count)} /{" "}
                      {formatNumber(coupon.used_code_count)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          coupon.is_show_in_ui
                            ? "bg-brown-yellow-5 text-brown-100"
                            : "bg-gray-10 text-gray-100"
                        }`}
                      >
                        {coupon.is_show_in_ui ? "แสดง" : "ซ่อน"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setRedemptionsCoupon(coupon)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-4xl border border-gray-200 px-4 py-2 text-sm font-medium text-defualt-text transition hover:bg-gray-10"
                        >
                          <History className="size-4" />
                          ประวัติ
                        </button>
                        <button
                          type="button"
                          onClick={() => void openEditModal(coupon.id)}
                          disabled={editingCouponId === coupon.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-4xl border border-brown-100 px-4 py-2 text-sm font-medium text-brown-100 transition hover:bg-brown-yellow-5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="size-4" />
                          {editingCouponId === coupon.id
                            ? "กำลังโหลด..."
                            : "แก้ไข"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCoupon !== undefined ? (
        <CouponFormModal
          coupon={modalCoupon}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      ) : null}

      {redemptionsCoupon ? (
        <CouponRedemptionsModal
          couponId={redemptionsCoupon.id}
          couponName={redemptionsCoupon.name}
          onClose={() => setRedemptionsCoupon(null)}
        />
      ) : null}
    </div>
  );
}
