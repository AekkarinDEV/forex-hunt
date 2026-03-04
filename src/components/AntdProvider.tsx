"use client";

import React from "react";
import { ConfigProvider, theme as antTheme } from "antd";
import customTheme from "@/lib/theme";

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        ...customTheme,
        algorithm: antTheme.darkAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
