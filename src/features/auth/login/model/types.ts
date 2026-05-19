import type { FormEvent } from "react";

export type UseLoginResult = {
  email: string;
  password: string;
  showPassword: boolean;
  isSubmitting: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};
