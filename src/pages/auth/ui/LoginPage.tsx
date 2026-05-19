import { useLogin } from "@/features/auth/login";
import { LoginPageView } from "./LoginPageView";

export function LoginPage() {
  const login = useLogin();

  return <LoginPageView {...login} />;
}
