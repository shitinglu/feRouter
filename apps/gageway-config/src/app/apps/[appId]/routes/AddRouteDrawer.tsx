"use client"
import { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, message, Space, Radio } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

interface AddRouteDrawerProps {
  appId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: RouteEditData;
  mode?: 'add' | 'edit';
}

interface RouteFormData {
  name: string;
  path: string;
  method: string;
  configType: 'REDIRECT' | 'OSS';
  priority: number;
  targetUrl?: string;
  statusCode?: number;
  bucket?: string;
  objectKey?: string;
  region?: string;
}

interface RouteEditData {
  id: string;
  name: string;
  path: string;
  method: string;
  configType: 'REDIRECT' | 'OSS';
  priority: number;
  targetUrl?: string;
  statusCode?: number;
  bucket?: string;
  objectKey?: string;
  region?: string;
}

const AddRouteDrawer = ({ 
  appId, 
  open, 
  onClose, 
  onSuccess, 
  editData,
  mode = 'add' 
}: AddRouteDrawerProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [configType, setConfigType] = useState<'REDIRECT' | 'OSS'>('OSS');

  // 当抽屉打开和模式改变时，重置状态
  useEffect(() => {
    if (open) {
      if (editData && mode === 'edit') {
        setConfigType(editData.configType);
        form.setFieldsValue({
          name: editData.name,
          path: editData.path,
          method: editData.method,
          configType: editData.configType, // 编辑模式下也要设置 configType
          priority: editData.priority,
          bucket: editData.bucket,
          objectKey: editData.objectKey,
          region: editData.region,
          targetUrl: editData.targetUrl,
          statusCode: editData.statusCode,
        });
      } else if (mode === 'add') {
        form.resetFields();
        setConfigType('OSS');
      }
    }
  }, [open, editData, mode, form]);

  // 提交表单
  const handleSubmit = async (values: RouteFormData) => {
    setLoading(true);
    try {
      let response;
      
      if (mode === 'edit' && editData) {
        const editPayload = {
          ...(configType === 'REDIRECT' ? {
            targetUrl: values.targetUrl,
            statusCode: values.statusCode
          } : {
            bucket: values.bucket,
            objectKey: values.objectKey,
            region: values.region
          })
        };
        
        response = await axios.put(`/api/applications/${appId}/routes/${editData.id}`, editPayload);
      } else {
        response = await axios.post(`/api/applications/${appId}/routes`, values);
      }
      
      if (response.data.success) {
        message.success(mode === 'edit' ? '路由更新成功' : '路由添加成功');
        form.resetFields();
        onClose();
        onSuccess();
      } else {
        message.error(response.data.message || (mode === 'edit' ? '更新路由失败' : '添加路由失败'));
      }
    } catch (error) {
      console.error(`${mode === 'edit' ? '更新' : '添加'}路由失败:`, error);
      message.error(`${mode === 'edit' ? '更新' : '添加'}路由失败`);
    } finally {
      setLoading(false);
    }
  };

  // 关闭抽屉
  const handleClose = () => {
    form.resetFields();
    setConfigType('OSS');
    onClose();
  };

  // 配置类型变化处理 - 仅在添加模式下
  const handleConfigTypeChange = (value: 'REDIRECT' | 'OSS') => {
    setConfigType(value);
    if (value === 'REDIRECT') {
      form.setFieldsValue({
        bucket: undefined,
        objectKey: undefined,
        region: undefined
      });
    } else {
      form.setFieldsValue({
        targetUrl: undefined,
        statusCode: undefined
      });
    }
  };

  return (
    <Drawer
      title={mode === 'edit' ? '编辑路由配置' : '添加路由'}
      placement="right"
      width={500}
      open={open}
      onClose={handleClose}
      extra={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" onClick={() => form.submit()} loading={loading}>
            {mode === 'edit' ? '更新' : '添加'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          method: 'GET',
          configType: 'OSS',
          priority: 0,
          statusCode: 302
        }}
      >
        {/* 编辑模式下显示基本信息（只读） */}
        {mode === 'edit' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-800">路由基本信息</h4>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-20 text-gray-600">路径描述：</span>
                <span className="text-gray-800">{editData?.name}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">路径：</span>
                <span className="text-gray-800 font-mono">{editData?.path}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">HTTP方法：</span>
                <span className="text-gray-800">{editData?.method}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">配置类型：</span>
                <span className="text-gray-800">
                  {editData?.configType === 'OSS' ? 'OSS映射' : '重定向'}
                </span>
              </div>
              <div className="flex">
                <span className="w-20 text-gray-600">优先级：</span>
                <span className="text-gray-800">{editData?.priority}</span>
              </div>
            </div>
          </div>
        )}

        {/* 添加模式下的完整表单 */}
        {mode === 'add' && (
          <>
            <Form.Item
              name="name"
              label="路径描述"
              rules={[
                { required: true, message: '请输入路径描述' },
                { max: 100, message: '描述不能超过100个字符' }
              ]}
            >
              <Input placeholder="请输入路径描述，如：首页、用户页面等" />
            </Form.Item>

            <Form.Item
              name="path"
              label="路径"
              rules={[
                { required: true, message: '请输入路径' },
                { pattern: /^\//, message: '路径必须以 / 开头' }
              ]}
            >
              <Input placeholder="请输入路径，如：/、/user/*、/api/*" />
            </Form.Item>

            <Form.Item
              name="method"
              label="HTTP方法"
              rules={[{ required: true, message: '请选择HTTP方法' }]}
            >
              <Select placeholder="选择HTTP方法">
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="PATCH">PATCH</Option>
                <Option value="ALL">ALL (所有方法)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="configType"
              label="配置类型"
              rules={[{ required: true, message: '请选择配置类型' }]}
            >
              <Radio.Group onChange={(e) => handleConfigTypeChange(e.target.value)}>
                <Radio value="OSS">OSS映射</Radio>
                <Radio value="REDIRECT">重定向</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
              rules={[
                { required: true, message: '请输入优先级' },
                { type: 'number', min: 0, max: 100, message: '优先级必须在0-100之间' }
              ]}
            >
              <Input 
                type="number" 
                placeholder="请输入优先级 (0-100，数字越大优先级越高)" 
                min={0}
                max={100}
              />
            </Form.Item>
          </>
        )}

        {/* 映射配置部分 */}
        <div className={mode === 'edit' ? 'border-t pt-4' : ''}>
          {mode === 'edit' && (
            <h4 className="font-medium mb-4 text-blue-600">
              🔧 映射配置（可编辑）
            </h4>
          )}

          {/* OSS配置 */}
          {configType === 'OSS' && (
            <>
              <Form.Item
                name="bucket"
                label="存储桶"
                rules={[{ required: true, message: '请输入存储桶名称' }]}
              >
                <Input placeholder="请输入OSS存储桶名称" />
              </Form.Item>

              <Form.Item
                name="objectKey"
                label="对象路径"
                rules={[{ required: true, message: '请输入对象路径' }]}
              >
                <Input placeholder="请输入文件路径，如：index.html、assets/" />
              </Form.Item>

              <Form.Item
                name="region"
                label="区域"
              >
                <Input placeholder="请输入区域，如：us-east-1（可选）" />
              </Form.Item>
            </>
          )}

          {/* 重定向配置 */}
          {configType === 'REDIRECT' && (
            <>
              <Form.Item
                name="targetUrl"
                label="目标URL"
                rules={[
                  { required: true, message: '请输入目标URL' },
                  { type: 'url', message: '请输入有效的URL' }
                ]}
              >
                <Input placeholder="请输入重定向目标URL，如：https://api.example.com" />
              </Form.Item>

              <Form.Item
                name="statusCode"
                label="状态码"
                rules={[{ required: true, message: '请选择状态码' }]}
              >
                <Select placeholder="选择HTTP状态码">
                  <Option value={301}>301 (永久重定向)</Option>
                  <Option value={302}>302 (临时重定向)</Option>
                  <Option value={307}>307 (临时重定向，保持方法)</Option>
                  <Option value={308}>308 (永久重定向，保持方法)</Option>
                </Select>
              </Form.Item>
            </>
          )}
        </div>
      </Form>
    </Drawer>
  );
};

export default AddRouteDrawer; 