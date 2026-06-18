"use client";

import ReceiptDetailModal, {
  StateBadge,
} from "@/components/receipts/ReceiptDetailModal";
import { getReceipts } from "@/services/receipts/receipts";
import type { PortalReceipt, ReceiptState } from "@/services/receipts/types";
import { formatDateTime } from "@/utils/datetime";
import { handleError } from "@/utils/errors";
import { displayValue, formatNumber } from "@/utils/format";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 20;

type StateFilter = ReceiptState | "all";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<PortalReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [stateFilter, setStateFilter] = useState<StateFilter>("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(
    null,
  );

  const stateParam = useMemo(
    () => (stateFilter === "all" ? undefined : stateFilter),
    [stateFilter],
  );

  const loadReceipts = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await getReceipts({
        state: stateParam,
        search,
        limit: PAGE_SIZE,
        offset,
      });
      setReceipts(data.receipts);
      setTotal(data.total);
    } catch (loadError) {
      setError(handleError(loadError).message);
      setReceipts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [offset, search, stateParam]);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  useEffect(() => {
    setOffset(0);
  }, [stateFilter, search]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleSuccess = async () => {
    setSuccessMessage("บันทึกใบเสร็จสำเร็จ");
    await loadReceipts();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const stateTabs: { value: StateFilter; label: string }[] = [
    { value: "pending", label: "รอตรวจสอบ" },
    { value: "approved", label: "อนุมัติแล้ว" },
    { value: "rejected", label: "ปฏิเสธ" },
    { value: "all", label: "ทั้งหมด" },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-defualt-text">
            ตรวจสอบใบเสร็จ
          </h1>
          <p className="mt-1 text-sm text-gray-100">
            อนุมัติหรือปฏิเสธใบเสร็จที่สมาชิกส่งเข้ามา
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-100" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="ค้นหาเลขใบเสร็จ, ชื่อ, LINE ID..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-sm outline-none focus:border-brown-100"
          />
        </form>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-xl bg-brown-yellow-5 px-4 py-3 text-sm text-brown-100">
          {successMessage}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {stateTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStateFilter(tab.value)}
            className={`cursor-pointer rounded-4xl px-4 py-2 text-sm font-medium transition ${
              stateFilter === tab.value
                ? "bg-brown-100 text-white"
                : "border border-gray-200 bg-white text-defualt-text hover:bg-gray-10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-gray-100">
        ทั้งหมด {formatNumber(total)} รายการ
      </p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brown-100" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-100">{error}</div>
        ) : receipts.length === 0 ? (
          <div className="p-6 text-sm text-gray-100">ไม่พบใบเสร็จ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-10 text-gray-100">
                <tr>
                  <th className="px-4 py-4 font-medium">เลขใบเสร็จ</th>
                  <th className="px-4 py-4 font-medium">สมาชิก</th>
                  <th className="px-4 py-4 font-medium">มูลค่า</th>
                  <th className="px-4 py-4 font-medium">Reward Point</th>
                  <th className="px-4 py-4 font-medium">ระดับ</th>
                  <th className="px-4 py-4 font-medium">สถานะ</th>
                  <th className="px-4 py-4 font-medium">วันที่ส่ง</th>
                  <th className="px-4 py-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium text-defualt-text">
                      {receipt.receipt_number}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {receipt.user.picture_url ? (
                          <img
                            src={String(receipt.user.picture_url)}
                            alt={receipt.user.display_name}
                            className="size-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-brown-100 text-xs font-medium text-white">
                            {receipt.user.display_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/dashboard/members/${receipt.user.id}`}
                            className="font-medium text-defualt-text hover:text-brown-100"
                          >
                            {receipt.user.display_name}
                          </Link>
                          <p className="text-xs text-gray-100">
                            {displayValue(receipt.user.line_user_id)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-defualt-text">
                      {formatNumber(receipt.amount)} บาท
                    </td>
                    <td className="px-4 py-4 font-medium text-brown-100">
                      {formatNumber(receipt.reward_points)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-brown-yellow-5 px-3 py-1 text-xs font-medium text-brown-100">
                        {receipt.tier.name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StateBadge state={receipt.state} />
                    </td>
                    <td className="px-4 py-4 text-gray-100">
                      {formatDateTime(receipt.create_date)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptId(receipt.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-4xl border border-brown-100 px-4 py-2 text-sm font-medium text-brown-100 transition hover:bg-brown-yellow-5"
                      >
                        <Eye className="size-4" />
                        {receipt.state === "pending" ? "ตรวจสอบ" : "ดูรายละเอียด"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && total > 0 ? (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4">
            <p className="text-sm text-gray-100">
              หน้า {currentPage} จาก {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() =>
                  setOffset((prev) => Math.max(0, prev - PAGE_SIZE))
                }
                className="inline-flex items-center gap-1 rounded-4xl border border-gray-200 px-4 py-2 text-sm text-defualt-text transition hover:bg-gray-10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
                className="inline-flex items-center gap-1 rounded-4xl border border-gray-200 px-4 py-2 text-sm text-defualt-text transition hover:bg-gray-10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ถัดไป
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedReceiptId ? (
        <ReceiptDetailModal
          receiptId={selectedReceiptId}
          onClose={() => setSelectedReceiptId(null)}
          onSuccess={handleSuccess}
        />
      ) : null}
    </div>
  );
}
