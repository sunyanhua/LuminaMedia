import React from 'react';
import { useDemoStore, useOperationHistory } from '@/store/useDemoStore';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, RefreshCw, Upload, BarChart3, FileText, Send, Trash2 } from 'lucide-react';

const OperationHistory: React.FC = () => {
  const operationHistory = useOperationHistory();
  const replayOperation = useDemoStore((state) => state.replayOperation);

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'data_import':
        return <Upload className="w-4 h-4" />;
      case 'analysis':
        return <BarChart3 className="w-4 h-4" />;
      case 'plan_generation':
        return <FileText className="w-4 h-4" />;
      case 'content_creation':
        return <FileText className="w-4 h-4" />;
      case 'publish':
        return <Send className="w-4 h-4" />;
      case 'reset':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'data_import':
        return '数据导入';
      case 'analysis':
        return '数据分析';
      case 'plan_generation':
        return '计划生成';
      case 'content_creation':
        return '内容创建';
      case 'publish':
        return '内容发布';
      case 'reset':
        return '重置演示';
      default:
        return type;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderOperationDetails = (details: any) => {
    if (!details) return null;

    if (details.fileName) {
      return (
        <div className="text-xs text-slate-400">
          文件: <span className="text-slate-300">{details.fileName}</span>
          {details.recordCount && (
            <span className="ml-2">
              记录: <span className="text-slate-300">{details.recordCount}条</span>
            </span>
          )}
        </div>
      );
    }

    if (details.analysisType) {
      return (
        <div className="text-xs text-slate-400">
          分析类型: <span className="text-slate-300">{details.analysisType}</span>
          {details.dataPoints && (
            <span className="ml-2">
              数据点: <span className="text-slate-300">{details.dataPoints}</span>
            </span>
          )}
        </div>
      );
    }

    if (details.planName) {
      return (
        <div className="text-xs text-slate-400">
          方案: <span className="text-slate-300">{details.planName}</span>
          {details.budget && (
            <span className="ml-2">
              预算: <span className="text-slate-300">¥{details.budget}</span>
            </span>
          )}
        </div>
      );
    }

    if (details.platform) {
      return (
        <div className="text-xs text-slate-400">
          平台: <span className="text-slate-300">{details.platform}</span>
          {details.contentTitle && (
            <span className="ml-2">
              标题: <span className="text-slate-300 truncate max-w-[100px]">{details.contentTitle}</span>
            </span>
          )}
        </div>
      );
    }

    return JSON.stringify(details);
  };

  // 按日期分组操作记录
  const groupedOperations = operationHistory.reduce((groups, record) => {
    const date = new Date(record.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, typeof operationHistory>);

  return (
    <div className="operation-history bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">操作记录</h3>
          <p className="text-sm text-slate-400 mt-1">记录所有演示操作，支持回放和历史追踪</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-400">
            总计: <span className="font-medium text-slate-300">{operationHistory.length} 条记录</span>
          </div>
          <button
            className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1"
            onClick={() => useDemoStore.getState().resetDemo()}
          >
            <Trash2 className="w-4 h-4" />
            清空记录
          </button>
        </div>
      </div>

      {operationHistory.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-slate-600" />
          </div>
          <h4 className="text-lg font-medium text-slate-300 mb-2">暂无操作记录</h4>
          <p className="text-sm text-slate-500">开始演示流程后，您的操作将在此记录</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {Object.entries(groupedOperations).map(([date, records]) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm py-2 z-10">
                <h4 className="text-sm font-medium text-slate-400">
                  {new Date(date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 操作记录
                </h4>
              </div>
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "history-item p-4 rounded-lg border transition-all",
                      record.success
                        ? "bg-slate-800/30 border-slate-700"
                        : "bg-red-950/20 border-red-700/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
                          record.success
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        )}>
                          {getOperationIcon(record.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-200">
                              {getOperationTypeLabel(record.type)}
                            </span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              record.success
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            )}>
                              {record.success ? '成功' : '失败'}
                            </span>
                          </div>
                          {renderOperationDetails(record.details)}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {formatTime(record.timestamp)}
                            </div>
                            {record.duration && (
                              <div className="text-xs text-slate-500">
                                耗时: <span className="text-slate-300">{record.duration}ms</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className="ml-4 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1"
                        onClick={() => replayOperation(record.id)}
                        title="回放此操作"
                      >
                        <RefreshCw className="w-4 h-4" />
                        回放
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperationHistory;