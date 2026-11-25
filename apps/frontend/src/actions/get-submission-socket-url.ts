"use server";

export async function getSubmissionSocketUrl(
  submissionId: string
): Promise<string> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_BACKEND_URL must be configured for submission sockets."
    );
  }

  const socketUrl = new URL(
    `/api/v1/submission/${encodeURIComponent(submissionId)}/ws`,
    backendUrl
  );
  socketUrl.protocol = socketUrl.protocol === "https:" ? "wss:" : "ws:";

  return socketUrl.toString();
}
