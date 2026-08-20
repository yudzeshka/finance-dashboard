export type Language = 'en' | 'ru';

export type Currency = 'USD' | 'RUB' | 'EUR' | 'BYN';

export interface AppearanceSettings {
  language: Language;
  currency: Currency;
}

export interface ProfileFormValues {
  displayName: string;
}

export interface SecurityFormValues {
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteConfirmValues {
  confirmText: string;
}
