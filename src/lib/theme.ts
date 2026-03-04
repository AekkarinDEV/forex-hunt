import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#00b96b",
    colorBgBase: "#0a0f1a",
    colorBgContainer: "#111827",
    colorBgElevated: "#1a2332",
    colorBgLayout: "#0a0f1a",
    colorText: "#e5e7eb",
    colorTextSecondary: "#9ca3af",
    colorTextTertiary: "#6b7280",
    colorBorder: "#1f2937",
    colorBorderSecondary: "#1f2937",
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorSuccess: "#10b981",
    colorError: "#ef4444",
    colorWarning: "#f59e0b",
    colorInfo: "#3b82f6",
  },
  components: {
    Layout: {
      siderBg: "#111827",
      headerBg: "#111827",
      bodyBg: "#0a0f1a",
      triggerBg: "#1a2332",
    },
    Menu: {
      darkItemBg: "#111827",
      darkItemSelectedBg: "#1a2332",
      darkItemHoverBg: "#1a2332",
      darkItemColor: "#9ca3af",
      darkItemSelectedColor: "#00b96b",
    },
    Card: {
      colorBgContainer: "#111827",
      colorBorderSecondary: "#1f2937",
    },
    Table: {
      colorBgContainer: "#111827",
      headerBg: "#1a2332",
      rowHoverBg: "#1a2332",
      borderColor: "#1f2937",
    },
    Modal: {
      contentBg: "#111827",
      headerBg: "#111827",
    },
    Input: {
      colorBgContainer: "#1a2332",
      colorBorder: "#374151",
      activeBorderColor: "#00b96b",
    },
    InputNumber: {
      colorBgContainer: "#1a2332",
      colorBorder: "#374151",
      activeBorderColor: "#00b96b",
    },
    Select: {
      colorBgContainer: "#1a2332",
      colorBorder: "#374151",
      optionSelectedBg: "#1a2332",
    },
    DatePicker: {
      colorBgContainer: "#1a2332",
      colorBorder: "#374151",
    },
    Button: {
      primaryShadow: "0 2px 8px rgba(0, 185, 107, 0.3)",
    },
    Statistic: {
      colorTextDescription: "#9ca3af",
    },
  },
};

export default theme;
