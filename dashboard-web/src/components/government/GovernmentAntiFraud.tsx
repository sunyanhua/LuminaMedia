import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, FileText, Image as ImageIcon, Video, Sparkles, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

// 模拟案例库
const fraudCases = [
  { id: 1, type: '冒充公检法', victims: 156, amount: '2,340万', trend: 'up' },
  { id: 2, type: '刷单返利', victims: 289, amount: '1,890万', trend: 'up' },
  { id: 3, type: '虚假投资', victims: 98, amount: '3,560万', trend: 'stable' },
  { id: 4, type: '冒充客服', victims: 234, amount: '980万', trend: 'down' },
];

function GovernmentAntiFraud() {
  const [showCreator, setShowCreator] = useState(false);
  const [generated, setGenerated] = useState(false);


  const handleGenerate = () => {
    setTimeout(() => setGenerated(true), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">防诈骗宣传</h2>
        <p className="text-slate-400">基于真实案例的反诈宣传材料生成工具</p>
      </div>

      {/* 案例库概览 */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100">近期诈骗案例趋势</CardTitle>
            <Badge variant="outline" className="border-red-500/30 text-red-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              高风险
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fraudCases.map((item) => (
              <div key={item.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-slate-200 font-medium mb-1">{item.type}</h4>
                <p className="text-2xl font-bold text-red-400">{item.victims}人</p>
                <p className="text-sm text-slate-500">涉案金额 {item.amount}</p>
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className={
                      item.trend === 'up' ? 'border-red-500/30 text-red-400' :
                      item.trend === 'down' ? 'border-green-500/30 text-green-400' :
                      'border-slate-500/30 text-slate-400'
                    }
                  >
                    {item.trend === 'up' ? '↑ 上升' : item.trend === 'down' ? '↓ 下降' : '→ 持平'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 创建宣传活动 */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100">创建宣传活动</CardTitle>
            <Button onClick={() => setShowCreator(!showCreator)}>
              <Plus className="w-4 h-4 mr-1" />
              {showCreator ? '取消' : '新建活动'}
            </Button>
          </div>
        </CardHeader>
        
        {showCreator && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">宣传主题</Label>
                <Input 
                  placeholder="例如：警惕冒充公检法诈骗" 
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  defaultValue="警惕冒充公检法诈骗"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">目标人群</Label>
                <Select defaultValue="elderly">
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elderly">老年人群</SelectItem>
                    <SelectItem value="students">学生群体</SelectItem>
                    <SelectItem value="enterprise">企业财务人员</SelectItem>
                    <SelectItem value="general">普通市民</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-200">活动周期</Label>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  defaultValue="2026-04-01"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <span className="text-slate-400 self-center">至</span>
                <Input 
                  type="date" 
                  defaultValue="2026-04-30"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full">
              <Sparkles className="w-4 h-4 mr-1" />
              AI生成宣传材料
            </Button>
          </CardContent>
        )}
      </Card>

      {/* 生成结果 */}
      {generated && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">生成的宣传材料</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="text-slate-200 font-medium">长图文</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">适合微信公众号、政务号发布</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-slate-600">已生成</Badge>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4 mr-1" /> 预览
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-green-500" />
                  <span className="text-slate-200 font-medium">短视频脚本</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">适合抖音、快手等平台</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-slate-600">已生成</Badge>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4 mr-1" /> 预览
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-5 h-5 text-green-500" />
                  <span className="text-slate-200 font-medium">海报设计</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">适合线下张贴、宣传栏</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-slate-600">已生成</Badge>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4 mr-1" /> 预览
                  </Button>
                </div>
              </div>
            </div>

            {/* 效果预测 */}
            <div className="mt-6 p-4 bg-green-900/10 border border-green-800/30 rounded-lg">
              <h4 className="text-green-400 font-medium mb-2">AI效果预测</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-200">15万+</p>
                  <p className="text-sm text-slate-500">预计触达人数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-200">8.5%</p>
                  <p className="text-sm text-slate-500">预估互动率</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-200">3.2%</p>
                  <p className="text-sm text-slate-500">知识转化率</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GovernmentAntiFraud;
