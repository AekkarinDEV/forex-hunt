"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  Popconfirm,
  message,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title } = Typography;

interface Portfolio {
  id: string;
  name: string;
  broker: string | null;
  currency: string;
  totalTrades: number;
  openTrades: number;
  totalPL: number;
  createdAt: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();

  const fetchPortfolios = useCallback(() => {
    setLoading(true);
    fetch("/api/portfolios")
      .then((r) => r.json())
      .then((data) => setPortfolios(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingId
        ? `/api/portfolios/${editingId}`
        : "/api/portfolios";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save");

      message.success(editingId ? "Portfolio updated!" : "Portfolio created!");
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
      fetchPortfolios();
    } catch {
      message.error("Failed to save portfolio");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      message.success("Portfolio deleted");
      fetchPortfolios();
    } catch {
      message.error("Failed to delete portfolio");
    }
  };

  const openEdit = (record: Portfolio) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      broker: record.broker,
      currency: record.currency,
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    {
      title: "Name",
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
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Portfolio) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/portfolios/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this portfolio?"
            description="All trades in this portfolio will be deleted too."
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title
          level={2}
          className="page-title"
          style={{ color: "#e5e7eb", marginBottom: 0 }}
        >
          Portfolios
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          size="large"
        >
          New Portfolio
        </Button>
      </div>

      <Card style={{ border: "1px solid #1f2937" }}>
        {portfolios.length === 0 ? (
          <Empty
            description="No portfolios yet. Create your first one!"
            style={{ padding: 40 }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Create Portfolio
            </Button>
          </Empty>
        ) : (
          <Table
            dataSource={portfolios}
            columns={columns}
            rowKey="id"
            pagination={portfolios.length > 10 ? { pageSize: 10 } : false}
          />
        )}
      </Card>

      <Modal
        title={editingId ? "Edit Portfolio" : "New Portfolio"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        okText={editingId ? "Save" : "Create"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ currency: "USD" }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Portfolio Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="e.g. Main Account" />
          </Form.Item>
          <Form.Item name="broker" label="Broker">
            <Input placeholder="e.g. OANDA, IC Markets" />
          </Form.Item>
          <Form.Item name="currency" label="Base Currency">
            <Select>
              {CURRENCIES.map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
