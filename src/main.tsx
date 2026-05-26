import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppAntdProvider } from "./app/providers/AppAntdProvider";
import { AppApolloProvider } from "./app/providers/AppApolloProvider";
import { AuthProvider } from "./app/providers/AuthProvider";
import { DashboardPage } from "./pages/dashboard";
import "./i18n";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReportsPage } from "./pages/reports";
import { CategoriesPage } from "./pages/categories";
import {
  AuthHubPage,
  AuthLayout,
  LoginPage,
  RegisterPage,
  VerifyPage,
} from "./pages/auth";
import ProtectedRoute from "./app/providers/ProtectedRoute";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppAntdProvider>
      <AuthProvider>
        <AppApolloProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
              </Route>
              <Route path="/auth" element={<AuthLayout />}>
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
    </AppAntdProvider>
  </StrictMode>,
);
