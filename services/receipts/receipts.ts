import apiClient from "@/services/api-client";
import type {
  ApproveReceiptRequest,
  PortalReceipt,
  ReceiptDetailResponse,
  ReceiptsListParams,
  ReceiptsListResponse,
  RejectReceiptRequest,
  UpdateReceiptRequest,
} from "./types";

const mutationConfig = { skipErrorAlert: true };

const proxyPost = <T>(url: string, data?: unknown) =>
  apiClient.client.post<T>(url, data, {
    ...mutationConfig,
    baseURL: "",
  });

const proxyPut = <T>(url: string, data: unknown) =>
  apiClient.client.put<T>(url, data, {
    ...mutationConfig,
    baseURL: "",
  });

export const getReceipts = async (params: ReceiptsListParams = {}) => {
  const res = await apiClient.client.get<ReceiptsListResponse>(
    "/portal/receipts",
    {
      params: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        ...(params.state ? { state: params.state } : {}),
        ...(params.user_id ? { user_id: params.user_id } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return {
    receipts: res.data.receipts ?? [],
    total: res.data.total ?? 0,
  };
};

export const getReceipt = async (id: number) => {
  const res = await apiClient.client.get<ReceiptDetailResponse>(
    `/portal/receipts/${id}`,
  );
  return res.data.receipt;
};

export const updateReceipt = async (
  id: number,
  payload: UpdateReceiptRequest,
) => {
  const res = await proxyPut<ReceiptDetailResponse>(
    `/api/proxy/portal/receipts/${id}`,
    payload,
  );
  return res.data.receipt;
};

export const approveReceipt = async (
  id: number,
  payload: ApproveReceiptRequest = {},
) => {
  const res = await proxyPost<ReceiptDetailResponse>(
    `/api/proxy/portal/receipts/${id}/approve`,
    payload,
  );
  return res.data.receipt;
};

export const rejectReceipt = async (
  id: number,
  payload: RejectReceiptRequest,
) => {
  const res = await proxyPost<ReceiptDetailResponse>(
    `/api/proxy/portal/receipts/${id}/reject`,
    payload,
  );
  return res.data.receipt;
};

export type {
  ApproveReceiptRequest,
  PortalReceipt,
  ReceiptsListParams,
  ReceiptState,
  RejectReceiptRequest,
  UpdateReceiptRequest,
} from "./types";
