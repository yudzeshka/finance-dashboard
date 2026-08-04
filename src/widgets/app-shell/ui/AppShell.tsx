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
        className="dashboard-sider"
        collapsed={isMobile ? !mobileOpen : false}
        collapsible={isMobile}
        collapsedWidth={0}
        trigger={null}
        width={240}
      >
        <div className="dashboard-sider__logo">
          <span className="dashboard-sider__logoMark">FD</span>
          {(!isMobile || mobileOpen) ? (
            <span className="dashboard-sider__logoText">
              {t("financeDashboard")}
            </span>
          ) : null}
        </div>
        <div className="dashboard-sider__nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              📊
            </span>
            {(!isMobile || mobileOpen) ? <span>{t("dashboard")}</span> : null}
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              📈
            </span>
            {(!isMobile || mobileOpen) ? <span>{t("reports")}</span> : null}
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              🏷️
            </span>
            {(!isMobile || mobileOpen) ? <span>{t("categories")}</span> : null}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
            onClick={() => {
              if (isMobile) setMobileOpen(false);
            }}
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              ⚙️
            </span>
            {(!isMobile || mobileOpen) ? <span>{t("settings")}</span> : null}
          </NavLink>
        </div>
        <div className="dashboard-sider__user">
          {(!isMobile || mobileOpen) ? (
            <div className="dashboard-sider__userName">{userLabel}</div>
          ) : null}
          <Button
            type="text"
            className="dashboard-sider__userButton"
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            title={t("logout")}
          >
            {(!isMobile || mobileOpen) ? t("logout") : null}
          </Button>
        </div>
      </Sider>

      <Layout>
        {isMobile && mobileOpen ? (
          <div
            className="dashboard-sider-overlay"
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
