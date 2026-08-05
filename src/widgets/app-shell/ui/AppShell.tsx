import { Button, Layout, Tag, Typography } from "antd";
import { useState } from "react";
import { LangSwitcher } from "../../langSwitcher";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { purgeApolloCache } from "../../../app/providers/apollo";
import { useOnlineStatus } from "../../../shared/lib/useOnlineStatus";
import { useOfflineQueue } from "../../../shared/lib/offlineQueue";
import { LogoutOutlined, MenuOutlined, WifiOutlined } from "@ant-design/icons";
import { useMedia } from "@/shared/hooks/useMedia";

const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const IconReports = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 5-6" />
  </svg>
);
const IconCategories = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.2" />
  </svg>
);
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

type AppShellProps = {
  title: string;
  subtitle?: string;
  primaryAction?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  primaryAction,
  children,
}: AppShellProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { Header, Sider, Content, Footer } = Layout;
  const { isMobile } = useMedia();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session, nhost } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const pendingCount = useOfflineQueue((s) => s.queue.length);

  const userLabel = user?.displayName || user?.email || "Guest";

  const handleSignOut = async () => {
    try {
      if (session) {
        await nhost.auth.signOut({
          refreshToken: session.refreshToken,
        });
      }
      await purgeApolloCache();
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error signing out:", message);
    }
  };

  return (
    <Layout className="dashboard-shell">
      <Sider
        className="aurora-sider"
        collapsed={isMobile ? !mobileOpen : false}
        collapsible={isMobile}
        collapsedWidth={0}
        trigger={null}
        width={240}
      >
        <div className="aurora-sider__logo">
          <span className="aurora-sider__orb" aria-hidden="true" />
          <span className="aurora-sider__logoMark">FD</span>
          {(!isMobile || mobileOpen) ? (
            <span className="aurora-sider__logoText">{t("financeDashboard")}</span>
          ) : null}
        </div>
        <nav className="aurora-sider__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
            }
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <span className="aurora-navItem__icon"><IconDashboard /></span>
            {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("dashboard")}</span> : null}
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
            }
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <span className="aurora-navItem__icon"><IconReports /></span>
            {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("reports")}</span> : null}
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
            }
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <span className="aurora-navItem__icon"><IconCategories /></span>
            {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("categories")}</span> : null}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `aurora-navItem${isActive ? " aurora-navItem--active" : ""}`
            }
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <span className="aurora-navItem__icon"><IconSettings /></span>
            {(!isMobile || mobileOpen) ? <span className="aurora-navItem__label">{t("settings")}</span> : null}
          </NavLink>
        </nav>
        <div className="aurora-sider__userCard">
          <span className="aurora-sider__avatar">{userLabel}</span>
          {(!isMobile || mobileOpen) ? (
            <span className="aurora-sider__userMeta">
              <span className="aurora-sider__userName">{userLabel}</span>
              <Button
                type="text"
                size="small"
                className="aurora-sider__logoutBtn"
                icon={<LogoutOutlined />}
                onClick={handleSignOut}
              />
            </span>
          ) : null}
        </div>
      </Sider>

      <Layout>
        {isMobile && mobileOpen ? (
          <div
            className="aurora-sider-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        ) : null}
        <Header className="dashboard-header">
          <div className="dashboard-header__left">
            {isMobile && !mobileOpen ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                className="dashboard-header__hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label={t("menu")}
              />
            ) : null}
            <div className="dashboard-header__titles">
              <Typography.Title level={3} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
              {subtitle ? (
                <Typography.Text type="secondary">{subtitle}</Typography.Text>
              ) : null}
            </div>
          </div>

          <div className="dashboard-header__right">{primaryAction}</div>
        </Header>

        {!isOnline && (
          <div
            style={{
              background: "#fff7e6",
              borderBottom: "1px solid #ffd591",
              padding: "6px 24px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#ad6800",
            }}
          >
            <WifiOutlined />
            <span>You're offline.</span>
            {pendingCount > 0 && (
              <span>
                · {pendingCount} change{pendingCount > 1 ? "s" : ""} pending
              </span>
            )}
          </div>
        )}

        {isOnline && pendingCount > 0 && (
          <div
            style={{
              background: "#e6f7ff",
              borderBottom: "1px solid #91d5ff",
              padding: "4px 24px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#0050b3",
            }}
          >
            <Tag color="processing" style={{ margin: 0 }}>
              {pendingCount}
            </Tag>
            <span>
              change{pendingCount > 1 ? "s" : ""} pending sync
            </span>
          </div>
        )}

        <Content className="dashboard-content">
          <div className="dashboard-contentInner">{children}</div>
        </Content>

        <Footer className="dashboard-footer">
          <Typography.Text type="secondary">
            © {new Date().getFullYear()} {t("financeDashboard")}
          </Typography.Text>
          <LangSwitcher.Widget />
        </Footer>
      </Layout>
    </Layout>
  );
}
