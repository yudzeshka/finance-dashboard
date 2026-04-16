import { Layout, Typography } from "antd";
import { useState } from "react";

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
  const { Header, Sider, Content, Footer } = Layout;
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(false);

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
            <span className="dashboard-sider__logoText">Finance Dashboard</span>
          ) : null}
        </div>

        <div className="dashboard-sider__nav">
          <button className="dashboard-navItem dashboard-navItem--active">
            <span className="dashboard-navItem__icon" aria-hidden>
              📊
            </span>
            {!isSiderCollapsed ? <span>Dashboard</span> : null}
          </button>
          <button className="dashboard-navItem" disabled>
            <span className="dashboard-navItem__icon" aria-hidden>
              📈
            </span>
            {!isSiderCollapsed ? <span>Reports</span> : null}
          </button>
          <button className="dashboard-navItem" disabled>
            <span className="dashboard-navItem__icon" aria-hidden>
              ⚙️
            </span>
            {!isSiderCollapsed ? <span>Settings</span> : null}
          </button>
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
            © {new Date().getFullYear()} Finance Dashboard
          </Typography.Text>
        </Footer>
      </Layout>
    </Layout>
  );
}

