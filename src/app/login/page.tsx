"use client";

import { useState } from "react";
import { Button, Input, Typography, message, Card } from "antd";
import { LockOutlined, LineChartOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AntdProvider from "@/components/AntdProvider";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        message.error("Wrong password");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AntdProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)",
          padding: 24,
        }}
      >
        <Card
          style={{
            width: 400,
            border: "1px solid #1f2937",
            background: "#111827",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <LineChartOutlined
              style={{ fontSize: 48, color: "#00b96b", marginBottom: 16 }}
            />
            <Title level={2} style={{ color: "#e5e7eb", marginBottom: 4 }}>
              ForexHunt
            </Title>
            <Text type="secondary">Enter your password to continue</Text>
          </div>

          <Input.Password
            size="large"
            prefix={<LockOutlined style={{ color: "#6b7280" }} />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
            style={{ marginBottom: 16 }}
          />

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleLogin}
          >
            Unlock
          </Button>
        </Card>
      </div>
    </AntdProvider>
  );
}
