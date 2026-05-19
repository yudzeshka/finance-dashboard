import { useVerify } from "@/features/auth/verify/model/useVerify";
import { VerifyPageView } from "./VerifyPageView";

export function VerifyPage() {
  const verify = useVerify();
  return <VerifyPageView {...verify} />;
}
