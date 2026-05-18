import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppAntdProvider } from "./app/providers/AppAntdProvider";
import { apolloClient } from "./app/providers/apollo";
import { ApolloProvider } from "@apollo/client/react";
import { DashboardPage } from "./pages/dashboard";
import "./i18n";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReportsPage } from "./pages/reports";
import {
  AuthHubPage,
  AuthLayout,
  LoginPage,
  RegisterPage,
} from "./pages/auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient()}>
      <AppAntdProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<AuthHubPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AppAntdProvider>
    </ApolloProvider>
  </StrictMode>,
);
