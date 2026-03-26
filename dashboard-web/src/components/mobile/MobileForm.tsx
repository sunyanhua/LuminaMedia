/**
 * 移动端表单组件
 * 基于Ant Design Mobile表单组件，优化移动端输入体验
 */

import React from 'react';
import {
  Form,
  Input,
  TextArea,
  Selector,
  Stepper,
  Slider,
  DatePicker,
  CascadePicker,
  Switch,
  Radio,
  Checkbox,
  Button,
  Space,
} from 'antd-mobile';
import type {
  FormProps as MobileFormProps,
  FormItemProps as MobileFormItemProps,
} from 'antd-mobile';
import { cn } from '../../lib/utils';

// 扩展FormItemProps以支持更多功能
export interface MobileFormItemProps extends Omit<MobileFormItemProps, 'children'> {
  /**
   * 表单项类型
   */
  type?:
    | 'text'
    | 'textarea'
    | 'number'
    | 'password'
    | 'email'
    | 'tel'
    | 'url'
    | 'selector'
    | 'stepper'
    | 'slider'
    | 'date'
    | 'cascade'
    | 'switch'
    | 'radio'
    | 'checkbox'
    | 'custom';
  /**
   * 表单项额外配置（根据类型不同）
   */
  fieldProps?: Record<string, any>;
  /**
   * 自定义渲染函数
   */
  renderField?: (props: any) => React.ReactNode;
  /**
   * 是否在移动端显示为全宽
   * @default true
   */
  fullWidth?: boolean;
  /**
   * 是否显示边框
   * @default true
   */
  bordered?: boolean;
  /**
   * 是否启用清除按钮
   * @default true
   */
  clearable?: boolean;
}

export interface MobileFormProps extends Omit<MobileFormProps, 'children'> {
  /**
   * 表单项配置数组
   */
  items?: MobileFormItemProps[];
  /**
   * 表单布局
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal';
  /**
   * 提交按钮文本
   * @default '提交'
   */
  submitText?: string;
  /**
   * 取消按钮文本
   */
  cancelText?: string;
  /**
   * 是否显示按钮
   * @default true
   */
  showButtons?: boolean;
  /**
   * 提交回调
   */
  onSubmit?: (values: any) => void;
  /**
   * 取消回调
   */
  onCancel?: () => void;
  /**
   * 是否正在提交
   */
  submitting?: boolean;
  /**
   * 表单类名
   */
  className?: string;
  /**
   * 表单项类名
   */
  itemClassName?: string;
}

/**
 * 根据类型渲染表单项
 */
function renderFormField({
  type = 'text',
  fieldProps = {},
  renderField,
  clearable = true,
}: Pick<MobileFormItemProps, 'type' | 'fieldProps' | 'renderField' | 'clearable'>) {
  if (renderField) {
    return renderField(fieldProps);
  }

  const commonProps = {
    clearable,
    ...fieldProps,
  };

  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
      return <Input type={type} {...commonProps} />;
    case 'password':
      return <Input type="password" {...commonProps} />;
    case 'textarea':
      return <TextArea {...commonProps} />;
    case 'number':
      return <Input type="number" {...commonProps} />;
    case 'selector':
      return <Selector options={fieldProps.options || []} {...commonProps} />;
    case 'stepper':
      return <Stepper {...commonProps} />;
    case 'slider':
      return <Slider {...commonProps} />;
    case 'date':
      return <DatePicker {...commonProps} />;
    case 'cascade':
      return <CascadePicker options={fieldProps.options || []} {...commonProps} />;
    case 'switch':
      return <Switch {...commonProps} />;
    case 'radio':
      return (
        <Radio.Group {...commonProps}>
          {(fieldProps.options || []).map((option: any) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      );
    case 'checkbox':
      return (
        <Checkbox.Group {...commonProps}>
          {(fieldProps.options || []).map((option: any) => (
            <Checkbox key={option.value} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );
    default:
      return <Input {...commonProps} />;
  }
}

/**
 * 移动端表单组件
 */
export function MobileForm({
  items = [],
  layout = 'vertical',
  submitText = '提交',
  cancelText,
  showButtons = true,
  onSubmit,
  onCancel,
  submitting = false,
  className,
  itemClassName,
  ...formProps
}: MobileFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit?.(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Form
      form={form}
      layout={layout}
      className={cn('w-full', className)}
      {...formProps}
    >
      {items.map((item, index) => {
        const {
          type,
          fieldProps,
          renderField,
          fullWidth = true,
          bordered = true,
          clearable = true,
          className: itemClass,
          ...formItemProps
        } = item;

        return (
          <Form.Item
            key={item.name || index}
            className={cn(
              fullWidth && 'w-full',
              !bordered && 'border-0',
              itemClassName,
              itemClass
            )}
            {...formItemProps}
          >
            {renderFormField({ type, fieldProps, renderField, clearable })}
          </Form.Item>
        );
      })}

      {showButtons && (
        <Form.Item>
          <Space wrap className="w-full justify-center">
            {cancelText && (
              <Button
                onClick={handleCancel}
                disabled={submitting}
                fill="outline"
                size="large"
                className="flex-1 max-w-[140px]"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              loading={submitting}
              color="primary"
              size="large"
              className={cn(
                'flex-1',
                cancelText ? 'max-w-[140px]' : 'w-full'
              )}
            >
              {submitText}
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
}

/**
 * 快速创建表单的Hook
 */
export function useMobileForm() {
  const [form] = Form.useForm();

  return {
    form,
    validate: form.validateFields,
    reset: form.resetFields,
    setFieldsValue: form.setFieldsValue,
    getFieldsValue: form.getFieldsValue,
  };
}

/**
 * 表单节组件 - 用于分组表单项
 */
export function MobileFormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 last:mb-0', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default MobileForm;