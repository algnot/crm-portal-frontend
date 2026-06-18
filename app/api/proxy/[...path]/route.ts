import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_PROXY_TIMEOUT_MS = 30_000;

const getProxyTimeoutMs = () => {
  const raw = process.env.API_PROXY_TIMEOUT_MS ?? process.env.NEXT_PUBLIC_API_TIMEOUT_MS;
  if (!raw) return DEFAULT_PROXY_TIMEOUT_MS;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_PROXY_TIMEOUT_MS;
};

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

const SKIP_RESPONSE_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  "content-encoding",
  "content-length",
]);

const SKIP_REQUEST_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  "cookie",
  "content-length",
  "accept-encoding",
  "x-middleware-subrequest",
]);

async function proxyRequest(request: NextRequest, path: string[]) {
  if (!backendUrl) {
    return NextResponse.json(
      { error: "misconfigured", message: "API URL is not configured." },
      { status: 500 },
    );
  }

  const targetUrl = `${backendUrl}/api/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (SKIP_REQUEST_HEADERS.has(lowerKey)) return;
    if (lowerKey.startsWith("x-forwarded-")) return;
    headers.set(key, value);
  });

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(getProxyTimeoutMs()),
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    if (isTimeout) {
      return NextResponse.json(
        {
          error: "gateway_timeout",
          message: "Backend request timed out. Please try again.",
        },
        { status: 504 },
      );
    }

    throw error;
  }

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    responseHeaders.set(key, value);
  });

  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function withPath(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export const GET = withPath;
export const POST = withPath;
export const PUT = withPath;
export const PATCH = withPath;
export const DELETE = withPath;
