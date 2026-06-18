export type ReceiptState = "pending" | "approved" | "rejected";

export type ReceiptTier = {
  id: number;
  code: string;
  name: string;
  convert_points: number;
};

export type ReceiptUser = {
  id: number;
  display_name: string;
  line_user_id: string;
  picture_url?: string | false;
  phone?: string | false;
  email?: string | false;
};

export type ReceiptReviewer = {
  id: number;
  name: string;
};

export type ReceiptPoint = {
  id: number;
  value: number;
  currency_name?: string;
} | false;

export type PortalReceipt = {
  id: number;
  receipt_number: string;
  receipt_image_url: string | false;
  amount: number;
  state: ReceiptState;
  reward_points: number;
  tier_convert_points: number;
  tier: ReceiptTier;
  user: ReceiptUser;
  reviewed_by: ReceiptReviewer | string | false;
  reviewed_date?: string | false;
  reject_reason?: string | false;
  spending_point: ReceiptPoint;
  reward_point: ReceiptPoint;
  create_date?: string | false;
  submitted_date?: string | false;
};

export type ReceiptsListParams = {
  state?: ReceiptState;
  user_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

export type ReceiptsListResponse = {
  receipts: PortalReceipt[];
  total: number;
};

export type ReceiptDetailResponse = {
  receipt: PortalReceipt;
};

export type UpdateReceiptRequest = {
  amount?: number;
  reject_reason?: string;
};

export type ApproveReceiptRequest = {
  amount?: number;
};

export type RejectReceiptRequest = {
  reject_reason: string;
};
