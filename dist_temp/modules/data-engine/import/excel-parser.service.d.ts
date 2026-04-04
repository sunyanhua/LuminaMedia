export interface ExcelParseOptions {
    sheetName?: string;
    headerRow?: number;
    skipRows?: number;
    maxRows?: number;
    columnMapping?: Record<string, string>;
}
export interface ParseResult {
    rows: Record<string, any>[];
    totalRows: number;
    headers: string[];
    sheetNames: string[];
    metadata: {
        fileType: string;
        fileSize: number;
        originalFilename: string;
        detectedEncoding?: string;
    };
    validationErrors: Array<{
        row: number;
        field: string;
        error: string;
        value: any;
    }>;
}
export declare class ExcelParserService {
    parseExcel(fileBuffer: Buffer, originalFilename: string, options?: ExcelParseOptions): Promise<ParseResult>;
    parseCSV(fileBuffer: Buffer, originalFilename: string, options?: ExcelParseOptions): Promise<ParseResult>;
    parseFile(fileBuffer: Buffer, originalFilename: string, options?: ExcelParseOptions): Promise<ParseResult>;
    private detectFileType;
    private isSupportedExcelType;
    private mockParse;
    validateRow(row: Record<string, any>, rowIndex: number): Array<{
        field: string;
        error: string;
        value: any;
    }>;
    detectHeaderMapping(headers: string[], targetFields: string[]): Promise<Record<string, string>>;
}
