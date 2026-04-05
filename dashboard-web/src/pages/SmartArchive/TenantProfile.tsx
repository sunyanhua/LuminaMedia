import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Upload, FileText, Globe, Search, Filter, Download, Trash2, Eye,
  RefreshCw, Edit, Save, X, Target, MessageSquare, Palette, Tag, Clock,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// 知识库文档类型
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

// 租户画像类型
interface TenantProfile {
  id: string;
  tenantId: string;
  positioning?: 'authoritative' | 'people_friendly' | 'professional' | 'innovative' | 'service_oriented' | 'other';
  positioningDescription?: string;
  positioningTags?: string[];
  languageStyle?: 'formal' | 'concise' | 'vivid' | 'persuasive' | 'popular' | 'professional' | 'other';
  languageStyleDescription?: string;
  languageStyleExamples?: string[];
  visualPreference?: 'minimalist' | 'modern' | 'traditional' | 'colorful' | 'gradient' | 'flat' | 'other';
  visualPreferenceDetail?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    imageStyle?: string;
    layoutPreference?: string;
  };
  topicPreference?: Array<{
    name: string;
    weight: number;
    frequency: number;
  }>;
  publishingHabits?: {
    bestTime: string[];
    frequency: string;
    preferredPlatforms: string[];
    contentLength: 'short' | 'medium' | 'long';
    postFormat: string[];
  };
  status: 'draft' | 'generated' | 'manually_edited' | 'published';
  version: number;
  generatedAt?: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
}

const TenantProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<TenantProfile | null>(null);

  // 模拟获取文档列表
  useEffect(() => {
    fetchDocuments();
    fetchTenantProfile();
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
          status: 'active',
          processingStatus: 'analyzed',
        },
        {
          id: '5',
          title: '党建工作年度计划',
          summary: '2026年度党建工作计划安排',
          sourceType: 'file',
          fileType: 'word',
          category: '政策文件',
          tags: ['党建', '工作计划', '年度'],
          createdAt: '2026-04-01 10:00:00',
          status: 'active',
          processingStatus: 'vectorized',
        },
      ];

      setDocuments(mockData);
    } catch (error) {
      console.error('获取文档列表失败:', error);
      toast({
        title: '获取文档列表失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantProfile = async () => {
    try {
      // 这里应该调用实际的API
      // const response = await fetch('/api/v1/knowledge/tenant-profiles/current');
      // const data = await response.json();

      // 模拟数据
      const mockProfile: TenantProfile = {
        id: 'profile-1',
        tenantId: 'demo-gov',
        positioning: 'authoritative',
        positioningDescription: '基于政务文档分析，单位形象定位为权威型，体现政府部门的专业性和公信力。',
        positioningTags: ['权威', '专业', '公信力', '规范'],
        languageStyle: 'formal',
        languageStyleDescription: '语言风格正式严谨，使用规范公文用语，注重准确性和规范性。',
        languageStyleExamples: [
          '根据上级文件精神，结合本单位实际，制定本方案。',
          '各单位要认真贯彻落实，确保各项工作落到实处。',
          '特此通知，请遵照执行。',
        ],
        visualPreference: 'modern',
        visualPreferenceDetail: {
          primaryColor: '#1890ff',
          secondaryColor: '#52c41a',
          fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
          imageStyle: '正式规范的政务配图，突出主题和内容',
          layoutPreference: '简洁大方的版式，注重信息层次和可读性',
        },
        topicPreference: [
          { name: '政策解读', weight: 95, frequency: 0.9 },
          { name: '工作动态', weight: 85, frequency: 0.8 },
          { name: '党建活动', weight: 80, frequency: 0.7 },
          { name: '公共服务', weight: 75, frequency: 0.6 },
          { name: '通知公告', weight: 70, frequency: 0.5 },
        ],
        publishingHabits: {
          bestTime: ['morning', 'afternoon'],
          frequency: 'weekly_3_4',
          preferredPlatforms: ['微信公众号', '单位网站', '政务头条'],
          contentLength: 'medium',
          postFormat: ['图文', '纯文字'],
        },
        status: 'generated',
        version: 1,
        generatedAt: '2026-04-06T10:30:00Z',
      };

      setTenantProfile(mockProfile);
      setTempProfile(mockProfile);
    } catch (error) {
      console.error('获取租户画像失败:', error);
    }
  };

  const handleDocSelect = (docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocs([...selectedDocs, docId]);
    } else {
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocs(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocs([]);
    }
  };

  const generateProfile = async () => {
    if (selectedDocs.length === 0) {
      toast({
        title: '请选择文档',
        description: '请至少选择一个文档用于生成画像',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      // 这里应该调用实际的API
      // const response = await fetch('/api/v1/knowledge/tenant-profiles/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ documentIds: selectedDocs }),
      // });
      // const data = await response.json();

      // 模拟生成成功
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: '画像生成成功',
        description: '单位画像已基于选中文档生成完成',
      });

      // 刷新画像数据
      fetchTenantProfile();
      setSelectedDocs([]);
    } catch (error) {
      console.error('生成画像失败:', error);
      toast({
        title: '生成失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
    setTempProfile(tenantProfile);
  };

  const cancelEditing = () => {
    setEditing(false);
    setTempProfile(tenantProfile);
  };

  const saveProfile = async () => {
    if (!tempProfile) return;

    try {
      // 这里应该调用实际的API
      // const response = await fetch(`/api/v1/knowledge/tenant-profiles/${tempProfile.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tempProfile),
      // });
      // const data = await response.json();

      // 模拟保存成功
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTenantProfile(tempProfile);
      setEditing(false);

      toast({
        title: '保存成功',
        description: '画像已更新',
      });
    } catch (error) {
      console.error('保存画像失败:', error);
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const regenerateProfile = async () => {
    setGenerating(true);
    try {
      // 这里应该调用实际的API
      // const response = await fetch(`/api/v1/knowledge/tenant-profiles/${tenantProfile?.id}/regenerate`, {
      //   method: 'POST',
      // });
      // const data = await response.json();

      // 模拟重新生成成功
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: '重新生成成功',
        description: '画像已基于最新文档重新生成',
      });

      // 刷新画像数据
      fetchTenantProfile();
    } catch (error) {
      console.error('重新生成画像失败:', error);
      toast({
        title: '重新生成失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // 形象定位映射
  const positioningMap = {
    authoritative: { label: '权威型', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    people_friendly: { label: '亲民型', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    professional: { label: '专业型', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    innovative: { label: '创新型', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    service_oriented: { label: '服务型', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    other: { label: '其他', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  // 语言风格映射
  const languageStyleMap = {
    formal: { label: '正式严谨', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    concise: { label: '简洁明快', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    vivid: { label: '生动活泼', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    persuasive: { label: '说服力强', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    popular: { label: '通俗易懂', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    professional: { label: '专业术语', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    other: { label: '其他', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  // 视觉偏好映射
  const visualPreferenceMap = {
    minimalist: { label: '极简风格', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    modern: { label: '现代风格', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    traditional: { label: '传统风格', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    colorful: { label: '多彩风格', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    gradient: { label: '渐变风格', color: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30' },
    flat: { label: '扁平风格', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    other: { label: '其他', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  // 发布频率映射
  const frequencyMap = {
    daily: '每天',
    weekly_1_2: '每周1-2次',
    weekly_3_4: '每周3-4次',
    weekly_5: '每周5次以上',
    monthly_1_2: '每月1-2次',
    occasional: '偶尔发布',
    irregular: '不定期',
  };

  // 最佳时段映射
  const bestTimeMap = {
    morning: '早上 (8:00-10:00)',
    noon: '中午 (11:00-13:00)',
    afternoon: '下午 (14:00-16:00)',
    evening: '晚上 (17:00-20:00)',
    weekend: '周末',
    workday: '工作日',
    anytime: '随时',
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
          <h1 className="text-3xl font-bold text-slate-100">单位画像</h1>
          <p className="text-slate-400">基于知识库文档生成单位画像，分析形象定位、语言风格等五个维度</p>
        </div>
        <div className="flex gap-2">
          {tenantProfile && !editing && (
            <>
              <Button
                onClick={startEditing}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑画像
              </Button>
              <Button
                onClick={regenerateProfile}
                disabled={generating}
                className="bg-amber-600 hover:bg-amber-700 text-slate-950"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                重新生成
              </Button>
            </>
          )}
          {editing && (
            <>
              <Button
                onClick={cancelEditing}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button
                onClick={saveProfile}
                className="bg-emerald-600 hover:bg-emerald-700 text-slate-950"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：文档列表 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                文档列表
              </CardTitle>
              <CardDescription className="text-slate-500">
                勾选文档用于生成画像
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索和过滤 */}
              <div className="space-y-4">
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
                  <select
                    id="category"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">所有分类</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 文档选择列表 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">选择文档 ({selectedDocs.length}/{filteredDocuments.length})</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                    <Label htmlFor="select-all" className="text-sm text-slate-400 cursor-pointer">全选</Label>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-slate-800 rounded-md">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                    </div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-500">暂无文档</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {filteredDocuments.map((doc) => (
                        <div key={doc.id} className="p-3 hover:bg-slate-800/30 flex items-center gap-3">
                          <Checkbox
                            id={`doc-${doc.id}`}
                            checked={selectedDocs.includes(doc.id)}
                            onCheckedChange={(checked) => handleDocSelect(doc.id, checked as boolean)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`doc-${doc.id}`} className="font-medium text-slate-200 truncate cursor-pointer">
                              {doc.title}
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              {doc.category && (
                                <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                                  {doc.category}
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={generateProfile}
                disabled={selectedDocs.length === 0 || generating}
                className="w-full bg-amber-600 hover:bg-amber-700 text-slate-950"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    基于选中文档生成画像
                  </>
                )}
              </Button>

              <div className="text-sm text-slate-400">
                <p>提示：勾选文档后点击"生成画像"，系统将基于选中文档分析生成单位画像。</p>
              </div>
            </CardContent>
          </Card>

          {/* 画像状态 */}
          {tenantProfile && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200">画像信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">版本</span>
                  <Badge className="bg-slate-800 text-slate-300">v{tenantProfile.version}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">状态</span>
                  <Badge className={
                    tenantProfile.status === 'generated' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    tenantProfile.status === 'manually_edited' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    tenantProfile.status === 'published' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }>
                    {tenantProfile.status === 'generated' ? '已生成' :
                     tenantProfile.status === 'manually_edited' ? '已编辑' :
                     tenantProfile.status === 'published' ? '已发布' : '草稿'}
                  </Badge>
                </div>
                {tenantProfile.generatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">生成时间</span>
                    <span className="text-slate-300">
                      {new Date(tenantProfile.generatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {tenantProfile.lastEditedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">最后编辑</span>
                    <span className="text-slate-300">
                      {new Date(tenantProfile.lastEditedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：画像展示 */}
        <div className="lg:col-span-2 space-y-6">
          {tenantProfile ? (
            <>
              {/* 五个维度展示 */}
              <div className="space-y-6">
                {/* 形象定位 */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-slate-200">形象定位</CardTitle>
                      <CardDescription className="text-slate-500">
                        单位的整体形象和定位
                      </CardDescription>
                    </div>
                    {tenantProfile.positioning && (
                      <Badge className={positioningMap[tenantProfile.positioning].color}>
                        {positioningMap[tenantProfile.positioning].label}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="positioning" className="text-slate-300">形象定位</Label>
                          <select
                            id="positioning"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            value={tempProfile?.positioning || ''}
                            onChange={(e) => setTempProfile({
                              ...tempProfile!,
                              positioning: e.target.value as any
                            })}
                          >
                            <option value="">请选择</option>
                            <option value="authoritative">权威型</option>
                            <option value="people_friendly">亲民型</option>
                            <option value="professional">专业型</option>
                            <option value="innovative">创新型</option>
                            <option value="service_oriented">服务型</option>
                            <option value="other">其他</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="positioningDescription" className="text-slate-300">描述</Label>
                          <textarea
                            id="positioningDescription"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[100px]"
                            value={tempProfile?.positioningDescription || ''}
                            onChange={(e) => setTempProfile({
                              ...tempProfile!,
                              positioningDescription: e.target.value
                            })}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-300">{tenantProfile.positioningDescription}</p>
                        {tenantProfile.positioningTags && tenantProfile.positioningTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tenantProfile.positioningTags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 语言风格 */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-slate-200">语言风格</CardTitle>
                      <CardDescription className="text-slate-500">
                        内容表达的语言特点
                      </CardDescription>
                    </div>
                    {tenantProfile.languageStyle && (
                      <Badge className={languageStyleMap[tenantProfile.languageStyle].color}>
                        {languageStyleMap[tenantProfile.languageStyle].label}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="languageStyle" className="text-slate-300">语言风格</Label>
                          <select
                            id="languageStyle"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            value={tempProfile?.languageStyle || ''}
                            onChange={(e) => setTempProfile({
                              ...tempProfile!,
                              languageStyle: e.target.value as any
                            })}
                          >
                            <option value="">请选择</option>
                            <option value="formal">正式严谨</option>
                            <option value="concise">简洁明快</option>
                            <option value="vivid">生动活泼</option>
                            <option value="persuasive">说服力强</option>
                            <option value="popular">通俗易懂</option>
                            <option value="professional">专业术语</option>
                            <option value="other">其他</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="languageStyleDescription" className="text-slate-300">描述</Label>
                          <textarea
                            id="languageStyleDescription"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[80px]"
                            value={tempProfile?.languageStyleDescription || ''}
                            onChange={(e) => setTempProfile({
                              ...tempProfile!,
                              languageStyleDescription: e.target.value
                            })}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-300">{tenantProfile.languageStyleDescription}</p>
                        {tenantProfile.languageStyleExamples && tenantProfile.languageStyleExamples.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-300">示例：</h4>
                            <ul className="space-y-2 text-slate-400">
                              {tenantProfile.languageStyleExamples.map((example, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 视觉偏好 */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Palette className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-slate-200">视觉偏好</CardTitle>
                      <CardDescription className="text-slate-500">
                        视觉呈现的偏好
                      </CardDescription>
                    </div>
                    {tenantProfile.visualPreference && (
                      <Badge className={visualPreferenceMap[tenantProfile.visualPreference].color}>
                        {visualPreferenceMap[tenantProfile.visualPreference].label}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="visualPreference" className="text-slate-300">视觉偏好</Label>
                          <select
                            id="visualPreference"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            value={tempProfile?.visualPreference || ''}
                            onChange={(e) => setTempProfile({
                              ...tempProfile!,
                              visualPreference: e.target.value as any
                            })}
                          >
                            <option value="">请选择</option>
                            <option value="minimalist">极简风格</option>
                            <option value="modern">现代风格</option>
                            <option value="traditional">传统风格</option>
                            <option value="colorful">多彩风格</option>
                            <option value="gradient">渐变风格</option>
                            <option value="flat">扁平风格</option>
                            <option value="other">其他</option>
                          </select>
                        </div>
                        {tempProfile?.visualPreferenceDetail && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="primaryColor" className="text-slate-300">主色调</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="primaryColor"
                                  className="flex-1 bg-slate-800 border-slate-700 text-slate-200"
                                  value={tempProfile.visualPreferenceDetail.primaryColor || ''}
                                  onChange={(e) => setTempProfile({
                                    ...tempProfile,
                                    visualPreferenceDetail: {
                                      ...tempProfile.visualPreferenceDetail,
                                      primaryColor: e.target.value
                                    }
                                  })}
                                />
                                {tempProfile.visualPreferenceDetail.primaryColor && (
                                  <div
                                    className="w-8 h-8 rounded border border-slate-700"
                                    style={{ backgroundColor: tempProfile.visualPreferenceDetail.primaryColor }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="secondaryColor" className="text-slate-300">辅色调</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="secondaryColor"
                                  className="flex-1 bg-slate-800 border-slate-700 text-slate-200"
                                  value={tempProfile.visualPreferenceDetail.secondaryColor || ''}
                                  onChange={(e) => setTempProfile({
                                    ...tempProfile,
                                    visualPreferenceDetail: {
                                      ...tempProfile.visualPreferenceDetail,
                                      secondaryColor: e.target.value
                                    }
                                  })}
                                />
                                {tempProfile.visualPreferenceDetail.secondaryColor && (
                                  <div
                                    className="w-8 h-8 rounded border border-slate-700"
                                    style={{ backgroundColor: tempProfile.visualPreferenceDetail.secondaryColor }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {tenantProfile.visualPreferenceDetail && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {tenantProfile.visualPreferenceDetail.primaryColor && (
                                <div>
                                  <h4 className="font-medium text-slate-300 mb-2">主色调</h4>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-12 h-12 rounded border border-slate-700"
                                      style={{ backgroundColor: tenantProfile.visualPreferenceDetail.primaryColor }}
                                    />
                                    <span className="text-slate-400">{tenantProfile.visualPreferenceDetail.primaryColor}</span>
                                  </div>
                                </div>
                              )}
                              {tenantProfile.visualPreferenceDetail.secondaryColor && (
                                <div>
                                  <h4 className="font-medium text-slate-300 mb-2">辅色调</h4>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-12 h-12 rounded border border-slate-700"
                                      style={{ backgroundColor: tenantProfile.visualPreferenceDetail.secondaryColor }}
                                    />
                                    <span className="text-slate-400">{tenantProfile.visualPreferenceDetail.secondaryColor}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {tenantProfile.visualPreferenceDetail.fontFamily && (
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">字体偏好</h4>
                                <p className="text-slate-400">{tenantProfile.visualPreferenceDetail.fontFamily}</p>
                              </div>
                            )}
                            {tenantProfile.visualPreferenceDetail.imageStyle && (
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">图片风格</h4>
                                <p className="text-slate-400">{tenantProfile.visualPreferenceDetail.imageStyle}</p>
                              </div>
                            )}
                            {tenantProfile.visualPreferenceDetail.layoutPreference && (
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">版式偏好</h4>
                                <p className="text-slate-400">{tenantProfile.visualPreferenceDetail.layoutPreference}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 话题偏好 */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Tag className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-slate-200">话题偏好</CardTitle>
                      <CardDescription className="text-slate-500">
                        关注和讨论的话题倾向
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tenantProfile.topicPreference && tenantProfile.topicPreference.length > 0 ? (
                      <div className="space-y-4">
                        {editing ? (
                          <div className="space-y-3">
                            {tempProfile?.topicPreference?.map((topic, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <Input
                                  className="flex-1 bg-slate-800 border-slate-700 text-slate-200"
                                  value={topic.name}
                                  onChange={(e) => {
                                    const newTopics = [...tempProfile.topicPreference!];
                                    newTopics[index].name = e.target.value;
                                    setTempProfile({ ...tempProfile!, topicPreference: newTopics });
                                  }}
                                />
                                <Input
                                  className="w-20 bg-slate-800 border-slate-700 text-slate-200"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={topic.weight}
                                  onChange={(e) => {
                                    const newTopics = [...tempProfile.topicPreference!];
                                    newTopics[index].weight = parseInt(e.target.value);
                                    setTempProfile({ ...tempProfile!, topicPreference: newTopics });
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newTopics = tempProfile.topicPreference!.filter((_, i) => i !== index);
                                    setTempProfile({ ...tempProfile!, topicPreference: newTopics });
                                  }}
                                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTopics = [...tempProfile!.topicPreference || [], { name: '', weight: 50, frequency: 0.5 }];
                                setTempProfile({ ...tempProfile!, topicPreference: newTopics });
                              }}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              添加话题
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                              {tenantProfile.topicPreference.map((topic, index) => {
                                // 根据权重计算字体大小（0.75rem 到 1.5rem）
                                const fontSize = 0.75 + (topic.weight / 100) * 0.75; // 0.75-1.5rem
                                // 根据权重计算透明度（0.6 到 1）
                                const opacity = 0.6 + (topic.weight / 100) * 0.4;
                                return (
                                  <div
                                    key={index}
                                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/60 transition-colors cursor-pointer"
                                    style={{
                                      fontSize: `${fontSize}rem`,
                                      opacity: opacity,
                                    }}
                                    title={`权重: ${topic.weight}%, 频率: ${(topic.frequency * 100).toFixed(0)}%`}
                                  >
                                    <span className="text-amber-300 font-medium">
                                      {topic.name}
                                    </span>
                                    <span className="ml-1.5 text-xs text-amber-500/80">
                                      {topic.weight}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-sm text-slate-400">
                              <p>标签大小表示话题权重，颜色表示热度。点击标签可查看详细信息。</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500">暂无话题偏好数据</p>
                    )}
                  </CardContent>
                </Card>

                {/* 发布习惯 */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <Clock className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-slate-200">发布习惯</CardTitle>
                      <CardDescription className="text-slate-500">
                        内容发布的习惯
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tenantProfile.publishingHabits ? (
                      <div className="space-y-4">
                        {editing ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="frequency" className="text-slate-300">发布频率</Label>
                              <select
                                id="frequency"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                value={tempProfile?.publishingHabits?.frequency || ''}
                                onChange={(e) => setTempProfile({
                                  ...tempProfile!,
                                  publishingHabits: {
                                    ...tempProfile!.publishingHabits!,
                                    frequency: e.target.value
                                  }
                                })}
                              >
                                <option value="">请选择</option>
                                <option value="daily">每天</option>
                                <option value="weekly_1_2">每周1-2次</option>
                                <option value="weekly_3_4">每周3-4次</option>
                                <option value="weekly_5">每周5次以上</option>
                                <option value="monthly_1_2">每月1-2次</option>
                                <option value="occasional">偶尔发布</option>
                                <option value="irregular">不定期</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contentLength" className="text-slate-300">内容长度偏好</Label>
                              <select
                                id="contentLength"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                value={tempProfile?.publishingHabits?.contentLength || ''}
                                onChange={(e) => setTempProfile({
                                  ...tempProfile!,
                                  publishingHabits: {
                                    ...tempProfile!.publishingHabits!,
                                    contentLength: e.target.value as any
                                  }
                                })}
                              >
                                <option value="">请选择</option>
                                <option value="short">短篇</option>
                                <option value="medium">中篇</option>
                                <option value="long">长篇</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">最佳发布时段</h4>
                                <div className="flex flex-wrap gap-2">
                                  {tenantProfile.publishingHabits.bestTime.map((time, index) => (
                                    <Badge key={index} variant="outline" className="border-cyan-500/30 text-cyan-400">
                                      {bestTimeMap[time as keyof typeof bestTimeMap] || time}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">发布频率</h4>
                                <p className="text-slate-400">
                                  {frequencyMap[tenantProfile.publishingHabits.frequency as keyof typeof frequencyMap] || tenantProfile.publishingHabits.frequency}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">偏好平台</h4>
                                <div className="flex flex-wrap gap-2">
                                  {tenantProfile.publishingHabits.preferredPlatforms.map((platform, index) => (
                                    <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-300 mb-2">内容格式</h4>
                                <div className="flex flex-wrap gap-2">
                                  {tenantProfile.publishingHabits.postFormat.map((format, index) => (
                                    <Badge key={index} variant="outline" className="border-slate-700 text-slate-400">
                                      {format}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500">暂无发布习惯数据</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">尚未生成单位画像</h3>
                <p className="text-slate-500 mb-6">
                  请在左侧选择文档，然后点击"生成画像"按钮创建单位画像。
                </p>
                <Button
                  onClick={() => selectedDocs.length > 0 ? generateProfile() : {}}
                  disabled={selectedDocs.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-slate-950"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成单位画像
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantProfilePage;