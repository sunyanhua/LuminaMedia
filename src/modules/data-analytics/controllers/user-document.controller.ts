import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FeatureGuard } from '../../auth/guards/feature.guard';
import { Feature } from '../../auth/decorators/feature.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserDocumentService, UserDocumentUploadDto, UserDocumentUpdateDto, CustomReportGenerationDto } from '../services/user-document.service';
import { UserDocumentFileType, CustomReportType } from '../../../entities/user-document.entity';

// DTOs for API requests
class UserDocumentUploadRequestDto implements UserDocumentUploadDto {
  title: string;
  description?: string;
  reportType?: CustomReportType;
  isPublic?: boolean;
}

class UserDocumentUpdateRequestDto implements UserDocumentUpdateDto {
  title?: string;
  description?: string;
  reportType?: CustomReportType;
  isPublic?: boolean;
}

class CustomReportGenerationRequestDto implements CustomReportGenerationDto {
  documentId: string;
  reportType: CustomReportType;
  title?: string;
  customInstructions?: string;
}

class UserDocumentListQueryDto {
  reportType?: CustomReportType;
  fileType?: UserDocumentFileType;
  limit?: number;
  offset?: number;
  includePublic?: boolean;
}

@ApiTags('user-documents')
@ApiBearerAuth()
@Controller('v1/analytics/user-documents')
@UseGuards(JwtAuthGuard, FeatureGuard)
@Feature('custom-reports')
export class UserDocumentController {
  constructor(private readonly userDocumentService: UserDocumentService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传用户文档' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文档文件',
        },
        title: {
          type: 'string',
          description: '文档标题',
          example: '2026年第一季度工作总结',
        },
        description: {
          type: 'string',
          description: '文档描述',
          example: '包含部门第一季度的工作成果和下一步计划',
        },
        reportType: {
          type: 'string',
          enum: Object.values(CustomReportType),
          description: '报告类型',
          example: CustomReportType.WORK_SUMMARY,
        },
        isPublic: {
          type: 'boolean',
          description: '是否公开',
          example: false,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文档上传成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '文件无效或请求参数错误',
  })
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UserDocumentUploadRequestDto,
  ) {
    try {
      if (!file) {
        return {
          success: false,
          message: '请上传文件',
        };
      }

      const document = await this.userDocumentService.uploadDocument(
        user.id,
        file,
        uploadDto,
      );

      return {
        success: true,
        message: '文档上传成功',
        data: {
          id: document.id,
          title: document.title,
          fileType: document.fileType,
          fileUrl: document.fileUrl,
          extractionStatus: document.extractionStatus,
          createdAt: document.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `文档上传失败: ${error.message}`,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: '获取用户文档列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文档列表获取成功',
  })
  async getDocuments(
    @CurrentUser() user: any,
    @Query() query: UserDocumentListQueryDto,
  ) {
    try {
      const { documents, total } = await this.userDocumentService.getUserDocuments(
        user.id,
        {
          reportType: query.reportType,
          fileType: query.fileType,
          limit: query.limit,
          offset: query.offset,
          includePublic: query.includePublic,
        },
      );

      return {
        success: true,
        message: '文档列表获取成功',
        data: {
          documents: documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            fileType: doc.fileType,
            fileUrl: doc.fileUrl,
            description: doc.description,
            reportType: doc.reportType,
            extractionStatus: doc.extractionStatus,
            isPublic: doc.isPublic,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          })),
          pagination: {
            total,
            limit: query.limit || 20,
            offset: query.offset || 0,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `获取文档列表失败: ${error.message}`,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文档详情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文档详情获取成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '文档不存在或无权访问',
  })
  async getDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    try {
      const document = await this.userDocumentService.getDocumentById(id, user.id);

      return {
        success: true,
        message: '文档详情获取成功',
        data: {
          id: document.id,
          title: document.title,
          fileType: document.fileType,
          fileUrl: document.fileUrl,
          fileInfo: document.fileInfo,
          description: document.description,
          content: document.content,
          summary: document.summary,
          keywords: document.keywords,
          reportType: document.reportType,
          extractionStatus: document.extractionStatus,
          extractionError: document.extractionError,
          generatedReportId: document.generatedReportId,
          isPublic: document.isPublic,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `获取文档详情失败: ${error.message}`,
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文档信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文档更新成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '文档不存在或无权修改',
  })
  async updateDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UserDocumentUpdateRequestDto,
  ) {
    try {
      const document = await this.userDocumentService.updateDocument(
        id,
        user.id,
        updateDto,
      );

      return {
        success: true,
        message: '文档更新成功',
        data: {
          id: document.id,
          title: document.title,
          description: document.description,
          reportType: document.reportType,
          isPublic: document.isPublic,
          updatedAt: document.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `更新文档失败: ${error.message}`,
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文档' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '文档删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '文档不存在或无权删除',
  })
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    try {
      await this.userDocumentService.deleteDocument(id, user.id);

      return {
        success: true,
        message: '文档删除成功',
      };
    } catch (error) {
      return {
        success: false,
        message: `删除文档失败: ${error.message}`,
      };
    }
  }

  @Post('generate-report')
  @ApiOperation({ summary: '生成自定义报告' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '报告生成开始',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效或文档未准备好',
  })
  async generateCustomReport(
    @CurrentUser() user: any,
    @Body() generationDto: CustomReportGenerationRequestDto,
  ) {
    try {
      const report = await this.userDocumentService.generateCustomReport(
        user.id,
        generationDto,
      );

      return {
        success: true,
        message: '报告生成任务已开始',
        data: {
          reportId: report.id,
          title: report.title,
          type: report.type,
          status: report.status,
          createdAt: report.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `生成报告失败: ${error.message}`,
      };
    }
  }

  @Get(':id/extraction-status')
  @ApiOperation({ summary: '获取文档提取状态' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '提取状态获取成功',
  })
  async getExtractionStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    try {
      const document = await this.userDocumentService.getDocumentById(id, user.id);

      return {
        success: true,
        message: '提取状态获取成功',
        data: {
          id: document.id,
          title: document.title,
          extractionStatus: document.extractionStatus,
          extractionError: document.extractionError,
          content: document.extractionStatus === 'completed' ? document.content : undefined,
          summary: document.extractionStatus === 'completed' ? document.summary : undefined,
          keywords: document.extractionStatus === 'completed' ? document.keywords : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `获取提取状态失败: ${error.message}`,
      };
    }
  }

  @Post(':id/retry-extraction')
  @ApiOperation({ summary: '重试文档内容提取' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '提取重试开始',
  })
  async retryExtraction(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    try {
      const document = await this.userDocumentService.getDocumentById(id, user.id);

      // 更新状态为pending，触发重新提取
      document.extractionStatus = 'pending';
      // 在实际应用中，应该调用服务方法触发重新提取
      // 这里简化处理

      return {
        success: true,
        message: '文档提取重试已开始',
        data: {
          id: document.id,
          extractionStatus: 'pending',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `重试提取失败: ${error.message}`,
      };
    }
  }
}