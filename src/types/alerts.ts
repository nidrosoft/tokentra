export type AlertType = 
  | "spend_threshold"
  | "spend_anomaly"
  | "budget_threshold"
  | "forecast_exceeded"
  | "provider_error"
  | "usage_spike";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "active" | "acknowledged" | "resolved";

export type AlertChannelType = "email" | "slack" | "pagerduty" | "webhook";

export interface Alert {
  id: string;
  organizationId: string;
  name: string;
  type: AlertType;
  condition: AlertCondition;
  channels: AlertChannel[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: "gt" | "gte" | "lt" | "lte" | "eq";
  value: number;
  timeWindow?: string;
}

export interface AlertChannel {
  type: AlertChannelType;
  config: Record<string, string>;
}

export interface AlertEvent {
  id: string;
  alertId: string;
  organizationId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  metadata?: Record<string, unknown>;
}
