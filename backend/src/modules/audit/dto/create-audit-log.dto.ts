import { AuditEventType } from '@prisma/client';

export class CreateAuditLogDto {
  eventType: AuditEventType;
  resource: string;
  resourceId?: string;
  action: string;
  description?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
}
