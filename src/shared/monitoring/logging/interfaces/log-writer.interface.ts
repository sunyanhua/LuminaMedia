import { StructuredLog } from './structured-log.interface';

/**
 * 日志写入器接口
 */
export interface LogWriter {
  /**
   * 写入日志
   * @param log 结构化日志对象
   */
  write(log: StructuredLog): Promise<void>;

  /**
   * 刷新缓冲区（如果适用）
   */
  flush?(): Promise<void>;

  /**
   * 关闭写入器
   */
  close?(): Promise<void>;
}