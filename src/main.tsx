import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { apolloClient } from "./app/providers/apollo";
import { ApolloProvider } from "@apollo/client/react";
import { DashboardPage } from "./pages/dashboard";
import "./i18n";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReportsPage } from "./pages/reports";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient()}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
