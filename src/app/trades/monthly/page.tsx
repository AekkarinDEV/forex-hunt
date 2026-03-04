"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Calendar,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Table,
  Spin,
  Badge,
  Tooltip,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  SwapOutlined,
  TrophyOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;

interface DailyData {
  trades: number;
  profitLoss: number;
}

interface TradeSummary {
  id: string;
  pair: string;
  direction: string;
  profitLoss: number | null;
  status: string;
  openedAt: string;
  portfolio: { name: string };
}

interface MonthlyResponse {
  trades: TradeSummary[];
  dailyMap: Record<string, DailyData>;
  summary: {
    totalPL: number;
    totalTrades: number;
    winTrades: number;
    lossTrades: number;
    winRate: number;
  };
}

export default function MonthlyRecordPage() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [data, setData] = useState<MonthlyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback((date: Dayjs) => {
    setLoading(true);
    fetch(`/api/trades/monthly?year=${date.year()}&month=${date.month() + 1}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const onPanelChange = (value: Dayjs) => {
    setCurrentDate(value);
  };

  const getColorForPL = (pl: number): string => {
    if (pl > 100) return "#10b981";
    if (pl > 0) return "#34d399";
    if (pl === 0) return "#6b7280";
    if (pl > -100) return "#f87171";
    return "#ef4444";
  };

  const getBgForPL = (pl: number): string => {
    if (pl > 100) return "rgba(16, 185, 129, 0.2)";
    if (pl > 0) return "rgba(52, 211, 153, 0.12)";
    if (pl === 0) return "transparent";
    if (pl > -100) return "rgba(248, 113, 113, 0.12)";
    return "rgba(239, 68, 68, 0.2)";
  };

  const dateCellRender = (value: Dayjs) => {
    if (!data) return null;
    const dateStr = value.format("YYYY-MM-DD");
    const dayData = data.dailyMap[dateStr];
    if (!dayData) return null;

    return (
      <Tooltip
        title={
          <div>
            <div>
              {dayData.trades} trade{dayData.trades > 1 ? "s" : ""}
            </div>
            <div>
              P/L: {dayData.profitLoss >= 0 ? "+" : ""}
              {dayData.profitLoss.toFixed(2)}
            </div>
          </div>
        }
      >
        <div
          className="heat-map-cell"
          style={{
            background: getBgForPL(dayData.profitLoss),
            padding: "2px 6px",
            borderRadius: 6,
            textAlign: "center",
            marginTop: 2,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: getColorForPL(dayData.profitLoss),
            }}
          >
            {dayData.profitLoss >= 0 ? "+" : ""}
            {dayData.profitLoss.toFixed(0)}
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>
            {dayData.trades} trade{dayData.trades > 1 ? "s" : ""}
          </div>
        </div>
      </Tooltip>
    );
  };

  const summary = data?.summary;

  const tradeColumns = [
    {
      title: "Date",
      dataIndex: "openedAt",
      key: "openedAt",
      render: (d: string) => dayjs(d).format("DD MMM HH:mm"),
    },
    {
      title: "Portfolio",
      key: "portfolio",
      render: (_: unknown, record: TradeSummary) => (
        <Tag>{record.portfolio.name}</Tag>
      ),
    },
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
  ];

  if (loading && !data) {
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
        Monthly Record
      </Title>

      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            {
              title: "Monthly P/L",
              value: summary.totalPL,
              precision: 2,
              prefix: <DollarOutlined />,
              color: summary.totalPL >= 0 ? "#10b981" : "#ef4444",
              suffix:
                summary.totalPL >= 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                ),
            },
            {
              title: "Total Trades",
              value: summary.totalTrades,
              prefix: <SwapOutlined />,
              color: "#3b82f6",
            },
            {
              title: "Win / Loss",
              value: `${summary.winTrades}`,
              suffix: ` / ${summary.lossTrades}`,
              prefix: <TrophyOutlined />,
              color: "#8b5cf6",
            },
            {
              title: "Win Rate",
              value: summary.winRate,
              suffix: "%",
              prefix: <PercentageOutlined />,
              color: "#f59e0b",
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
      )}

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>Calendar Heat Map</span>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <Badge
                color="#10b981"
                text={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Profit
                  </Text>
                }
              />
              <Badge
                color="#ef4444"
                text={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Loss
                  </Text>
                }
              />
            </div>
          </div>
        }
        style={{ border: "1px solid #1f2937", marginBottom: 24 }}
        styles={{ header: { borderBottom: "1px solid #1f2937" } }}
      >
        <Calendar
          fullscreen
          value={currentDate}
          onPanelChange={onPanelChange}
          cellRender={(current, info) => {
            if (info.type === "date") return dateCellRender(current);
            return null;
          }}
        />
      </Card>

      <Card
        title={`Trades in ${currentDate.format("MMMM YYYY")}`}
        style={{ border: "1px solid #1f2937" }}
        styles={{ header: { borderBottom: "1px solid #1f2937" } }}
      >
        <Table
          dataSource={data?.trades || []}
          columns={tradeColumns}
          rowKey="id"
          pagination={
            (data?.trades?.length ?? 0) > 15 ? { pageSize: 15 } : false
          }
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
