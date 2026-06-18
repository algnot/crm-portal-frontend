import dialog from "@/components/util/dialog";
import axios from "axios";
import Swal from "sweetalert2";

export type AppError = {
  message: string;
  status?: number;
  raw: unknown;
};

const isAppError = (error: unknown): error is AppError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { message?: unknown; raw?: unknown };
  return typeof candidate.message === "string" && "raw" in candidate;
};

export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as Record<string, unknown> | undefined;

    const serverMessage =
      typeof body === "string"
        ? body
        : ((body?.message as string | undefined) ??
          (body?.error as string | undefined));

    const message =
      serverMessage ??
      (error.code === "ECONNABORTED"
        ? "Request timed out. Please try again."
        : !error.response
          ? "Network error. Please check your connection."
          : `Request failed with status ${status}.`);

    return { message, status, raw: error };
  }

  if (error instanceof Error) {
    return { message: error.message, raw: error };
  }

  return { message: "An unexpected error occurred.", raw: error };
}

export async function showErrorAlert(error: unknown, title = "เกิดข้อผิดพลาด") {
  const { message } = handleError(error);

  dialog.fire({
    title,
    description: message,
    confirmText: "ตกลง",
    confirmVariant: "danger",
    showCancel: false,
  });
}
