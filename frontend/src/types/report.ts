export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ReportTargetType = 'RESOURCE' | 'RESOURCE_POST' | 'CHANNEL_POST';

export interface Report {
  id: number;
  reporterId: number;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: number;
  targetTitle?: string;
  reason: string;
  status: ReportStatus;
  resolvedBy: number | null;
  resolvedByName: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface CreateReportRequest {
  reason: string;
  targetType: ReportTargetType;
  targetId: number;
}

export interface ResolveReportRequest {
  action: 'resolve' | 'dismiss';
}
