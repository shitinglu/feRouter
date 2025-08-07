export interface RouteConfig {
  id: string;
  applicationId: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'ALL';
  configType: 'REDIRECT' | 'OSS';
  priority: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface RedirectConfig {
  id: string;
  routeId: string;
  targetUrl: string;
  statusCode: number;
  queryForward: boolean;
  headers?: Record<string, any>;
}

export interface OssConfig {
  id: string;
  routeId: string;
  bucket: string;
  objectKey: string;
  region?: string;
  endpoint?: string;
  cacheControl?: string;
  contentType?: string;
  headers?: Record<string, any>;
}

export interface RouteListResponse {
  success: boolean;
  data: {
    routes: RouteConfig[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
} 