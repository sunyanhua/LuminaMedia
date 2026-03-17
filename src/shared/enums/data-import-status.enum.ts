export enum DataImportStatus {
  /** 待处理 */
  PENDING = 'PENDING',

  /** 处理中 */
  PROCESSING = 'PROCESSING',

  /** 成功 */
  SUCCESS = 'SUCCESS',

  /** 失败 */
  FAILED = 'FAILED',

  /** 部分成功 */
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',

  /** 已取消 */
  CANCELLED = 'CANCELLED',
}
