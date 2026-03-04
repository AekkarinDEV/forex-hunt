"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Typography,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Spin,
  DatePicker,
  Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  SwapOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Trade {
  id: string;
  pair: string;
  direction: "BUY" | "SELL";
  lotSize: number;
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  profitLoss: number | null;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
}

interface Portfolio {
  id: string;
  name: string;
  broker: string | null;
  currency: string;
  trades: Trade[];
}

const FOREX_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "NZD/USD",
  "USD/CAD",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
  "AUD/JPY",
  "EUR/AUD",
  "GBP/AUD",
  "EUR/CAD",
  "GBP/CAD",
  "XAU/USD",
  "XAG/USD",
];

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [form] = Form.useForm();

  const fetchPortfolio = useCallback(() => {
    setLoading(true);
    fetch(`/api/portfolios/${portfolioId}`)
      .then((r) => r.json())
      .then(setPortfolio)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [portfolioId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        portfolioId,
        openedAt: values.openedAt?.toISOString(),
      };

      const url = editingTrade
        ? `/api/trades/${editingTrade.id}`
        : "/api/trades";
      const method = editingTrade ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      message.success(editingTrade ? "Trade updated!" : "Trade recorded!");
      setModalOpen(false);
      setEditingTrade(null);
      form.resetFields();
      fetchPortfolio();
    } catch {
      message.error("Failed to save trade");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/trades/${id}`, { method: "DELETE" });
      message.success("Trade deleted");
      fetchPortfolio();
    } catch {
      message.error("Failed to delete");
    }
  };

  const openEdit = (trade: Trade) => {
    setEditingTrade(trade);
    form.setFieldsValue({
      pair: trade.pair,
      direction: trade.direction,
      lotSize: trade.lotSize,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      notes: trade.notes,
      openedAt: dayjs(trade.openedAt),
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingTrade(null);
    form.resetFields();
    form.setFieldsValue({ openedAt: dayjs() });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!portfolio) {
    return <Title level={3}>Portfolio not found</Title>;
  }

  const trades = portfolio.trades;
  const totalPL = trades.reduce((s, t) => s + (t.profitLoss ?? 0), 0);
  const openTrades = trades.filter((t) => t.status === "OPEN").length;
  const closedTrades = trades.filter((t) => t.status === "CLOSED").length;
  const winTrades = trades.filter((t) => (t.profitLoss ?? 0) > 0).length;
  const winRate =
    closedTrades > 0 ? ((winTrades / closedTrades) * 100).toFixed(1) : "0";

  const columns = [
    {
      title: "Pair",
      dataIndex: "pair",
      key: "pair",
      render: (pair: string) => <Tag color="cyan">{pair}</Tag>,
    },
    {
      title: "Direction",
      dataIndex: "direction",
      key: "direction",
      render: (d: string) => (
        <Tag color={d === "BUY" ? "green" : "red"}>
          {d === "BUY" ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {d}
        </Tag>
      ),
    },
    {
      title: "Lot",
      dataIndex: "lotSize",
      key: "lotSize",
    },
    {
      title: "Entry",
      dataIndex: "entryPrice",
      key: "entryPrice",
      render: (v: number) => v.toFixed(5),
    },
    {
      title: "Exit",
      dataIndex: "exitPrice",
      key: "exitPrice",
      render: (v: number | null) => (v != null ? v.toFixed(5) : "—"),
    },
    {
      title: "P/L",
      dataIndex: "profitLoss",
      key: "profitLoss",
      render: (v: number | null) =>
        v != null ? (
          <span className={v > 0 ? "profit" : v < 0 ? "loss" : "neutral"}>
            {v >= 0 ? "+" : ""}
            {v.toFixed(2)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const colorMap: Record<string, string> = {
          OPEN: "orange",
          CLOSED: "green",
          CANCELLED: "default",
        };
        return <Tag color={colorMap[s]}>{s}</Tag>;
      },
    },
    {
      title: "Opened",
      dataIndex: "openedAt",
      key: "openedAt",
      render: (d: string) => dayjs(d).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Trade) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this trade?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link href="/portfolios">Portfolios</Link> },
          { title: portfolio.name },
        ]}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ color: "#e5e7eb", marginBottom: 4 }}>
            {portfolio.name}
          </Title>
          <Text type="secondary">
            {portfolio.broker || "No broker"} · {portfolio.currency}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          size="large"
        >
          Record Trade
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Total P/L",
            value: totalPL,
            precision: 2,
            prefix: <DollarOutlined />,
            color: totalPL >= 0 ? "#10b981" : "#ef4444",
            suffix: totalPL >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
          },
          {
            title: "Total Trades",
            value: trades.length,
            prefix: <SwapOutlined />,
            color: "#3b82f6",
          },
          {
            title: "Open Trades",
            value: openTrades,
            prefix: <TrophyOutlined />,
            color: "#f59e0b",
          },
          {
            title: "Win Rate",
            value: parseFloat(winRate),
            suffix: "%",
            prefix: <CheckCircleOutlined />,
            color: "#8b5cf6",
          },
        ].map((stat, i) => (
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
        title="Trade History"
        style={{ border: "1px solid #1f2937" }}
        styles={{ header: { borderBottom: "1px solid #1f2937" } }}
      >
        <Table
          dataSource={trades}
          columns={columns}
          rowKey="id"
          pagination={trades.length > 15 ? { pageSize: 15 } : false}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={editingTrade ? "Edit Trade" : "Record Trade"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingTrade(null);
          form.resetFields();
        }}
        okText={editingTrade ? "Save" : "Record"}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pair"
                label="Currency Pair"
                rules={[{ required: true, message: "Select a pair" }]}
              >
                <Select
                  showSearch
                  placeholder="Select pair"
                  options={FOREX_PAIRS.map((p) => ({ value: p, label: p }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="direction"
                label="Direction"
                rules={[{ required: true, message: "Select direction" }]}
              >
                <Select
                  options={[
                    { value: "BUY", label: "BUY ↑" },
                    { value: "SELL", label: "SELL ↓" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="lotSize"
                label="Lot Size"
                rules={[{ required: true, message: "Enter lot size" }]}
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  style={{ width: "100%" }}
                  placeholder="0.01"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="entryPrice"
                label="Entry Price"
                rules={[{ required: true, message: "Enter entry price" }]}
              >
                <InputNumber
                  min={0}
                  step={0.00001}
                  style={{ width: "100%" }}
                  placeholder="1.08500"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="exitPrice" label="Exit Price">
                <InputNumber
                  min={0}
                  step={0.00001}
                  style={{ width: "100%" }}
                  placeholder="Leave empty if open"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="stopLoss" label="Stop Loss">
                <InputNumber min={0} step={0.00001} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="takeProfit" label="Take Profit">
                <InputNumber min={0} step={0.00001} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="openedAt" label="Opened At">
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={3}
              placeholder="Trade notes, strategy, observations..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
