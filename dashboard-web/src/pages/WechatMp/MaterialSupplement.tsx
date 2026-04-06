import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image as ImageIcon, Video, X, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileCard } from '@/components/mobile/MobileCard';

interface Topic {
  id: string;
  title: string;
  description: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url?: string;
  description?: string;
}

export default function MaterialSupplement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [textMaterial, setTextMaterial] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [knowledgeBaseDocs, setKnowledgeBaseDocs] = useState<Array<{ id: string; title: string }>>([]);

  // 获取选题详情
  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem('lumina-token');
        const response = await fetch(`/api/topics/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTopic(data);
        }
      } catch (error) {
        toast({ title: '获取选题失败', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id, toast]);

  // 模拟文件上传
  const handleFileUpload = (type: 'image' | 'video' | 'document') => {
    const mockFile: UploadedFile = {
      id: Date.now().toString(),
      name: type === 'image' ? '示例图片.jpg' : type === 'video' ? '示例视频.mp4' : '示例文档.pdf',
      type,
    };
    setUploadedFiles([...uploadedFiles, mockFile]);
    toast({ title: `${type === 'image' ? '图片' : type === 'video' ? '视频' : '文档'}上传成功` });
  };

  // 移除文件
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
  };

  // 保存并进入下一步
  const handleNext = async () => {
    setSaving(true);
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: '资料补充完成', description: '正在进入内容生成页面...' });
    navigate(`/government/content-confirm/${id}`);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">资料补充</h1>
        <p className="text-slate-400 mt-1">为选题添加文字、图片、视频等素材</p>
      </div>

      {/* 已选选题 */}
      {topic && (
        <MobileCard className="border-l-4 border-l-amber-500">
          <div className="text-sm text-slate-400 mb-1">当前选题</div>
          <h2 className="text-lg font-semibold text-slate-100">{topic.title}</h2>
          {topic.description && <p className="text-slate-400 mt-1">{topic.description}</p>}
        </MobileCard>
      )}

      {/* 文字素材 */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            文字素材
          </CardTitle>
          <CardDescription className="text-slate-400">
            添加补充说明、要点、背景资料等文字内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={textMaterial}
            onChange={(e) => setTextMaterial(e.target.value)}
            placeholder="输入文字素材..."
            rows={6}
            className="bg-slate-800 border-slate-600 text-slate-100"
          />
        </CardContent>
      </Card>

      {/* 图片上传 */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            图片素材
          </CardTitle>
          <CardDescription className="text-slate-400">上传配图，支持多张图片</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {uploadedFiles.filter(f => f.type === 'image').map(file => (
              <div key={file.id} className="relative aspect-square bg-slate-800 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-600" />
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 right-1 text-xs text-slate-400 truncate px-1">{file.name}</span>
              </div>
            ))}
            <button
              onClick={() => handleFileUpload('image')}
              className="aspect-square border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">上传图片</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 视频上传 */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-500" />
            视频素材
          </CardTitle>
          <CardDescription className="text-slate-400">上传视频（可选）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {uploadedFiles.filter(f => f.type === 'video').map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-300">{file.name}</span>
                </div>
                <button onClick={() => handleRemoveFile(file.id)} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => handleFileUpload('video')}
              className="w-full p-4 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center gap-2 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>上传视频</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 文档上传 */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            参考文档
          </CardTitle>
          <CardDescription className="text-slate-400">上传Word/PDF文档作为参考</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {uploadedFiles.filter(f => f.type === 'document').map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">{file.name}</span>
                </div>
                <button onClick={() => handleRemoveFile(file.id)} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => handleFileUpload('document')}
              className="w-full p-4 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center gap-2 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>上传文档</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 底部操作 */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/government/topic-selection')}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          返回
        </Button>
        <Button
          onClick={handleNext}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          下一步：内容生成
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
