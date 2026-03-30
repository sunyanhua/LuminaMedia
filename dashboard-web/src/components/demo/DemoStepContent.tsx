import React from 'react';
import { useDemoStore, useCurrentStep, useCustomerData, useAnalysisResults, useMarketingPlans, usePublishedContents, useIsProcessing } from '@/store/useDemoStore';
import { cn } from '@/lib/utils';
import { Upload, BarChart3, FileText, Send, Eye, Download, Users, TrendingUp, Target, Globe } from 'lucide-react';

interface DemoStepContentProps {
  stepId: string;
}

const DemoStepContent: React.FC<DemoStepContentProps> = ({ stepId }) => {
  const currentStep = useCurrentStep();
  const customerData = useCustomerData();
  const analysisResults = useAnalysisResults();
  const marketingPlans = useMarketingPlans();
  const publishedContents = usePublishedContents();
  const isProcessing = useIsProcessing();
  const importData = useDemoStore((state) => state.importData);
  const runAnalysis = useDemoStore((state) => state.runAnalysis);
  const generatePlan = useDemoStore((state) => state.generatePlan);
  const publishContent = useDemoStore((state) => state.publishContent);

  const handleImportData = async () => {
    const file = new File(['demo-data'], '客户数据.csv', { type: 'text/csv' });
    await importData(file);
  };

  const handleRunAnalysis = async () => {
    await runAnalysis();
  };

  const handleGeneratePlan = async () => {
    await generatePlan();
  };

  const handlePublishContent = async () => {
    await publishContent('微信公众号');
  };

  const renderDataImportStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">数据导入</h4>
            <p className="text-sm text-slate-400">上传客户数据文件或使用模拟数据</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-slate-300 mb-2">上传真实数据</h5>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-2">拖放文件或点击上传</p>
                <p className="text-xs text-slate-500">支持 CSV, Excel 格式，最大 100MB</p>
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" />
              </div>
            </div>
            <div className="text-sm text-slate-400">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>数据格式自动检测</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>数据质量检查</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>重复记录自动去重</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-slate-300 mb-2">使用模拟数据</h5>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="font-medium text-slate-200">商场客户数据集</div>
                    <div className="text-xs text-slate-500">10,000条真实模拟数据</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-slate-400">包含字段:</div>
                  <div className="text-slate-300">姓名、年龄、消费记录等</div>
                  <div className="text-slate-400">数据质量:</div>
                  <div className="text-slate-300">高质量模拟</div>
                  <div className="text-slate-400">更新时间:</div>
                  <div className="text-slate-300">2026-03-30</div>
                </div>
                <button
                  className={cn(
                    "w-full mt-4 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    isProcessing
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  onClick={handleImportData}
                  disabled={isProcessing}
                >
                  {isProcessing ? '正在导入...' : '导入模拟数据'}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-slate-300">数据概览</div>
                <div className="text-xs text-slate-500">
                  {customerData.length > 0 ? `${customerData.length} 条记录` : '暂无数据'}
                </div>
              </div>
              {customerData.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">会员分布:</span>
                    <span className="text-slate-300">
                      {customerData.filter(c => c.membershipLevel === 'gold' || c.membershipLevel === 'platinum').length} 名高级会员
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">平均消费:</span>
                    <span className="text-slate-300">
                      ¥{Math.round(customerData.reduce((sum, c) => sum + c.totalSpent, 0) / customerData.length)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">数据完整度:</span>
                    <span className="text-slate-300">98%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                  尚未导入数据，请选择数据源
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">数据分析</h4>
            <p className="text-sm text-slate-400">AI智能分析用户画像和行为模式</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-slate-300">分析类型</h5>
              <span className="text-xs text-slate-500">
                {analysisResults.length > 0 ? `${analysisResults.length} 个分析完成` : '等待分析'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div className="font-medium text-slate-200">客户细分分析</div>
                </div>
                <p className="text-sm text-slate-400 mb-3">基于消费行为和人口统计特征划分客户群体</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">预计耗时: 30秒</span>
                  <button
                    className={cn(
                      "px-3 py-1 text-sm rounded-lg transition-colors",
                      isProcessing
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    onClick={handleRunAnalysis}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '分析中...' : '开始分析'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 opacity-60">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div className="font-medium text-slate-200">消费趋势分析</div>
                </div>
                <p className="text-sm text-slate-400 mb-3">分析季节性消费模式和增长趋势</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">高级功能</span>
                  <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">即将推出</span>
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 opacity-60">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <div className="font-medium text-slate-200">预测分析</div>
                </div>
                <p className="text-sm text-slate-400 mb-3">预测未来消费行为和客户流失风险</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">高级功能</span>
                  <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">即将推出</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">分析结果</h5>

            {analysisResults.length > 0 ? (
              <div className="space-y-4">
                {analysisResults.map((result, index) => (
                  <div key={result.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-200">{result.title}</div>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                        已完成
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{result.summary}</p>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-300">核心洞察:</div>
                      <ul className="space-y-1">
                        {result.insights.slice(0, 3).map((insight, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        数据点: {result.dataPoints.toLocaleString()}
                      </div>
                      <button className="text-xs text-blue-400 hover:text-blue-300">
                        查看完整报告 →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h5 className="font-medium text-slate-300 mb-2">暂无分析结果</h5>
                <p className="text-sm text-slate-500">运行分析后，结果将在此显示</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategyStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">营销策划</h4>
            <p className="text-sm text-slate-400">基于分析结果生成个性化营销方案</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-slate-300">方案生成</h5>
              <span className="text-xs text-slate-500">
                {marketingPlans.length > 0 ? `${marketingPlans.length} 个方案生成` : '等待生成'}
              </span>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">目标客户群体</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                    <option value="high-value">高价值客户 (消费前20%)</option>
                    <option value="young-active">年轻活跃群体 (25-35岁)</option>
                    <option value="family">家庭消费者</option>
                    <option value="new">新客户 (注册30天内)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">营销目标</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                    <option value="retention">客户留存与忠诚度</option>
                    <option value="acquisition">新客户获取</option>
                    <option value="revenue">收入增长</option>
                    <option value="awareness">品牌知名度</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">预算范围</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1000"
                      max="100000"
                      step="1000"
                      defaultValue="50000"
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-300">¥50,000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">时间范围</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                      defaultValue="2026-04-25"
                    />
                    <span className="text-slate-400">至</span>
                    <input
                      type="date"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300"
                      defaultValue="2026-05-05"
                    />
                  </div>
                </div>

                <button
                  className={cn(
                    "w-full mt-2 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    isProcessing
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                  onClick={handleGeneratePlan}
                  disabled={isProcessing}
                >
                  {isProcessing ? '生成中...' : '生成营销方案'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">生成的方案</h5>

            {marketingPlans.length > 0 ? (
              <div className="space-y-4">
                {marketingPlans.map((plan) => (
                  <div key={plan.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-200">{plan.name}</div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        plan.status === 'draft' ? "bg-yellow-500/20 text-yellow-500" :
                        plan.status === 'approved' ? "bg-green-500/20 text-green-500" :
                        "bg-blue-500/20 text-blue-500"
                      )}>
                        {plan.status === 'draft' ? '草稿' :
                         plan.status === 'approved' ? '已批准' : '执行中'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{plan.description}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="text-slate-400">目标受众:</div>
                      <div className="text-slate-300">{plan.targetAudience}</div>
                      <div className="text-slate-400">预算:</div>
                      <div className="text-slate-300">¥{plan.budget.toLocaleString()}</div>
                      <div className="text-slate-400">预计ROI:</div>
                      <div className="text-slate-300">{plan.expectedROI}x</div>
                      <div className="text-slate-400">时间:</div>
                      <div className="text-slate-300">{plan.timeline}</div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="text-sm font-medium text-slate-300 mb-2">使用渠道:</div>
                      <div className="flex flex-wrap gap-2">
                        {plan.channels.map((channel, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h5 className="font-medium text-slate-300 mb-2">暂无营销方案</h5>
                <p className="text-sm text-slate-500">生成方案后，将在此显示</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Send className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">内容生成</h4>
            <p className="text-sm text-slate-400">为营销方案创建多平台宣传内容</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">内容生成设置</h5>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">选择营销方案</label>
                  {marketingPlans.length > 0 ? (
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                      {marketingPlans.map(plan => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      请先生成营销方案
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">内容格式</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['长图文', '短视频', '海报', '推文'].map(format => (
                      <label key={format} className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700">
                        <input type="checkbox" className="rounded bg-slate-700 border-slate-600" defaultChecked={format === '长图文'} />
                        <span className="text-sm text-slate-300">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">目标平台</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['微信公众号', '小红书', '抖音', '微博'].map(platform => (
                      <label key={platform} className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700">
                        <input type="checkbox" className="rounded bg-slate-700 border-slate-600" defaultChecked={platform === '微信公众号'} />
                        <span className="text-sm text-slate-300">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">内容风格</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                    <option value="professional">专业正式</option>
                    <option value="friendly">亲切友好</option>
                    <option value="trendy">时尚潮流</option>
                    <option value="humorous">幽默风趣</option>
                  </select>
                </div>

                <button
                  className={cn(
                    "w-full mt-2 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    isProcessing || marketingPlans.length === 0
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  )}
                  onClick={handlePublishContent}
                  disabled={isProcessing || marketingPlans.length === 0}
                >
                  {isProcessing ? '生成中...' : '生成宣传内容'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">内容预览</h5>

            {publishedContents.length > 0 ? (
              <div className="space-y-4">
                {publishedContents.map((content) => (
                  <div key={content.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-200">{content.title}</div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        content.status === 'published' ? "bg-green-500/20 text-green-500" :
                        content.status === 'draft' ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-red-500/20 text-red-500"
                      )}>
                        {content.status === 'published' ? '已发布' :
                         content.status === 'draft' ? '草稿' : '失败'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-400">平台: {content.platform}</span>
                      {content.publishDate && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-sm text-slate-400">
                            发布于: {new Date(content.publishDate).toLocaleDateString('zh-CN')}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-3">
                      <div className="text-sm text-slate-300 mb-2">【五一黄金周特惠】🎉</div>
                      <div className="text-sm text-slate-400 mb-2">
                        亲爱的顾客，五一假期即将到来！我们为您准备了专属优惠：
                      </div>
                      <div className="text-sm text-slate-300 mb-2">
                        • 全场商品8折起<br/>
                        • 满500减100优惠券<br/>
                        • 会员双倍积分活动
                      </div>
                      <div className="text-sm text-slate-400">
                        活动时间：4月25日-5月5日<br/>
                        快来门店选购吧！👉
                      </div>
                    </div>

                    {content.views !== undefined && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-slate-400">阅读量:</div>
                        <div className="text-slate-300">{content.views.toLocaleString()}</div>
                        <div className="text-slate-400">互动率:</div>
                        <div className="text-slate-300">{(content.engagement! * 100).toFixed(1)}%</div>
                        {content.url && (
                          <>
                            <div className="text-slate-400">链接:</div>
                            <div className="text-slate-300 truncate">
                              <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                查看原文
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h5 className="font-medium text-slate-300 mb-2">暂无生成内容</h5>
                <p className="text-sm text-slate-500">生成内容后，将在此显示预览</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublishStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">发布跟踪</h4>
            <p className="text-sm text-slate-400">监控内容发布状态和效果数据</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h5 className="font-medium text-slate-300">发布状态总览</h5>

            {publishedContents.length > 0 ? (
              <div className="space-y-4">
                {publishedContents.map((content) => (
                  <div key={content.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          content.status === 'published' ? "bg-green-500 animate-pulse" :
                          content.status === 'draft' ? "bg-yellow-500" :
                          "bg-red-500"
                        )} />
                        <div className="font-medium text-slate-200">{content.title}</div>
                      </div>
                      <div className="text-sm text-slate-400">{content.platform}</div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-200">{content.views?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-slate-500">阅读量</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-200">{content.engagement ? `${(content.engagement * 100).toFixed(1)}%` : '0%'}</div>
                        <div className="text-xs text-slate-500">互动率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-200">
                          {content.views ? Math.round(content.views * 0.05).toLocaleString() : '0'}
                        </div>
                        <div className="text-xs text-slate-500">点赞数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-200">
                          {content.views ? Math.round(content.views * 0.01).toLocaleString() : '0'}
                        </div>
                        <div className="text-xs text-slate-500">评论数</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        发布时间: {new Date(content.publishDate).toLocaleString('zh-CN')}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">
                          详细数据
                        </button>
                        <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                          优化建议
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h5 className="font-medium text-slate-300 mb-2">暂无发布内容</h5>
                <p className="text-sm text-slate-500">发布内容后，状态将在此显示</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">发布分析</h5>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-200">
                    {publishedContents.length}
                  </div>
                  <div className="text-sm text-slate-400">已发布内容</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">发布成功率:</span>
                    <span className="text-slate-300">
                      {publishedContents.length > 0 ?
                        `${(publishedContents.filter(c => c.status === 'published').length / publishedContents.length * 100).toFixed(0)}%` :
                        '0%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">总阅读量:</span>
                    <span className="text-slate-300">
                      {publishedContents.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">平均互动率:</span>
                    <span className="text-slate-300">
                      {publishedContents.length > 0 ?
                        `${(publishedContents.reduce((sum, c) => sum + (c.engagement || 0), 0) / publishedContents.length * 100).toFixed(1)}%` :
                        '0%'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700">
                  <div className="text-sm font-medium text-slate-300 mb-2">平台分布</div>
                  <div className="space-y-2">
                    {['微信公众号', '小红书', '抖音', '微博'].map(platform => {
                      const count = publishedContents.filter(c => c.platform === platform).length;
                      return (
                        <div key={platform} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">{platform}</span>
                          <span className="text-slate-300">{count} 篇</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <h6 className="font-medium text-slate-300 mb-3">发布建议</h6>
              <ul className="space-y-2">
                <li className="text-sm text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  最佳发布时间: 工作日 19:00-21:00
                </li>
                <li className="text-sm text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  小红书内容建议添加更多话题标签
                </li>
                <li className="text-sm text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  微信公众号可增加互动抽奖活动
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">效果监测</h4>
            <p className="text-sm text-slate-400">实时监控营销活动效果和投资回报率</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">关键绩效指标</h5>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-200 mb-1">
                  ¥{(publishedContents.length * 50000 * 0.032).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">预计收入增长</div>
                <div className="text-xs text-green-500 mt-1">+3.2% ROI</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-200 mb-1">
                  {publishedContents.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">总曝光量</div>
                <div className="text-xs text-blue-500 mt-1">+125% 环比</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-200 mb-1">
                  {publishedContents.length > 0 ?
                    (publishedContents.reduce((sum, c) => sum + (c.engagement || 0), 0) / publishedContents.length * 100).toFixed(1) + '%' :
                    '0%'}
                </div>
                <div className="text-sm text-slate-400">平均互动率</div>
                <div className="text-xs text-amber-500 mt-1">行业平均 2.1%</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-200 mb-1">
                  {customerData.filter(c => c.membershipLevel === 'gold' || c.membershipLevel === 'platinum').length}
                </div>
                <div className="text-sm text-slate-400">高价值客户</div>
                <div className="text-xs text-purple-500 mt-1">占总数 15%</div>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <h6 className="font-medium text-slate-300 mb-3">ROI分析</h6>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">总投入:</span>
                  <span className="text-slate-300">¥{marketingPlans.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">预计产出:</span>
                  <span className="text-slate-300">¥{(marketingPlans.reduce((sum, p) => sum + p.budget, 0) * 3.2).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">投资回报率:</span>
                  <span className="text-slate-300">{marketingPlans.length > 0 ? marketingPlans[0].expectedROI : 0}x</span>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">回本周期:</span>
                    <span className="text-slate-300">约 45 天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-slate-300">效果趋势</h5>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-slate-300">各平台表现对比</div>
                <select className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300">
                  <option>过去7天</option>
                  <option>过去30天</option>
                  <option>自定义范围</option>
                </select>
              </div>

              <div className="space-y-3">
                {['微信公众号', '小红书', '抖音', '微博'].map(platform => {
                  const contents = publishedContents.filter(c => c.platform === platform);
                  const avgEngagement = contents.length > 0 ?
                    contents.reduce((sum, c) => sum + (c.engagement || 0), 0) / contents.length : 0;

                  return (
                    <div key={platform} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{platform}</span>
                        <span className="text-slate-400">{contents.length} 篇</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(avgEngagement * 1000, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>互动率: {(avgEngagement * 100).toFixed(1)}%</span>
                        <span>阅读量: {contents.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <h6 className="font-medium text-slate-300 mb-3">优化建议</h6>
              <ul className="space-y-2">
                <li className="text-sm text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-slate-300">增加视频内容比例</div>
                    <div className="text-xs text-slate-500">视频内容互动率比图文高 47%</div>
                  </div>
                </li>
                <li className="text-sm text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-slate-300">优化发布时间</div>
                    <div className="text-xs text-slate-500">周末下午发布效果最佳</div>
                  </div>
                </li>
                <li className="text-sm text-slate-400 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-slate-300">增加用户互动元素</div>
                    <div className="text-xs text-slate-500">抽奖活动可提升参与度 2-3倍</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (stepId) {
    case 'data-import':
      return renderDataImportStep();
    case 'analysis':
      return renderAnalysisStep();
    case 'strategy':
      return renderStrategyStep();
    case 'content':
      return renderContentStep();
    case 'publish':
      return renderPublishStep();
    case 'monitoring':
      return renderMonitoringStep();
    default:
      return <div>未知步骤</div>;
  }
};

// 辅助组件
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export default DemoStepContent;