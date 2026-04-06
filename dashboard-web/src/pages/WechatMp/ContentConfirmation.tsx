import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, TextArea, ImageUploader, Toast, Space } from 'antd-mobile';
import { SetOutline, SendOutline, EyeOutline } from 'antd-mobile-icons';
import { ROUTE_PATHS } from '../../routes/index';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/apiClient';

// 富文本编辑器 - 暂时使用TextArea，后续替换为Quill
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// 敏感词列表（示例）
const SENSITIVE_WORDS = ['敏感词1', '敏感词2', '测试'];

// 内容状态类型
interface ContentDraftData {
  id?: string;
  title: string;
  content: string;
  summary: string;
  coverImage?: string;
  topicId?: string;
  status: 'draft' | 'pending_edit' | 'pending_manager' | 'pending_legal' | 'approved' | 'published' | 'rejected';
}

// 获取租户ID
const getTenantId = () => {
  const userStr = localStorage.getItem('lumina-user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.tenantId;
    } catch {
      return null;
    }
  }
  return null;
};

export default function ContentConfirmation() {
  const { id } = useParams<{ id?: string }>(); // draftId 或 topicId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ContentDraftData>({
    title: '',
    content: '',
    summary: '',
    coverImage: '',
    status: 'draft',
  });

  // 内容检查结果
  const [checkResults, setCheckResults] = useState({
    sensitiveWords: [] as string[],
    formatValid: true,
    wordCount: 0,
    wordCountValid: true,
  });

  // 初始化加载草稿
  useEffect(() => {
    if (id) {
      loadDraft(id);
    }
  }, [id]);

  const loadDraft = async (draftId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/content-drafts/${draftId}`) as { data: ContentDraftData };
      setDraft(response.data);
      performContentCheck(response.data.content);
    } catch (error) {
      console.error('加载草稿失败:', error);
      Toast.show('加载草稿失败');
    } finally {
      setLoading(false);
    }
  };

  // 内容检查函数
  const performContentCheck = (content: string) => {
    const words = content.split(/\s+/);
    const foundSensitive = SENSITIVE_WORDS.filter(word =>
      content.toLowerCase().includes(word.toLowerCase())
    );
    const wordCount = words.length;
    const formatValid = content.length > 0 && content.length < 10000;
    const wordCountValid = wordCount >= 100 && wordCount <= 5000;

    setCheckResults({
      sensitiveWords: foundSensitive,
      formatValid,
      wordCount,
      wordCountValid,
    });
  };

  // 内容变化处理
  const handleContentChange = (value: string) => {
    setDraft(prev => ({ ...prev, content: value }));
    performContentCheck(value);
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const tenantId = getTenantId();
      const payload = {
        ...draft,
        userId: user?.id,
        tenantId: tenantId,
      };

      const url = draft.id
        ? `/api/content-drafts/${draft.id}`
        : '/api/content-drafts';

      let response;
      if (draft.id) {
        response = await api.put(url, payload) as { data: ContentDraftData };
      } else {
        response = await api.post(url, payload) as { data: ContentDraftData };
      }
      setDraft(response.data);
      Toast.show('草稿保存成功');
    } catch (error) {
      console.error('保存草稿失败:', error);
      Toast.show('保存草稿失败');
    } finally {
      setSaving(false);
    }
  };

  // 提交审核
  const handleSubmitReview = async () => {
    if (!checkResults.formatValid || !checkResults.wordCountValid) {
      Toast.show('请先解决内容检查中的问题');
      return;
    }

    if (checkResults.sensitiveWords.length > 0) {
      Toast.show('内容包含敏感词，请修改后再提交');
      return;
    }

    try {
      setLoading(true);
      const tenantId = getTenantId();
      const payload = {
        ...draft,
        status: 'pending_edit', // 进入初审
        userId: user?.id,
        tenantId: tenantId,
      };

      const url = draft.id
        ? `/api/content-drafts/${draft.id}/submit`
        : '/api/content-drafts/submit';

      await api.post(url, payload);
      Toast.show('提交审核成功');
      navigate(ROUTE_PATHS.GOVERNMENT_WECHAT_MP);
    } catch (error) {
      console.error('提交审核失败:', error);
      Toast.show('提交审核失败');
    } finally {
      setLoading(false);
    }
  };

  // 图片上传处理
  const handleCoverImageUpload = async (file: File): Promise<{ url: string }> => {
    // 模拟上传，实际应调用API
    const url = URL.createObjectURL(file);
    setDraft(prev => ({ ...prev, coverImage: url }));
    return { url };
  };

  // 预览功能
  const handlePreview = () => {
    // 打开预览页面
    window.open(`/preview/content/${draft.id || 'new'}`, '_blank');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* 标题栏 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">内容确认</h1>
        <p className="text-gray-500">请编辑和确认内容，完成后提交审核</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧编辑区域 */}
        <div className="lg:w-2/3">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">标题</label>
            <Input
              value={draft.title}
              onChange={value => setDraft(prev => ({ ...prev, title: value }))}
              placeholder="请输入文章标题"
              className="mb-4"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">正文</label>
            <div className="border rounded-lg overflow-hidden">
              <TextArea
                value={draft.content}
                onChange={handleContentChange}
                placeholder="请输入正文内容..."
                rows={15}
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">摘要</label>
            <TextArea
              value={draft.summary}
              onChange={value => setDraft(prev => ({ ...prev, summary: value }))}
              placeholder="请输入文章摘要"
              rows={3}
            />
          </div>
        </div>

        {/* 右侧辅助面板 */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-4 space-y-6">
            {/* 封面图上传 */}
            <div>
              <h3 className="font-medium mb-3">封面图</h3>
              <ImageUploader
                value={draft.coverImage ? [{ url: draft.coverImage }] : []}
                onChange={() => {}}
                maxCount={1}
                upload={handleCoverImageUpload}
                preview={true}
              />
              <p className="text-xs text-gray-500 mt-2">建议尺寸：900x500像素</p>
            </div>

            {/* 内容检查 */}
            <div>
              <h3 className="font-medium mb-3">内容检查</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">字数统计：</span>
                  <span className={`text-sm ${checkResults.wordCountValid ? 'text-green-600' : 'text-red-600'}`}>
                    {checkResults.wordCount} 字
                    {!checkResults.wordCountValid && ' (建议100-5000字)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">格式检查：</span>
                  <span className={`text-sm ${checkResults.formatValid ? 'text-green-600' : 'text-red-600'}`}>
                    {checkResults.formatValid ? '通过' : '内容过长'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">敏感词检测：</span>
                  <span className={`text-sm ${checkResults.sensitiveWords.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {checkResults.sensitiveWords.length === 0 ? '通过' : `发现${checkResults.sensitiveWords.length}个敏感词`}
                  </span>
                </div>
                {checkResults.sensitiveWords.length > 0 && (
                  <div className="text-xs text-red-600">
                    敏感词：{checkResults.sensitiveWords.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button
                block
                color="primary"
                loading={saving}
                onClick={handleSaveDraft}
              >
                <Space>
                  <SetOutline />
                  <span>保存草稿</span>
                </Space>
              </Button>

              <Button
                block
                color="success"
                loading={loading}
                onClick={handleSubmitReview}
                disabled={!draft.title || !draft.content}
              >
                <Space>
                  <SendOutline />
                  <span>提交审核</span>
                </Space>
              </Button>

              <Button
                block
                color="default"
                onClick={handlePreview}
                disabled={!draft.content}
              >
                <Space>
                  <EyeOutline />
                  <span>预览</span>
                </Space>
              </Button>
            </div>

            {/* 状态提示 */}
            <div className="text-xs text-gray-500">
              <p>• 保存草稿后可随时继续编辑</p>
              <p>• 提交审核后将进入三审三校流程</p>
              <p>• 审核通过后可一键发布到微信公众号</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
