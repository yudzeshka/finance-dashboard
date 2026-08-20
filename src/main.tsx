import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppAntdProvider } from "./app/providers/AppAntdProvider";
import { AppApolloProvider } from "./app/providers/AppApolloProvider";
import { AuthProvider } from "./app/providers/AuthProvider";
import { CurrencyRatesProvider } from "./app/providers/CurrencyRatesProvider";
import { DashboardPage } from "./pages/dashboard";
import "./i18n";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReportsPage } from "./pages/reports";
import { CategoriesPage } from "./pages/categories";
import { SettingsPage } from "./pages/settings";
import {
  AuthHubPage,
  AuthLayout,
  LoginPage,
  RegisterPage,
  VerifyPage,
} from "./pages/auth";
import ProtectedRoute from "./app/providers/ProtectedRoute";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppAntdProvider>
      <CurrencyRatesProvider>
        <AuthProvider>
          <AppApolloProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                  <Route path="/reports" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
                  <Route path="/categories" element={<ErrorBoundary><CategoriesPage /></ErrorBoundary>} />
                  <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                </Route>
                <Route path="/auth" element={<ErrorBoundary><AuthLayout /></ErrorBoundary>}>
                  <Route index element={<AuthHubPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="verify" element={<VerifyPage />} />
                </Route>
                <Route path="/verify" element={<VerifyPage />} />
              </Routes>
            </BrowserRouter>
          </AppApolloProvider>
        </AuthProvider>
      </CurrencyRatesProvider>
    </AppAntdProvider>
  </StrictMode>,
);
