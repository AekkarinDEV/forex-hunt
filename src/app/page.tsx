"use client";

import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Spin,
  Empty,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FolderOutlined,
  SwapOutlined,
  TrophyOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title } = Typography;

interface PortfolioSummary {
  id: string;
  name: string;
  broker: string | null;
  currency: string;
  totalTrades: number;
  openTrades: number;
  totalPL: number;
}

export default function DashboardPage() {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/portfolios")
      .then((r) => r.json())
      .then((data) => setPortfolios(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPL = portfolios.reduce((s, p) => s + p.totalPL, 0);
  const totalTrades = portfolios.reduce((s, p) => s + p.totalTrades, 0);
  const totalOpen = portfolios.reduce((s, p) => s + p.openTrades, 0);

  const stats = [
    {
      title: "Total P/L",
      value: totalPL,
      prefix: <DollarOutlined />,
      precision: 2,
      color: totalPL >= 0 ? "#10b981" : "#ef4444",
      suffix: totalPL >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
    },
    {
      title: "Portfolios",
      value: portfolios.length,
      prefix: <FolderOutlined />,
      color: "#3b82f6",
    },
    {
      title: "Total Trades",
      value: totalTrades,
      prefix: <SwapOutlined />,
      color: "#8b5cf6",
    },
    {
      title: "Open Trades",
      value: totalOpen,
      prefix: <TrophyOutlined />,
      color: "#f59e0b",
    },
  ];

  const columns = [
    {
      title: "Portfolio",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: "Broker",
      dataIndex: "broker",
      key: "broker",
      render: (v: string | null) => v || "—",
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Trades",
      dataIndex: "totalTrades",
      key: "totalTrades",
    },
    {
      title: "Open",
      dataIndex: "openTrades",
      key: "openTrades",
      render: (v: number) =>
        v > 0 ? <Tag color="orange">{v}</Tag> : <span>0</span>,
    },
    {
      title: "P/L",
      dataIndex: "totalPL",
      key: "totalPL",
      render: (v: number) => (
        <span className={v > 0 ? "profit" : v < 0 ? "loss" : "neutral"}>
          {v >= 0 ? "+" : ""}
          {v.toFixed(2)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} className="page-title" style={{ color: "#e5e7eb" }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              className="stat-card"
              style={{
                borderTop: `3px solid ${stat.color}`,
                border: "1px solid #1f2937",
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="Portfolio Overview"
        style={{ border: "1px solid #1f2937" }}
        styles={{ header: { borderBottom: "1px solid #1f2937" } }}
      >
        {portfolios.length === 0 ? (
          <Empty
            description="No portfolios yet. Create your first one!"
            style={{ padding: 40 }}
          />
        ) : (
          <Table
            dataSource={portfolios}
            columns={columns}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => router.push(`/portfolios/${record.id}`),
              style: { cursor: "pointer" },
            })}
          />
        )}
      </Card>
    </div>
  );
}
