import { Button, Layout, Typography } from "antd";
import { useState } from "react";
import { LangSwitcher } from "../../langSwitcher";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { LogoutOutlined } from "@ant-design/icons";

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
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(false);

  const { session, nhost } = useAuth();
  const navigate = useNavigate();

  const userLabel = user?.displayName || user?.email || "Guest";

  const handleSignOut = async () => {
    try {
      if (session) {
        await nhost.auth.signOut({
          refreshToken: session.refreshToken,
        });
      }
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
        collapsed={isSiderCollapsed}
        collapsible
        onCollapse={(collapsed) => setIsSiderCollapsed(collapsed)}
        width={240}
      >
        <div className="dashboard-sider__logo">
          <span className="dashboard-sider__logoMark">FD</span>
          {!isSiderCollapsed ? (
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
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              📊
            </span>
            {!isSiderCollapsed ? <span>{t("dashboard")}</span> : null}
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              📈
            </span>
            {!isSiderCollapsed ? <span>{t("reports")}</span> : null}
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              🏷️
            </span>
            {!isSiderCollapsed ? <span>{t("categories")}</span> : null}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `dashboard-navItem${isActive ? " dashboard-navItem--active" : ""}`
            }
          >
            <span className="dashboard-navItem__icon" aria-hidden>
              ⚙️
            </span>
            {!isSiderCollapsed ? <span>{t("settings")}</span> : null}
          </NavLink>
        </div>
        <div className="dashboard-sider__user">
          {!isSiderCollapsed ? (
            <div className="dashboard-sider__userName">{userLabel}</div>
          ) : null}
          <Button
            type="text"
            className="dashboard-sider__userButton"
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            title={t("logout")}
          >
            {!isSiderCollapsed ? t("logout") : null}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header className="dashboard-header">
          <div className="dashboard-header__left">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {subtitle ? (
              <Typography.Text type="secondary">{subtitle}</Typography.Text>
            ) : null}
          </div>

          <div className="dashboard-header__right">{primaryAction}</div>
        </Header>

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
