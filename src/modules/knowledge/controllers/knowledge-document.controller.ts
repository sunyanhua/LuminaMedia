import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { KnowledgeDocumentService } from '../services/knowledge-document.service';
import { KnowledgeDocument, DocumentSourceType, DocumentStatus } from '../../../entities/knowledge-document.entity';
import { DocumentImportOptions } from '../services/knowledge-document.service';

// 请求和响应DTO
class CreateDocumentDto {
  title: string;
  content: string;
  summary?: string;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  category?: string;
  tags?: string[];
  language?: string;
  metadata?: any;
}

class UpdateDocumentDto {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  language?: string;
  metadata?: any;
  status?: DocumentStatus;
  isPublic?: boolean;
  accessControl?: string[];
}

class SearchDocumentsDto {
  query?: string;
  category?: string;
  sourceType?: DocumentSourceType;
  status?: DocumentStatus;
  tags?: string[];
  limit?: number;
  offset?: number;
}

class ImportFileDto {
  category?: string;
  tags?: string[];
  language?: string;
  isPublic?: boolean;
  accessControl?: string[];
}

class ImportUrlDto {
  url: string;
  category?: string;
  tags?: string[];
  language?: string;
  isPublic?: boolean;
  accessControl?: string[];
}

class ImportApiDto {
  title: string;
  content: string;
  metadata?: any;
  category?: string;
  tags?: string[];
  language?: string;
  isPublic?: boolean;
  accessControl?: string[];
}

class BatchImportDto {
  imports: Array<{
    type: 'file' | 'url' | 'api' | 'manual';
    data: any;
    options?: DocumentImportOptions;
  }>;
}

class BatchUpdateTagsDto {
  documentIds: string[];
  add?: string[];
  remove?: string[];
}

class BatchUpdateCategoryDto {
  documentIds: string[];
  category: string;
}

class UpdateCategoryDto {
  newCategory: string;
}

class MergeTagsDto {
  targetTag: string;
}

@ApiTags('knowledge')
@Controller('api/v1/knowledge/documents')
export class KnowledgeDocumentController {
  constructor(
    private readonly knowledgeDocumentService: KnowledgeDocumentService,
  ) {}

  /**
   * 创建文档
   */
  @Post()
  @ApiOperation({
    summary: '创建新文档',
    description: '创建新的知识库文档，支持多种来源类型',
  })
  @ApiBody({ type: CreateDocumentDto })
  @ApiCreatedResponse({
    description: '文档创建成功',
    type: KnowledgeDocument,
  })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @ApiResponse({ status: 409, description: '已存在相同内容的文档' })
  async createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<KnowledgeDocument> {
    return await this.knowledgeDocumentService.createDocument(createDocumentDto);
  }

  /**
   * 获取文档详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取文档详情',
    description: '根据ID获取文档的详细信息',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiOkResponse({
    description: '获取成功',
    type: KnowledgeDocument,
  })
  @ApiResponse({ status: 404, description: '文档不存在' })
  async getDocument(
    @Param('id') id: string,
  ): Promise<KnowledgeDocument> {
    return await this.knowledgeDocumentService.getDocument(id);
  }

  /**
   * 更新文档
   */
  @Put(':id')
  @ApiOperation({
    summary: '更新文档',
    description: '更新文档内容或元数据',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiOkResponse({
    description: '更新成功',
    type: KnowledgeDocument,
  })
  @ApiResponse({ status: 404, description: '文档不存在' })
  async updateDocument(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<KnowledgeDocument> {
    return await this.knowledgeDocumentService.updateDocument(id, updateDocumentDto);
  }

  /**
   * 删除文档
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除文档',
    description: '软删除文档（移至归档状态）',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiNoContentResponse({ description: '删除成功' })
  @ApiResponse({ status: 404, description: '文档不存在' })
  async deleteDocument(
    @Param('id') id: string,
  ): Promise<void> {
    await this.knowledgeDocumentService.deleteDocument(id);
  }

  /**
   * 批量删除文档
   */
  @Delete('batch/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '批量删除文档',
    description: '批量软删除文档',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentIds: {
          type: 'array',
          items: { type: 'string' },
          description: '文档ID数组',
        },
      },
      required: ['documentIds'],
    },
  })
  @ApiNoContentResponse({ description: '删除成功' })
  async batchDeleteDocuments(
    @Body('documentIds') documentIds: string[],
  ): Promise<void> {
    await this.knowledgeDocumentService.batchDeleteDocuments(documentIds);
  }

