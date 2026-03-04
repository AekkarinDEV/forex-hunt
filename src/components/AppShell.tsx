"use client";

import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FolderOutlined,
  CalendarOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";

const { Sider, Content } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/portfolios",
    icon: <FolderOutlined />,
    label: "Portfolios",
  },
  {
    key: "/trades/monthly",
    icon: <CalendarOutlined />,
    label: "Monthly Record",
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const selectedKey =
    menuItems.find((item) => item.key !== "/" && pathname.startsWith(item.key))
      ?.key || (pathname === "/" ? "/" : "/");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          borderRight: "1px solid #1f2937",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #1f2937",
            gap: 8,
          }}
        >
          <LineChartOutlined style={{ fontSize: 24, color: "#00b96b" }} />
          {!collapsed && (
            <span
              style={{
                color: "#e5e7eb",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              ForexHunt
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
        <Content
          style={{
            padding: "24px 32px",
            minHeight: "100vh",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
