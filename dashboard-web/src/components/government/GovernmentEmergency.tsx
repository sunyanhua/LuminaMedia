import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Siren, Globe, MessageSquare, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

// 应急事件类型
const emergencyTypes = [
  { id: 'natural', label: '自然灾害', icon: '🌪️', color: 'text-red-400' },
  { id: 'health', label: '公共卫生', icon: '🏥', color: 'text-red-400' },
  { id: 'safety', label: '安全事故', icon: '⚠️', color: 'text-amber-400' },
  { id: 'social', label: '社会治安', icon: '🚔', color: 'text-blue-400' },
];

// 发布渠道
const publishChannels = [
  { id: 'website', label: '政府网站', icon: Globe, status: 'ready' },
  { id: 'sms', label: '短信平台', icon: MessageSquare, status: 'ready' },
  { id: 'wechat', label: '微信公众号', icon: MessageSquare, status: 'ready' },
  { id: 'weibo', label: '政务微博', icon: Globe, status: 'ready' },
];

function GovernmentEmergency() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  // 确保演示模式开启
  useEffect(() => {
    localStorage.setItem('lumina-demo-mode', 'true');
  }, []);

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">应急响应</h2>
        <p className="text-slate-400">紧急情况下的快速信息发布与舆情监测</p>
      </div>

      {/* 事件类型选择 */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">选择应急事件类型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emergencyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedType === type.id
                    ? 'bg-red-500/10 border-red-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <span className={`font-medium ${type.color}`}>{type.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 应急通告生成 */}
      {selectedType && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-500" />
              <CardTitle className="text-slate-100">快速通告生成</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">事件标题</Label>
                <Input 
                  placeholder="例如：台风橙色预警" 
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  defaultValue="台风橙色预警"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">影响范围</Label>
                <Select defaultValue="city">
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">全市范围</SelectItem>
                    <SelectItem value="district">部分区县</SelectItem>
                    <SelectItem value="street">特定街道</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">应对措施</Label>
              <Textarea 
                placeholder="描述应对措施和建议..."
                className="bg-slate-800 border-slate-700 text-slate-100 min-h-[100px]"
                defaultValue="1. 市民尽量减少外出，关闭门窗；
2. 施工单位停止户外作业；
3. 学校可根据情况调整上课时间；
4. 如遇紧急情况请拨打12345市民热线。"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">公众指导建议</Label>
              <Textarea 
                placeholder="给公众的具体指导..."
                className="bg-slate-800 border-slate-700 text-slate-100 min-h-[80px]"
                defaultValue="请市民密切关注气象部门发布的最新预警信息，做好防台风准备。如遇险情，请及时撤离至安全区域。"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 多渠道发布 */}
      {selectedType && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">多渠道发布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {publishChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div 
                    key={channel.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      published 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${published ? 'text-green-500' : 'text-slate-400'}`} />
                      <span className="text-slate-200 font-medium">{channel.label}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        published 
                          ? 'border-green-500/30 text-green-400' 
                          : 'border-slate-600 text-slate-400'
                      }
                    >
                      {published ? '已发布' : '待发布'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {!published ? (
              <Button 
                onClick={handlePublish} 
                disabled={publishing}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {publishing ? (
                  <>
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                    发布中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    一键紧急发布
                  </>
                )}
              </Button>
            ) : (
              <div className="p-4 bg-green-900/10 border border-green-800/30 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-400 font-medium">发布成功</p>
                <p className="text-slate-500 text-sm">所有渠道已同步推送</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 舆情监测 */}
      {published && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">发布效果监测</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                <p className="text-3xl font-bold text-slate-200">85.6%</p>
                <p className="text-sm text-slate-400">信息到达率</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                <p className="text-3xl font-bold text-slate-200">12.3万</p>
                <p className="text-sm text-slate-400">触达人数</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                <p className="text-3xl font-bold text-green-400">0</p>
                <p className="text-sm text-slate-400">谣言监测</p>
              </div>
            </div>

            {/* 谣言监测 */}
            <div className="p-4 bg-green-900/10 border border-green-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-medium">谣言监测系统正常</span>
              </div>
              <p className="text-slate-400 text-sm">暂未发现与此次应急事件相关的谣言信息</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GovernmentEmergency;