  /**
   * 搜索文档
   */
  @Get()
  @ApiOperation({
    summary: '搜索文档',
    description: '根据关键词、分类、标签等条件搜索文档',
  })
  @ApiQuery({ name: 'query', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'category', required: false, description: '文档分类' })
  @ApiQuery({ name: 'sourceType', required: false, description: '来源类型' })
  @ApiQuery({ name: 'status', required: false, description: '文档状态' })
  @ApiQuery({ name: 'tags', required: false, description: '标签数组（逗号分隔）' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量', type: Number })
  @ApiOkResponse({
    description: '搜索成功',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: { $ref: '#/components/schemas/KnowledgeDocument' },
        },
        total: { type: 'number' },
      },
    },
  })
  async searchDocuments(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('sourceType') sourceType?: DocumentSourceType,
    @Query('status') status?: DocumentStatus,
    @Query('tags') tags?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ documents: KnowledgeDocument[]; total: number }> {
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;

    return await this.knowledgeDocumentService.searchDocuments(query || '', {
      category,
      sourceType,
      status,
      tags: tagArray,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  /**
   * 导入文件文档
   */
  @Post('import/file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '导入文件文档',
    description: '上传文件并导入为知识库文档，支持多种文件格式',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文件（PDF、Word、Excel、TXT等）',
        },
        category: { type: 'string', required: false },
        tags: { type: 'string', required: false, description: '逗号分隔的标签' },
        language: { type: 'string', required: false, default: 'zh-CN' },
        isPublic: { type: 'boolean', required: false, default: false },
        accessControl: {
          type: 'array',
          items: { type: 'string' },
          required: false,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: '文件导入成功',
    type: KnowledgeDocument,
  })
  @ApiResponse({ status: 400, description: '文件无效或参数错误' })
  async importFileDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /^(pdf|docx?|xlsx?|pptx?|txt)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() importFileDto: ImportFileDto,
  ): Promise<KnowledgeDocument> {
    const fileInfo = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path, // 实际存储路径
    };

    const tags = importFileDto.tags ? importFileDto.tags.split(',').map(tag => tag.trim()) : undefined;

    return await this.knowledgeDocumentService.importFileDocument(fileInfo, {
      category: importFileDto.category,
      tags,
      language: importFileDto.language,
      isPublic: importFileDto.isPublic,
      accessControl: importFileDto.accessControl,
    });
  }

  /**
   * 导入URL文档
   */
  @Post('import/url')
  @ApiOperation({
    summary: '导入URL文档',
    description: '抓取网页内容并导入为知识库文档',
  })
  @ApiBody({ type: ImportUrlDto })
  @ApiCreatedResponse({
    description: 'URL导入成功',
    type: KnowledgeDocument,
  })
  @ApiResponse({ status: 400, description: 'URL无效或抓取失败' })
  async importUrlDocument(
    @Body() importUrlDto: ImportUrlDto,
  ): Promise<KnowledgeDocument> {
    return await this.knowledgeDocumentService.importUrlDocument(importUrlDto.url, {
      category: importUrlDto.category,
      tags: importUrlDto.tags,
      language: importUrlDto.language,
      isPublic: importUrlDto.isPublic,
      accessControl: importUrlDto.accessControl,
    });
  }

  /**
   * 导入API文档
   */
  @Post('import/api')
  @ApiOperation({
    summary: '导入API文档',
    description: '通过API接口导入文档内容',
  })
  @ApiBody({ type: ImportApiDto })
  @ApiCreatedResponse({
    description: 'API导入成功',
    type: KnowledgeDocument,
  })
  async importApiDocument(
    @Body() importApiDto: ImportApiDto,
  ): Promise<KnowledgeDocument> {
    return await this.knowledgeDocumentService.importApiDocument({
      title: importApiDto.title,
      content: importApiDto.content,
      metadata: importApiDto.metadata,
    }, {
      category: importApiDto.category,
      tags: importApiDto.tags,
      language: importApiDto.language,
      isPublic: importApiDto.isPublic,
      accessControl: importApiDto.accessControl,
    });
  }

  /**
   * 批量导入文档
   */
  @Post('import/batch')
  @ApiOperation({
    summary: '批量导入文档',
    description: '批量导入多种来源的文档',
  })
  @ApiBody({ type: BatchImportDto })
  @ApiCreatedResponse({
    description: '批量导入成功',
    type: [KnowledgeDocument],
  })
  async batchImportDocuments(
    @Body() batchImportDto: BatchImportDto,
  ): Promise<KnowledgeDocument[]> {
    return await this.knowledgeDocumentService.batchImportDocuments(batchImportDto.imports);
  }

  /**
   * 处理待向量化文档
   */
  @Post('process/pending')
  @ApiOperation({
    summary: '处理待向量化文档',
    description: '批量处理待向量化的文档，将其添加到向量数据库',
  })
  @ApiQuery({ name: 'batchSize', required: false, description: '批量大小', type: Number })
  @ApiOkResponse({ description: '处理完成' })
  async processPendingDocuments(
    @Query('batchSize') batchSize?: number,
  ): Promise<void> {
    await this.knowledgeDocumentService.processPendingDocuments(batchSize ? Number(batchSize) : undefined);
  }

  /**
   * 获取文档统计信息
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: '获取文档统计信息',
    description: '获取文档的数量、状态、分类、来源等统计信息',
  })
  @ApiOkResponse({
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        byProcessingStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              processingStatus: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        byCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        bySourceType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sourceType: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        qualityStats: {
          type: 'object',
          properties: {
            avgOverall: { type: 'number' },
            avgCompleteness: { type: 'number' },
            avgRelevance: { type: 'number' },
            avgFreshness: { type: 'number' },
            avgAuthority: { type: 'number' },
            avgReadability: { type: 'number' },
          },
        },
      },
    },
  })
  async getDocumentStats(): Promise<any> {
    return await this.knowledgeDocumentService.getDocumentStats();
  }

  /**
   * 重新向量化所有文档
   */
  @Post('revectorize/all')
  @ApiOperation({
    summary: '重新向量化所有文档',
    description: '重新处理所有已向量化的文档，更新向量数据库',
  })
  @ApiOkResponse({
    description: '重新向量化完成',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        processed: { type: 'number' },
        failed: { type: 'number' },
      },
    },
  })
  async revectorizeAllDocuments(): Promise<{ total: number; processed: number; failed: number }> {
    return await this.knowledgeDocumentService.revectorizeAllDocuments();
  }

  /**
   * 获取所有分类
   */
  @Get('categories')
  @ApiOperation({
    summary: '获取所有分类',
    description: '获取文档的所有分类及其文档数量',
  })
  @ApiOkResponse({
    description: '获取成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          count: { type: 'number' },
        },
      },
    },
  })
  async getAllCategories(): Promise<Array<{ category: string; count: number }>> {
    return await this.knowledgeDocumentService.getAllCategories();
  }

  /**
   * 获取所有标签
   */
  @Get('tags')
  @ApiOperation({
    summary: '获取所有标签',
    description: '获取文档的所有标签及其使用频率',
  })
  @ApiOkResponse({
    description: '获取成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          count: { type: 'number' },
        },
      },
    },
  })
  async getAllTags(): Promise<Array<{ tag: string; count: number }>> {
    return await this.knowledgeDocumentService.getAllTags();
  }

  /**
   * 更新分类名称
   */
  @Put('categories/:category')
  @ApiOperation({
    summary: '更新分类名称',
    description: '批量更新文档的分类名称',
  })
  @ApiParam({ name: 'category', description: '原分类名称' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
      },
    },
  })
  async updateCategory(
    @Param('category') category: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ updated: number }> {
    return await this.knowledgeDocumentService.updateCategory(category, updateCategoryDto.newCategory);
  }

  /**
   * 合并标签
   */
  @Put('tags/merge/:sourceTag')
  @ApiOperation({
    summary: '合并标签',
    description: '将源标签合并到目标标签，并删除源标签',
  })
  @ApiParam({ name: 'sourceTag', description: '源标签' })
  @ApiBody({ type: MergeTagsDto })
  @ApiOkResponse({
    description: '合并成功',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
      },
    },
  })
  async mergeTags(
    @Param('sourceTag') sourceTag: string,
    @Body() mergeTagsDto: MergeTagsDto,
  ): Promise<{ updated: number }> {
    return await this.knowledgeDocumentService.mergeTags(sourceTag, mergeTagsDto.targetTag);
  }

  /**
   * 获取文档建议标签
   */
  @Get(':id/suggest/tags')
  @ApiOperation({
    summary: '获取文档建议标签',
    description: '基于文档内容分析生成标签建议',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiQuery({ name: 'limit', required: false, description: '建议数量限制', type: Number })
  @ApiOkResponse({
    description: '获取成功',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  async suggestTags(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<string[]> {
    return await this.knowledgeDocumentService.suggestTags(id, limit ? Number(limit) : undefined);
  }

  /**
   * 获取文档建议分类
   */
  @Get(':id/suggest/category')
  @ApiOperation({
    summary: '获取文档建议分类',
    description: '基于文档内容分析生成分类建议',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiOkResponse({
    description: '获取成功',
    type: String,
    nullable: true,
  })
  async suggestCategory(
    @Param('id') id: string,
  ): Promise<string | null> {
    return await this.knowledgeDocumentService.suggestCategory(id);
  }

  /**
   * 批量更新文档标签
   */
  @Put('batch/tags')
  @ApiOperation({
    summary: '批量更新文档标签',
    description: '批量添加或移除文档标签',
  })
  @ApiBody({ type: BatchUpdateTagsDto })
  @ApiOkResponse({
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
      },
    },
  })
  async batchUpdateTags(
    @Body() batchUpdateTagsDto: BatchUpdateTagsDto,
  ): Promise<{ updated: number }> {
    return await this.knowledgeDocumentService.batchUpdateTags(
      batchUpdateTagsDto.documentIds,
      { add: batchUpdateTagsDto.add, remove: batchUpdateTagsDto.remove },
    );
  }

  /**
   * 批量更新文档分类
   */
  @Put('batch/category')
  @ApiOperation({
    summary: '批量更新文档分类',
    description: '批量更新文档分类',
  })
  @ApiBody({ type: BatchUpdateCategoryDto })
  @ApiOkResponse({
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
      },
    },
  })
  async batchUpdateCategory(
    @Body() batchUpdateCategoryDto: BatchUpdateCategoryDto,
  ): Promise<{ updated: number }> {
    return await this.knowledgeDocumentService.batchUpdateCategory(
      batchUpdateCategoryDto.documentIds,
      batchUpdateCategoryDto.category,
    );
  }

  /**
   * 获取文档处理状态
   */
  @Get(':id/processing-status')
  @ApiOperation({
    summary: '获取文档处理状态',
    description: '获取文档的向量化处理状态和错误信息',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiOkResponse({
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        processingStatus: { type: 'string' },
        vectorId: { type: 'string', nullable: true },
        vectorizedAt: { type: 'string', format: 'date-time', nullable: true },
        processingError: { type: 'string', nullable: true },
      },
    },
  })
  async getProcessingStatus(
    @Param('id') id: string,
  ): Promise<{
    processingStatus: string;
    vectorId?: string;
    vectorizedAt?: Date;
    processingError?: string;
  }> {
    const document = await this.knowledgeDocumentService.getDocument(id);
    return {
      processingStatus: document.processingStatus,
      vectorId: document.vectorId,
      vectorizedAt: document.vectorizedAt,
      processingError: document.processingError,
    };
  }

  /**
   * 手动触发文档向量化
   */
  @Post(':id/vectorize')
  @ApiOperation({
    summary: '手动触发文档向量化',
    description: '手动触发文档的向量化处理',
  })
  @ApiParam({ name: 'id', description: '文档ID' })
  @ApiOkResponse({ description: '向量化任务已触发' })
  @ApiResponse({ status: 404, description: '文档不存在' })
  async triggerVectorization(
    @Param('id') id: string,
  ): Promise<void> {
    // 重置处理状态并触发向量化
    const document = await this.knowledgeDocumentService.getDocument(id);
    if (document.status !== DocumentStatus.ACTIVE) {
      throw new BadRequestException('只有活跃状态的文档可以向量化');
    }

    await this.knowledgeDocumentService.updateDocument(id, {
      processingStatus: DocumentProcessingStatus.PENDING,
      vectorId: null,
    });
  }
}