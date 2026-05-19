export type UseVerifyResult = {
  error: string | null;
  urlParams: Record<string, string>;
  status: "verifying" | "success" | "error";
};
