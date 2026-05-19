import { useRegister } from "@/features/auth/register";
import { RegisterPageView } from "./RegisterPageView";

export function RegisterPage() {
 const register = useRegister();
  return <RegisterPageView {...register} />;
}
