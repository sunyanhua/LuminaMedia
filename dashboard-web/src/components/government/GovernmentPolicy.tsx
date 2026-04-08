import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Sparkles, Download, Share2 } from 'lucide-react';
import { useState } from 'react';

function GovernmentPolicy() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);


  // 模拟文件选择
  const handleFileSelect = () => {
    setSelectedFile('关于促进新能源汽车产业发展的若干政策.pdf');
    setTimeout(() => setAnalysisComplete(true), 1500);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">政策解读</h2>
        <p className="text-slate-400">AI辅助政策分析与多版本解读材料生成</p>
      </div>

      {/* 文件上传区域 */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-8">
          {!selectedFile ? (
            <div 
              onClick={handleFileSelect}
              className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">上传政策文件</h3>
              <p className="text-slate-400 mb-4">支持 PDF、Word、TXT 格式</p>
              <Button variant="outline" className="border-slate-700">
                选择文件
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-slate-200 font-medium">{selectedFile}</p>
                  <p className="text-slate-500 text-sm">2.3 MB · PDF</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setAnalysisComplete(false); }}>
                移除
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI分析结果 */}
      {analysisComplete && (
        <>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-slate-100">AI政策分析结果</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">政策要点</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• 购车补贴最高2万元</li>
                    <li>• 免征购置税延至2027</li>
                    <li>• 充电基础设施建设</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">影响范围</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• 新能源汽车制造企业</li>
                    <li>• 充电设施运营商</li>
                    <li>• 终端消费者</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">实施难点</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>• 地方配套资金落实</li>
                    <li>• 充电设施用地协调</li>
                    <li>• 旧车置换流程优化</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 多版本解读材料 */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">多版本解读材料</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="official" className="w-full">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="official">官方版</TabsTrigger>
                  <TabsTrigger value="public">公众版</TabsTrigger>
                  <TabsTrigger value="enterprise">企业版</TabsTrigger>
                </TabsList>
                <TabsContent value="official" className="mt-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Badge className="mb-2 bg-blue-500/10 text-blue-400">严谨正式</Badge>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      为贯彻落实国家新能源汽车产业发展战略，进一步推进本市新能源汽车推广应用，
                      现就促进新能源汽车产业发展提出以下政策措施...
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-700">
                        <Download className="w-4 h-4 mr-1" /> 下载
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-700">
                        <Share2 className="w-4 h-4 mr-1" /> 分享
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="public" className="mt-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Badge className="mb-2 bg-green-500/10 text-green-400">通俗易懂</Badge>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      想买新能源车的朋友注意啦！政府出台新政策，买车最高能省2万元，
                      而且购置税全免政策延长到2027年，快来看看怎么申请...
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-700">
                        <Download className="w-4 h-4 mr-1" /> 下载
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-700">
                        <Share2 className="w-4 h-4 mr-1" /> 分享
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="enterprise" className="mt-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Badge className="mb-2 bg-amber-500/10 text-amber-400">企业导向</Badge>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      本政策为新能源汽车产业链企业带来重大利好，生产企业可享受研发补贴，
                      充电设施运营商可获得建设补贴，建议企业尽快对接相关部门...
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-700">
                        <Download className="w-4 h-4 mr-1" /> 下载
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-700">
                        <Share2 className="w-4 h-4 mr-1" /> 分享
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default GovernmentPolicy;
