"use client"

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from "sonner"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

// 定义表单 schema，类似 antd 的 rules
const formSchema = z.object({
    appName: z.string().min(1, '应用名称不能为空').max(50, '应用名称不能超过50个字符'),
    appCode: z.string().min(1, '应用代码不能为空').regex(/^[a-zA-Z0-9_-]+$/, '应用代码只能包含字母、数字、下划线和横线'),
    domain: z.string().min(1, '域名不能为空'),
})

type FormValues = z.infer<typeof formSchema>

// API 接口类型定义
interface CreateAppRequest {
    name: string;
    code: string;
    domain: string;
    description?: string;
}

interface CreateAppResponse {
    success: boolean;
    data?: any;
    message: string;
}

export default function CreateAppCard (){
    const [isOpen, setIsOpen] = useState(false);
    
    // 初始化 form，类似 antd 的 Form.useForm()
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            appName: '',
            appCode: '',
            domain: '',
        },
    })

    // 创建应用的API调用
    const createApplication = async (data: CreateAppRequest): Promise<CreateAppResponse> => {
        try {
            const response = await axios.post<CreateAppResponse>('/api/applications', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || '创建应用失败');
            }
            throw new Error('网络错误，请稍后重试');
        }
    };

    const createAppHandle = async (values: FormValues) => {
        try {
            // 映射表单字段到API字段
            const requestData: CreateAppRequest = {
                name: values.appName,
                code: values.appCode,
                domain: values.domain,
                description: `应用代码: ${values.appCode}`, // 可选描述
            };

            console.log('提交数据:', requestData);
            
            // 调用API
            const result = await createApplication(requestData);
            
            if (result.success) {
                console.log('创建成功:', result.data);

                toast.success("应用创建成功", {
                    description: "您可以开始配置路由了",
                })
                
                // 重置表单并关闭弹窗
                form.reset();
                setIsOpen(false);
                
                // 可以触发页面刷新或状态更新
                window.location.reload(); // 简单粗暴的刷新，你可以用更优雅的状态管理
            } else {
                throw new Error(result.message || '创建失败');
            }
        } catch (error) {
            console.error('创建应用失败:', error);
            
            // 错误提示
            const errorMessage = error instanceof Error ? error.message : '创建应用失败，请稍后重试';
            // alert(`创建失败: ${errorMessage}`);
            toast.error("应用创建失败", {
                description: ` ${errorMessage}`,
            })
            
            // 不关闭弹窗，让用户可以修改后重试
        }
    }

    const handleDrawerChange = (open: boolean) => {
        setIsOpen(open);
    }

    const openDrawer = () => {
        form.reset();
        setIsOpen(true);
    }

    return (
        <>
            {/* 外部触发按钮 - 不嵌套在 Drawer 内 */}
            <div 
                className="w-[225px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                onClick={openDrawer}
            >
                <div className="p-6 flex justify-center items-center h-[100%] ">
                    <Plus className="mr-2" />新建应用
                </div>
            </div>

            {/* 受控的 Drawer - 使用新的 handleDrawerChange */}
            <Drawer open={isOpen} onOpenChange={handleDrawerChange} direction="right" >
                <DrawerContent style={{
                    width: '600px',
                    maxWidth: 'none'
                }}>
                    <DrawerHeader>
                        <DrawerTitle>创建新应用</DrawerTitle>
                        <DrawerDescription>请填写应用信息来创建一个新的应用。</DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="p-4">
                        {/* 使用 Form 组件，类似 antd 的 <Form> */}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(createAppHandle)} className="space-y-4">
                                {/* 应用名称字段 */}
                                <FormField
                                    control={form.control}
                                    name="appName"
                                    render={({ field }) => (
                                        <FormItem >
                                            <FormLabel className='w-[100px] text-right'>应用名称</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入应用名称" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 应用代码字段 */}
                                <FormField
                                    control={form.control}
                                    name="appCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>应用代码</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入应用代码" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 域名字段 */}
                                <FormField
                                    control={form.control}
                                    name="domain"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>域名</FormLabel>
                                            <FormControl>
                                                <Input placeholder="请输入域名" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                    
                    <DrawerFooter>
                        <Button 
                            onClick={form.handleSubmit(createAppHandle)}
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? '创建中...' : '创建应用'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={form.formState.isSubmitting}>
                            取消
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}

