/**
 * Multer 文件上传类型定义
 * 用于替代 Express.Multer.File，避免类型冲突
 */
export interface MulterFile {
  /** Name of the form field associated with this file. */
  fieldname: string;

  /** Name of the file on the uploader's computer. */
  originalname: string;

  /** Encoding type of the file. */
  encoding: string;

  /** Mime type of the file. */
  mimetype: string;

  /** Size of the file in bytes. */
  size: number;

  /** Location of the uploaded file on disk. */
  destination: string;

  /** Name of the file stored on disk. */
  filename: string;

  /** Full path to the uploaded file. */
  path: string;

  /** A Buffer of the entire file. */
  buffer: Buffer;
}