import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Globe, Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 文档类型定义
interface KnowledgeDocument {
  id: string;
  title: string;
  summary?: string;
  sourceType: 'file' | 'url' | 'api' | 'manual';
  fileType?: 'word' | 'pdf' | 'markdown' | 'web_page' | 'other';
  category?: string;
  tags: string[];
  createdAt: string;
  status: 'draft' | 'processing' | 'active' | 'archived';
  processingStatus: 'pending' | 'extracting' | 'vectorized' | 'analyzed' | 'failed';
}

const KnowledgeBase: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('list');
  // 预览相关状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    documentId: string;
    title: string;
    fileType: string;
    contentType: 'text' | 'file';
    content?: string;
    downloadUrl?: string;
    canPreview: boolean;
  } | null>(null);

  // 模拟获取文档列表
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API
      // const response = await fetch('/api/v1/knowledge/documents');
      // const data = await response.json();

      // 模拟数据
      const mockData: KnowledgeDocument[] = [
        {
          id: '1',
          title: '2026年政务信息公开工作要点',
          summary: '关于2026年政务信息公开工作的指导文件',
          sourceType: 'file',
          fileType: 'pdf',
          category: '政策文件',
          tags: ['政务', '信息公开', '2026'],
          createdAt: '2026-04-05 14:30:00',
          status: 'active',
          processingStatus: 'vectorized',
        },
        {
          id: '2',
          title: '智慧城市建设典型案例',
          summary: '全国智慧城市建设优秀案例汇编',
          sourceType: 'url',
          fileType: 'web_page',
          category: '参考资料',
          tags: ['智慧城市', '案例', '建设'],
          createdAt: '2026-04-04 09:15:00',
          status: 'active',
          processingStatus: 'vectorized',
        },
        {
          id: '3',
          title: '单位年度工作总结报告',
          summary: '2025年度工作总结及2026年工作计划',
          sourceType: 'file',
          fileType: 'word',
          category: '历史文章',
          tags: ['总结', '报告', '年度'],
          createdAt: '2026-04-03 16:45:00',
          status: 'active',
          processingStatus: 'analyzed',
        },
        {
          id: '4',
          title: '新媒体运营规范指南',
          summary: '政务新媒体运营规范与注意事项',
          sourceType: 'manual',
          category: '参考资料',
          tags: ['新媒体', '运营', '规范'],
          createdAt: '2026-04-02 11:20:00',
          status: 'draft',
          processingStatus: 'pending',
        },
      ];

      setDocuments(mockData);
    } catch (error) {
      console.error('获取文档列表失败:', error);
      toast({
        title: '获取文档列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的文件',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedCategory !== 'all' ? selectedCategory : '');

      // 这里应该调用实际的API
      // const response = await fetch('/api/v1/knowledge/documents/import/file', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const result = await response.json();

      // 模拟上传成功
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: '上传成功',
        description: `文件 "${selectedFile.name}" 已成功上传`,
      });

      // 重置表单
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // 刷新列表
      fetchDocuments();
      setActiveTab('list');
    } catch (error) {
      console.error('上传文件失败:', error);
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // 采集网页
  const handleCrawl = async () => {
    if (!urlInput.trim()) {
      toast({
        title: '请输入URL',
        description: '请先输入要采集的网页URL',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // 这里应该调用实际的API
      // const response = await fetch('/api/v1/knowledge/documents/import/url', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: urlInput }),
      // });
      // const result = await response.json();

      // 模拟采集成功
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: '采集成功',
        description: `网页 "${urlInput}" 已成功采集`,
      });

      // 重置表单
      setUrlInput('');

      // 刷新列表
      fetchDocuments();
      setActiveTab('list');
    } catch (error) {
      console.error('采集网页失败:', error);
      toast({
        title: '采集失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;

    try {
      // 这里应该调用实际的API
      // await fetch(`/api/v1/knowledge/documents/${id}`, { method: 'DELETE' });

      // 模拟删除成功
      setDocuments(documents.filter(doc => doc.id !== id));

      toast({
        title: '删除成功',
        description: '文档已删除',
      });
    } catch (error) {
      console.error('删除文档失败:', error);
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 预览文档
  const handlePreview = async (id: string) => {
    setPreviewLoading(true);
    try {
      // 调用预览API
      const response = await fetch(`/api/v1/knowledge/documents/${id}/preview`);
      if (!response.ok) {
        throw new Error(`预览请求失败: ${response.statusText}`);
      }
      const data = await response.json();
      setPreviewData(data);
      setPreviewOpen(true);
    } catch (error) {
      console.error('预览文档失败:', error);
      toast({
        title: '预览失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // 简单的Markdown渲染函数（基础支持）
  const renderMarkdown = (text: string) => {
    if (!text) return '';

    // 基本转换
    let html = text
      // 标题
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-200">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-slate-200">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-slate-200">$1</h1>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-bold text-slate-100">$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-slate-300">$1</em>')
      // 无序列表
      .replace(/^\s*[-*] (.*$)/gm, '<li class="ml-4 text-slate-300">$1</li>')
      // 有序列表
      .replace(/^\s*\d+\. (.*$)/gm, '<li class="ml-4 text-slate-300">$1</li>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-500 hover:text-amber-400 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // 代码块（简单处理）
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // 换行
      .replace(/\n/g, '<br>');

    // 包装列表项
    if (html.includes('<li')) {
      html = html.replace(/<li/g, '<ul class="list-disc ml-6 my-2"><li').replace(/<\/li>/g, '</li></ul>');
      // 简单去重（实际需要更复杂的处理）
      html = html.replace(/<\/ul><ul/g, '');
    }

    return html;
  };

  // 过滤文档
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 获取所有分类
  const categories = ['all', '政策文件', '历史文章', '参考资料', '其他'];
  const uniqueCategories = Array.from(new Set(documents.map(doc => doc.category).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">知识库管理</h1>
          <p className="text-slate-400">管理单位知识库文档，支持文件上传和网页采集</p>
        </div>
        <Button
          onClick={() => setActiveTab('upload')}
          className="bg-amber-600 hover:bg-amber-700 text-slate-950"
        >
          <Upload className="w-4 h-4 mr-2" />
          上传文档
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="list">文档列表</TabsTrigger>
          <TabsTrigger value="upload">上传文档</TabsTrigger>
        </TabsList>

        {/* 文档列表标签页 */}
        <TabsContent value="list" className="space-y-6">
          {/* 搜索和过滤 */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-slate-300">搜索文档</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="search"
                      placeholder="按标题、摘要或标签搜索..."
                      className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-300">分类筛选</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="all">所有分类</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={fetchDocuments}
                    disabled={loading}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 文档列表 */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">文档列表</CardTitle>
              <CardDescription className="text-slate-500">
                共 {filteredDocuments.length} 个文档
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">暂无文档</h3>
                  <p className="text-slate-500 mb-6">上传或采集文档以开始构建知识库</p>
                  <Button onClick={() => setActiveTab('upload')}>上传文档</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-300">标题</TableHead>
                      <TableHead className="text-slate-300">类型</TableHead>
                      <TableHead className="text-slate-300">分类</TableHead>
                      <TableHead className="text-slate-300">标签</TableHead>
                      <TableHead className="text-slate-300">状态</TableHead>
                      <TableHead className="text-slate-300">创建时间</TableHead>
                      <TableHead className="text-slate-300 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-200">{doc.title}</div>
                            {doc.summary && (
                              <div className="text-sm text-slate-400 mt-1 line-clamp-1">{doc.summary}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {doc.sourceType === 'file' ? (
                              <>
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-slate-300 capitalize">
                                  {doc.fileType === 'pdf' ? 'PDF' :
                                   doc.fileType === 'word' ? 'Word' :
                                   doc.fileType === 'markdown' ? 'Markdown' : '文件'}
                                </span>
                              </>
                            ) : doc.sourceType === 'url' ? (
                              <>
                                <Globe className="w-4 h-4 text-green-400" />
                                <span className="text-slate-300">网页</span>
                              </>
                            ) : (
                              <span className="text-slate-300">手动</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.category ? (
                            <Badge variant="outline" className="border-slate-700 text-slate-300">
                              {doc.category}
                            </Badge>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-slate-800 text-slate-300 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags.length > 3 && (
                              <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                                +{doc.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              doc.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              doc.status === 'processing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              doc.status === 'draft' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {doc.status === 'active' ? '活跃' :
                             doc.status === 'processing' ? '处理中' :
                             doc.status === 'draft' ? '草稿' : '归档'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePreview(doc.id)}
                              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 上传文档标签页 */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 文件上传卡片 */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  文件上传
                </CardTitle>
                <CardDescription className="text-slate-500">
                  支持上传 Word、PDF、Markdown 等格式文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-slate-300">选择文件</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileSelect}
                    className="bg-slate-800 border-slate-700 text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-slate-950 hover:file:bg-amber-700"
                  />
                  {selectedFile && (
                    <div className="mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300">{selectedFile.name}</span>
                        </div>
                        <span className="text-slate-500 text-sm">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-category" className="text-slate-300">分类（可选）</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="all">不指定分类</SelectItem>
                      {categories.filter(c => c !== 'all').map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-slate-950"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      上传文件
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 网页采集卡片 */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  网页采集
                </CardTitle>
                <CardDescription className="text-slate-500">
                  输入网页URL，自动采集内容保存到知识库
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input" className="text-slate-300">网页URL</Label>
                  <Input
                    id="url-input"
                    placeholder="https://example.com/article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crawl-category" className="text-slate-300">分类（可选）</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="all">不指定分类</SelectItem>
                      {categories.filter(c => c !== 'all').map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCrawl}
                  disabled={!urlInput.trim() || uploading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-950"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                      采集中...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      采集网页
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 使用说明 */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <span>文件上传支持 PDF、Word、Markdown、纯文本等格式，最大文件大小 50MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <span>网页采集会自动提取网页标题和正文内容，保存为知识库文档</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <span>上传的文档会自动进行向量化处理，用于后续的智能检索和分析</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <span>可以为文档添加分类和标签，方便后续管理和检索</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 文档预览模态框 */}
      {previewOpen && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-200">{previewData.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                    {previewData.fileType === 'pdf' ? 'PDF' :
                     previewData.fileType === 'word' ? 'Word' :
                     previewData.fileType === 'markdown' ? 'Markdown' :
                     previewData.fileType === 'web_page' ? '网页' : '文件'}
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    {previewData.contentType === 'text' ? '文本预览' : '文件预览'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* 模态框内容 */}
            <div className="flex-1 overflow-auto p-6">
              {previewLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                <>
                  {previewData.contentType === 'text' ? (
                    <div className="prose prose-invert max-w-none">
                      <div
                        className="whitespace-pre-wrap font-sans text-slate-300 bg-slate-800/50 p-4 rounded-lg overflow-auto max-h-[60vh]"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(previewData.content || '') }}
                      />
                      <div className="mt-4 text-sm text-slate-400">
                        {previewData.fileType === 'markdown' ? 'Markdown 文档已渲染显示' : '文本内容预览'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previewData.fileType === 'pdf' && previewData.canPreview ? (
                        <div className="h-[60vh]">
                          <iframe
                            src={`/api/v1/knowledge/documents/${previewData.documentId}/download?preview=true`}
                            className="w-full h-full border-0 rounded-lg bg-white"
                            title={`PDF预览: ${previewData.title}`}
                          />
                          <div className="mt-2 text-sm text-slate-400">
                            提示：如果PDF无法显示，请尝试
                            <a
                              href={`/api/v1/knowledge/documents/${previewData.documentId}/download`}
                              className="text-amber-500 hover:text-amber-400 ml-1"
                              download
                            >
                              下载文件
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium text-slate-300 mb-2">文件预览</h3>
                          <p className="text-slate-500 mb-6">
                            该文件类型不支持在线预览，您可以下载后使用本地软件查看。
                          </p>
                          <Button
                            onClick={() => window.open(`/api/v1/knowledge/documents/${previewData.documentId}/download`, '_blank')}
                            className="bg-amber-600 hover:bg-amber-700 text-slate-950"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            下载文件
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 模态框底部 */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setPreviewOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                关闭
              </Button>
              {previewData.downloadUrl && (
                <Button
                  onClick={() => window.open(`/api/v1/knowledge/documents/${previewData.documentId}/download`, '_blank')}
                  className="bg-amber-600 hover:bg-amber-700 text-slate-950"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载文件
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;