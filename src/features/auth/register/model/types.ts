import type { FormEvent } from "react";

export type UseRegisterResult = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirm: boolean;
  isSubmitting: boolean;
  success: boolean;
  error: string | null;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirm: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};
