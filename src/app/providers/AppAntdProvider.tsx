import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

const antdTheme = {
  token: {
    colorPrimary: "#aa3bff",
    borderRadius: 10,
    borderRadiusLG: 10,
    fontFamily:
      'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      primaryShadow: "none",
    },
  },
};

type AppAntdProviderProps = {
  children: ReactNode;
};

export function AppAntdProvider({ children }: AppAntdProviderProps) {
  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}
