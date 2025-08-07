"use client"
import { useState, useEffect, useMemo } from 'react';
import type { TableColumnsType } from 'antd';
import { Badge, Dropdown, Space, Table, Button, Input, Select, message, Modal, Tag, Descriptions } from 'antd';
// import { SearchOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons';
import axios from 'axios';
import AddRouteDrawer from './AddRouteDrawer';

const { Search } = Input;
const { Option } = Select;

interface RouteData {
  id: string;
  name: string;
  path: string;
  method: string;
  configType: 'REDIRECT' | 'OSS';
  status: 'ACTIVE' | 'INACTIVE'; // 路由级别状态
  versionStatus: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'TESTING'; // 版本状态
  priority: number;
  description: string;
  targetUrl?: string;
  ossPath?: string;
  ossBucket?: string;
  statusCode?: number;
  publishedAt?: string;
  publishedBy?: string;
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface TableListProps {
  appId: string;
}

// 添加部署记录接口定义
interface DeployRecord {
  id: string;
  version: string;
  action: 'DEPLOY' | 'UNPUBLISH' | 'ROLLBACK';
  description?: string;
  createdAt: string;
  createdBy: string;
  createdByName?: string;
  configData?: any;
}

// 添加操作记录接口定义
interface OperationLog {
  id: string;
  action: string;
  details: any;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  ipAddress?: string;
  userAgent?: string;
}

// 添加版本接口定义
interface RouteVersion {
  id: string;
  version: string;
  configType: 'REDIRECT' | 'OSS';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'TESTING';
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  baseVersionId?: string;
  targetUrl?: string;
  statusCode?: number;
  bucket?: string;
  objectKey?: string;
  region?: string;
}

const TableList = ({ appId }: TableListProps) => {
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    configType: '',
    keyword: ''
  });
  
  // 添加部署记录相关状态
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [deployRecords, setDeployRecords] = useState<DeployRecord[]>([]);
  const [deployLoading, setDeployLoading] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState<string>('');
  
  // 添加编辑路由相关状态
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);

  // 添加操作记录相关状态
  const [operationModalVisible, setOperationModalVisible] = useState(false);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // 添加版本管理相关状态
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [versions, setVersions] = useState<RouteVersion[]>([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [currentRouteInfo, setCurrentRouteInfo] = useState<any>(null);

  // 获取路由列表
  const fetchRoutes = async (params: any = {}) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      searchParams.append('page', params.page?.toString() || pagination.page.toString());
      searchParams.append('pageSize', params.pageSize?.toString() || pagination.pageSize.toString());
      
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.configType) searchParams.append('configType', filters.configType);
      if (filters.keyword) searchParams.append('keyword', filters.keyword);
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          searchParams.set(key, params[key].toString());
        }
      });

      const response = await axios.get(`/api/applications/${appId}/routes?${searchParams}`);
      
      if (response.data.success) {
        setRoutes(response.data.data.routes);
        setPagination(response.data.data.pagination);
        setExpandedRowKeys(response.data.data.routes.map((route: RouteData) => route.id));
      } else {
        message.error(response.data.message || '获取路由列表失败');
      }
    } catch (error) {
      console.error('获取路由列表失败:', error);
      message.error('获取路由列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchRoutes();
  }, [appId]);

  // 搜索处理
  const handleSearch = (keyword: string) => {
    setFilters(prev => ({ ...prev, keyword }));
    fetchRoutes({ page: 1, keyword });
  };

  // 筛选处理
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchRoutes({ page: 1, ...newFilters });
  };

  // 状态徽章样式
  const getStatusBadge = (status: string) => {
    const statusMap = {
      DRAFT: { color: 'orange', text: '草稿' },
      ACTIVE: { color: 'green', text: '已发布' },
      INACTIVE: { color: 'red', text: '已下线' },
      TESTING: { color: 'blue', text: '测试中' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Badge color={config.color} text={config.text} />;
  };

  // 配置类型徽章
  const getConfigTypeBadge = (configType: string) => {
    const typeMap = {
      REDIRECT: { color: 'orange', text: '重定向' },
      OSS: { color: 'purple', text: 'OSS映射' }
    };
    const config = typeMap[configType as keyof typeof typeMap] || { color: 'default', text: configType };
    return <Badge color={config.color} text={config.text} />;
  };

  // 添加编辑路由处理函数
  const handleEditRoute = async (routeId: string) => {
    try {
      const response = await axios.get(`/api/applications/${appId}/routes/${routeId}`);
      if (response.data.success) {
        const routeData = response.data.data;
        setEditingRoute({
          id: routeData.id,
          name: routeData.name,
          path: routeData.path,
          method: routeData.method,
          configType: routeData.configType,
          priority: routeData.priority,
          targetUrl: routeData.targetUrl,
          statusCode: routeData.statusCode,
          bucket: routeData.ossBucket,
          objectKey: routeData.ossPath,
          region: routeData.region,
        });
        setEditDrawerVisible(true);
      } else {
        message.error('获取路由信息失败');
      }
    } catch (error) {
      console.error('获取路由信息失败:', error);
      message.error('获取路由信息失败');
    }
  };

  // 主表格操作菜单 - 修复版本
  const getActionMenu = (record: RouteData) => {
    console.log('生成操作菜单 for record:', record.id);
    return {
      items: [
        {
          key: 'edit',
          label: '编辑路由',
          onClick: () => {
            console.log('点击编辑路由:', record.id);
            handleEditRoute(record.id);
          }
        },
        {
          key: 'versions',
          label: '版本管理',
          onClick: () => {
            console.log('点击版本管理:', record.id);
            handleViewVersions(record.id);
          }
        },
        {
          key: 'logs',
          label: '操作记录',
          onClick: () => {
            console.log('点击操作记录:', record.id);
            handleViewOperationLogs(record.id);
          }
        },
        {
          key: 'deploy-logs',
          label: '上线记录',
          onClick: () => {
            console.log('点击上线记录:', record.id);
            handleViewDeployLogs(record.id);
          }
        },
        {
          key: 'test',
          label: '测试路由',
          onClick: () => {
            console.log('点击测试路由:', record.id);
            message.info('测试功能开发中...');
          }
        },
        {
          type: 'divider'
        },
        {
          key: 'delete',
          label: '删除路由',
          danger: true,
          onClick: () => {
            console.log('点击删除路由:', record.id);
            Modal.confirm({
              title: '确认删除',
              content: `确定要删除路由 "${record.name}" 吗？此操作不可恢复。`,
              okText: '确认删除',
              okType: 'danger',
              cancelText: '取消',
              onOk: () => {
                console.log('确认删除路由:', record.id);
                message.info('删除功能开发中...');
              }
            });
          }
        }
      ]
    };
  };

  // 获取部署记录
  const fetchDeployRecords = async (routeId: string) => {
    setDeployLoading(true);
    try {
      const response = await axios.get(`/api/applications/${appId}/routes/${routeId}/deploy-logs`);
      if (response.data.success) {
        setDeployRecords(response.data.data);
      } else {
        message.error(response.data.message || '获取部署记录失败');
      }
    } catch (error) {
      console.error('获取部署记录失败:', error);
      message.error('获取部署记录失败');
    } finally {
      setDeployLoading(false);
    }
  };

  // 获取操作记录
  const fetchOperationLogs = async (routeId: string) => {
    setOperationLoading(true);
    try {
      const response = await axios.get(`/api/applications/${appId}/routes/${routeId}/operation-logs`);
      if (response.data.success) {
        setOperationLogs(response.data.data);
      } else {
        message.error(response.data.message || '获取操作记录失败');
      }
    } catch (error) {
      console.error('获取操作记录失败:', error);
      message.error('获取操作记录失败');
    } finally {
      setOperationLoading(false);
    }
  };

  // 获取版本列表 - 添加改进的排序逻辑
  const fetchVersions = async (routeId: string) => {
    setVersionLoading(true);
    try {
      const response = await axios.get(`/api/applications/${appId}/routes/${routeId}/versions`);
      if (response.data.success) {
        // 改进排序逻辑：草稿版本优先，然后是线上版本，最后是其他版本
        const sortedVersions = response.data.data.versions.sort((a: RouteVersion, b: RouteVersion) => {
          // 1. 草稿版本优先显示
          if (a.status === 'DRAFT' && b.status !== 'DRAFT') return -1;
          if (b.status === 'DRAFT' && a.status !== 'DRAFT') return 1;
          
          // 2. 线上版本次优先
          if (a.isPublished && !b.isPublished) return -1;
          if (b.isPublished && !a.isPublished) return 1;
          
          // 3. 同类型按创建时间倒序
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setVersions(sortedVersions);
        setCurrentRouteInfo(response.data.data.route);
      } else {
        message.error(response.data.message || '获取版本列表失败');
      }
    } catch (error) {
      console.error('获取版本列表失败:', error);
      message.error('获取版本列表失败');
    } finally {
      setVersionLoading(false);
    }
  };

  // 发布指定版本（草稿直接上线） - 改进版本，增加调试和确认
  const handlePublishVersion = async (versionId: string, version: string) => {
    console.log('开始发布版本:', { versionId, version, currentRouteId });
    
    try {
      const response = await axios.post(`/api/applications/${appId}/routes/${currentRouteId}/versions/${versionId}/publish`);
      console.log('版本发布响应:', response.data);
      
      if (response.data.success) {
        message.success(`版本 ${version} 已成功上线`);
        // 刷新版本列表和路由列表
        await fetchVersions(currentRouteId);
        await fetchRoutes();
      } else {
        console.error('版本发布失败:', response.data);
        message.error(response.data.message || '版本切换失败');
      }
    } catch (error) {
      console.error('版本发布请求失败:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        message.error(`版本切换失败: ${errorMessage}`);
      } else {
        message.error('版本切换失败，请重试');
      }
    }
  };

  // 带确认的版本切换函数 - 添加调试信息
  const handleSwitchVersion = (versionId: string, version: string, isDraft: boolean) => {
    console.log('handleSwitchVersion called:', { versionId, version, isDraft });
    
    const actionText = isDraft ? '直接上线' : '切换为线上版本';
    const confirmText = isDraft 
      ? `确认要将草稿版本 ${version} 直接上线吗？`
      : `确认要将版本 ${version} 切换为线上版本吗？当前线上版本将被替换。`;
    
    console.log('显示确认对话框:', { actionText, confirmText });
    
    Modal.confirm({
      title: '确认操作',
      content: confirmText,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        console.log('用户确认操作');
        handlePublishVersion(versionId, version);
      },
      onCancel: () => {
        console.log('用户取消操作');
      }
    });
  };

  // 临时的简单测试函数
  const handleTestClick = (versionId: string, version: string) => {
    console.log('测试点击:', { versionId, version });
    alert(`点击了版本: ${version}, ID: ${versionId}`);
  };

  // 直接的版本切换函数（不使用 Modal.confirm）
  const handleDirectPublish = (versionId: string, version: string) => {
    console.log('直接发布版本:', { versionId, version, currentRouteId });
    handlePublishVersion(versionId, version);
  };

  // 完善的查看部署记录函数
  const handleViewDeployLogs = (routeId: string) => {
    setCurrentRouteId(routeId);
    setDeployRecords([]);
    setDeployModalVisible(true);
    setTimeout(() => {
      fetchDeployRecords(routeId);
    }, 0);
  };

  // 查看操作记录函数 - 只保留这一个
  const handleViewOperationLogs = (routeId: string) => {
    setCurrentRouteId(routeId);
    setOperationModalVisible(true);
    fetchOperationLogs(routeId);
  };

  // 查看版本管理
  const handleViewVersions = (routeId: string) => {
    setCurrentRouteId(routeId);
    setVersionModalVisible(true);
    fetchVersions(routeId);
  };

  // 关闭部署记录弹窗
  const handleCloseDeployModal = () => {
    setDeployModalVisible(false);
    setTimeout(() => {
      setDeployRecords([]);
      setCurrentRouteId('');
    }, 200);
  };

  // 关闭操作记录弹窗
  const handleCloseOperationModal = () => {
    setOperationModalVisible(false);
    setOperationLogs([]);
    setCurrentRouteId('');
  };

  // 关闭版本管理弹窗
  const handleCloseVersionModal = () => {
    setVersionModalVisible(false);
    setVersions([]);
    setCurrentRouteInfo(null);
    setCurrentRouteId('');
  };

  // 获取操作类型的显示文本和颜色
  const getActionDisplay = (action: string) => {
    const actionMap = {
      DEPLOY: { text: '部署上线', color: 'green' },
      UNPUBLISH: { text: '下线', color: 'red' },
      ROLLBACK: { text: '回滚', color: 'orange' }
    };
    return actionMap[action as keyof typeof actionMap] || { text: action, color: 'default' };
  };

  // 获取操作类型的显示文本和状态标签
  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      'CREATE_ROUTE': '创建路由',
      'UPDATE_ROUTE': '更新路由',
      'DELETE_ROUTE': '删除路由',
      'PUBLISH_ROUTE': '发布路由',
      'PUBLISH_VERSION': '发布版本',
      'DEPLOY_ROUTE': '上线路由',
      'UNPUBLISH_ROUTE': '下线路由',
      'CREATE_DRAFT_VERSION': '创建草稿版本',
      'ROLLBACK_VERSION': '回滚版本'
    };
    return actionMap[action] || action;
  };

  // 获取操作状态标签
  const getActionStatusTag = (action: string) => {
    const actionStatusMap: Record<string, { color: string; text: string }> = {
      'CREATE_ROUTE': { color: 'blue', text: '创建' },
      'UPDATE_ROUTE': { color: 'orange', text: '更新' },
      'DELETE_ROUTE': { color: 'red', text: '删除' },
      'PUBLISH_ROUTE': { color: 'green', text: '发布' },
      'PUBLISH_VERSION': { color: 'green', text: '发布' },
      'DEPLOY_ROUTE': { color: 'green', text: '上线' },
      'UNPUBLISH_ROUTE': { color: 'red', text: '下线' },
      'CREATE_DRAFT_VERSION': { color: 'orange', text: '草稿' },
      'ROLLBACK_VERSION': { color: 'purple', text: '回滚' }
    };
    
    const config = actionStatusMap[action] || { color: 'default', text: '其他' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 部署记录表格列定义 - 移除回滚功能
  const deployColumns: TableColumnsType<DeployRecord> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 120,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => {
        const { text, color } = getActionDisplay(action);
        return <Badge color={color} text={text} />;
      },
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: 'createdByName',
      key: 'createdByName',
      width: 120,
      render: (name, record) => name || record.createdBy,
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'operation',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              console.log('查看配置详情:', record);
            }}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  // 操作记录表格列定义 - 添加状态标签
  const operationColumns: TableColumnsType<OperationLog> = [
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (action) => (
        <div>
          <div>{getActionText(action)}</div>
          <div style={{ marginTop: 4 }}>
            {getActionStatusTag(action)}
          </div>
        </div>
      ),
    },
    {
      title: '操作详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => {
        if (typeof details === 'object') {
          return (
            <div className="text-sm">
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-20">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          );
        }
        return <span className="text-sm">{details || '-'}</span>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'createdByName',
      key: 'createdByName',
      width: 120,
      render: (name, record) => (
        <div>
          <div className="text-sm">{name}</div>
          <div className="text-xs text-gray-500">
            {new Date(record.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>
      ),
    }
  ];

  // 版本管理表格列定义 - 完全重写，确保事件正常
  const versionColumns: TableColumnsType<RouteVersion> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 140,
      render: (version, record) => (
        <div>
          <span className="font-mono text-base font-medium">{version}</span>
          <div style={{ marginTop: 4 }}>
            {record.isPublished ? (
              <Tag color="green" size="small">当前线上</Tag>
            ) : record.status === 'DRAFT' ? (
              <Tag color="orange" size="small">草稿</Tag>
            ) : (
              <Tag color="blue" size="small">已发布</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '配置详情',
      key: 'config',
      ellipsis: true,
      render: (_, record) => {
        if (record.configType === 'REDIRECT') {
          return `${record.targetUrl} (${record.statusCode})`;
        } else {
          return `${record.bucket}/${record.objectKey}`;
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'operation',
      width: 200,
      render: (_, record) => {
        // 调试信息
        console.log('表格行数据:', {
          id: record.id,
          version: record.version,
          status: record.status,
          isPublished: record.isPublished
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
           

            {/* 条件按钮 */}
            {!record.isPublished && (
              <Button
                type={record.status === 'DRAFT' ? 'primary' : 'default'}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // 直接调用发布函数，不使用确认对话框
                  handleDirectPublish(record.id, record.version);
                }}
                loading={versionLoading}
              >
                {record.status === 'DRAFT' ? '草稿上线' : '切换上线'}
              </Button>
            )}

            {record.isPublished && (
              <Tag color="green">当前版本</Tag>
            )}
          </div>
        );
      },
    },
  ];

  // 展开行渲染 - 修复版本状态显示
  const expandedRowRender = (record: RouteData) => {
    const expandColumns: TableColumnsType<any> = [
      { 
        title: '映射地址', 
        dataIndex: 'target', 
        key: 'target',
        width: 300,
      },
      {
        title: '配置类型',
        dataIndex: 'configType',
        key: 'configType',
        width: 120,
        render: (configType) => getConfigTypeBadge(configType),
      },
      {
        title: '当前版本状态',
        key: 'publishedVersionStatus',
        width: 180,
        render: () => {
          // 显示当前发布版本的状态
          if (!record.publishedVersionId) {
            return (
              <div>
                <Badge color="gray" text="无发布版本" />
                <div className="text-xs text-gray-500 mt-1">
                  该路由还没有发布任何版本
                </div>
              </div>
            );
          }

          // 如果有发布版本，显示发布版本的状态
          return (
            <div>
              {getStatusBadge(record.versionStatus)}
              <div className="text-xs text-gray-500 mt-1">
                {record.publishedAt ? (
                  <>
                    <div>版本ID: {record.publishedVersionId.slice(0, 8)}</div>
                    <div>发布时间: {new Date(record.publishedAt).toLocaleString('zh-CN')}</div>
                  </>
                ) : (
                  '版本未上线'
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '操作',
        key: 'operation',
        width: 500,
        render: () => (
          <Space size="small">
            {/* 只保留草稿版本的发布功能 */}
            {record.versionStatus === 'DRAFT' && (
              <Button 
                type="primary" 
                size="small"
                onClick={() => handlePublishVersion(record.id, record.version)}
              >
                发布版本
              </Button>
            )}
            
            {/* 功能性操作按钮 - 不包含上线/下线 */}
            <Button 
              type="link" 
              size="small"
              onClick={() => handleViewOperationLogs(record.id)}
            >
              操作记录
            </Button>
            
            <Button 
              type="link" 
              size="small"
              onClick={() => handleViewDeployLogs(record.id)}
            >
              上线记录
            </Button>
            
            <Button 
              type="link" 
              size="small"
              onClick={() => handleEditRoute(record.id)}
            >
              编辑配置
            </Button>

            <Button 
              type="link" 
              size="small"
              onClick={() => handleViewVersions(record.id)}
            >
              版本管理
            </Button>
          </Space>
        ),
      },
    ];

    const expandData = [{
      key: '1',
      target: record.configType === 'REDIRECT' ? record.targetUrl : record.ossPath,
      configType: record.configType,
      // 不再传递 status，因为我们在 render 函数中直接使用 record 数据
    }];

    return (
      <Table
        columns={expandColumns}
        dataSource={expandData}
        pagination={false}
        size="small"
      />
    );
  };

  // 路由级别的状态切换 - 添加调试信息
  const handleToggleRouteStatus = async (routeId: string, currentStatus: string) => {
    console.log('切换路由状态:', { routeId, currentStatus });
    const action = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = currentStatus === 'ACTIVE' ? '停用' : '启用';
    
    try {
      const response = await axios.patch(`/api/applications/${appId}/routes/${routeId}/status`, {
        status: action
      });
      if (response.data.success) {
        message.success(`路由${actionText}成功`);
        fetchRoutes();
      } else {
        message.error(response.data.message || `路由${actionText}失败`);
      }
    } catch (error) {
      console.error(`路由${actionText}失败:`, error);
      message.error(`路由${actionText}失败`);
    }
  };

  // 主表格列定义 - 修复版本状态显示
  const columns: TableColumnsType<RouteData> = [
    {
      title: '路由名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '路径地址',
      dataIndex: 'path',
      key: 'path',
      width: 250,
      render: (path) => (
        <span className="font-mono text-sm">{path}</span>
      ),
    },
    {
      title: '路由状态',
      key: 'routeStatus',
      width: 120,
      render: (_, record) => (
        <div>
          {record.status === 'ACTIVE' ? (
            <Badge color="green" text="已启用" />
          ) : (
            <Badge color="red" text="已停用" />
          )}
        </div>
      ),
    },
    {
      title: '版本状态',
      key: 'versionStatus',
      width: 120,
      render: (_, record) => {
        if (!record.publishedVersionId) {
          return <Badge color="gray" text="无版本" />;
        }
        return getStatusBadge(record.versionStatus); // 使用versionStatus字段
      },
    },
    {
      title: '操作时间',
      key: 'operationTime',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          <div>创建：{new Date(record.createdAt).toLocaleString('zh-CN')}</div>
          <div className="text-gray-500">更新：{new Date(record.updatedAt).toLocaleString('zh-CN')}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'operation',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {/* 路由状态切换按钮 */}
          <Button 
            type={record.status === 'ACTIVE' ? 'default' : 'primary'} 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleRouteStatus(record.id, record.status);
            }}
            danger={record.status === 'ACTIVE'}
          >
            {record.status === 'ACTIVE' ? '停用路由' : '启用路由'}
          </Button>
          
          {/* 更多操作下拉菜单 */}
          <Dropdown
            menu={getActionMenu(record)}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              size="small"
              style={{ 
                border: '1px solid #d9d9d9',
                padding: '4px 8px'
              }}
            >
              ⋯
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 部署记录弹窗 - 使用 useMemo 优化
  const DeployLogsModal = useMemo(() => (
    <Modal
      title="部署记录"
      open={deployModalVisible}
      onCancel={handleCloseDeployModal}
      footer={[
        <Button key="close" onClick={handleCloseDeployModal}>
          关闭
        </Button>
      ]}
      width={800}
      destroyOnHidden={false}
      maskClosable={false}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          路由ID: {currentRouteId}
        </div>
        <Table<DeployRecord>
          columns={deployColumns}
          dataSource={deployRecords}
          loading={deployLoading}
          rowKey="id"
          size="small"
          pagination={{
            size: 'small',
            showSizeChanger: false,
            showQuickJumper: false,
            pageSize: 10,
          }}
          locale={{
            emptyText: deployLoading ? '加载中...' : '暂无部署记录'
          }}
        />
      </div>
    </Modal>
  ), [deployModalVisible, currentRouteId, deployRecords, deployLoading, deployColumns]);

  // 操作记录弹窗
  const OperationLogsModal = useMemo(() => (
    <Modal
      title="操作记录"
      open={operationModalVisible}
      onCancel={handleCloseOperationModal}
      footer={[
        <Button key="close" onClick={handleCloseOperationModal}>
          关闭
        </Button>
      ]}
      width={900}
      destroyOnHidden={false}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          路由ID: {currentRouteId}
        </div>
        <Table<OperationLog>
          columns={operationColumns}
          dataSource={operationLogs}
          loading={operationLoading}
          rowKey="id"
          size="small"
          pagination={{
            size: 'small',
            showSizeChanger: false,
            showQuickJumper: false,
            pageSize: 10,
          }}
          locale={{
            emptyText: operationLoading ? '加载中...' : '暂无操作记录'
          }}
        />
      </div>
    </Modal>
  ), [operationModalVisible, currentRouteId, operationLogs, operationLoading, operationColumns]);

  // 版本管理弹窗 - 改进版本
  const VersionManagementModal = useMemo(() => (
    <Modal
      title="版本管理 (调试模式)"
      open={versionModalVisible}
      onCancel={handleCloseVersionModal}
      footer={[
        <Button key="close" onClick={handleCloseVersionModal}>
          关闭
        </Button>
      ]}
      width={1000}
      destroyOnHidden={false}
    >
      <div className="space-y-4">
        {currentRouteInfo && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4>当前路由: {currentRouteInfo.name}</h4>
            <p>路径: {currentRouteInfo.path}</p>
            <p>方法: {currentRouteInfo.method}</p>
          </div>
        )}
        
        {/* 添加全局测试按钮 */}
        <div className="mb-4">
          <Button
            onClick={() => {
              console.log('全局测试按钮点击');
              console.log('versions数据:', versions);
              console.log('currentRouteId:', currentRouteId);
              alert('全局测试按钮工作正常');
            }}
          >
            全局测试按钮
          </Button>
        </div>
        
        <Table<RouteVersion>
          columns={versionColumns}
          dataSource={versions}
          loading={versionLoading}
          rowKey="id"
          size="small"
          pagination={false}
          locale={{
            emptyText: versionLoading ? '加载中...' : '暂无版本记录'
          }}
        />
      </div>
    </Modal>
  ), [versionModalVisible, currentRouteInfo, versions, versionLoading, currentRouteId]);

  return (
    <div className="space-y-4">
      {/* 搜索和筛选栏 */}
      <div className="flex gap-4 items-center">
        <Search
          placeholder="搜索路由名称或路径"
          allowClear
          style={{ width: 300 }}
          onSearch={handleSearch}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 120 }}
          value={filters.status || undefined}
          onChange={(value) => handleFilterChange('status', value || '')}
        >
          <Option value="ACTIVE">活跃</Option>
          <Option value="INACTIVE">停用</Option>
          <Option value="TESTING">测试中</Option>
        </Select>
        <Select
          placeholder="类型筛选"
          allowClear
          style={{ width: 120 }}
          value={filters.configType || undefined}
          onChange={(value) => handleFilterChange('configType', value || '')}
        >
          <Option value="REDIRECT">重定向</Option>
          <Option value="OSS">OSS映射</Option>
        </Select>
      </div>

      {/* 表格 */}
      <Table<RouteData>
        columns={columns}
        dataSource={routes}
        loading={loading}
        expandable={{ 
          expandedRowRender,
          expandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[])
        }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, pageSize) => {
            fetchRoutes({ page, pageSize });
          }
        }}
        rowKey="id"
        size="middle"
      />
      
      {/* 添加编辑路由抽屉 */}
      <AddRouteDrawer
        appId={appId}
        open={editDrawerVisible}
        onClose={() => {
          setEditDrawerVisible(false);
          setEditingRoute(null);
        }}
        onSuccess={() => {
          fetchRoutes();
        }}
        editData={editingRoute}
        mode="edit"
      />
      
      {/* 现有的部署记录弹窗 */}
      {DeployLogsModal}
      
      {/* 添加操作记录弹窗 */}
      {OperationLogsModal}
      
      {/* 添加版本管理弹窗 */}
      {VersionManagementModal}
    </div>
  );
};

export default TableList;