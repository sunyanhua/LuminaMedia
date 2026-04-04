import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DemoResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DemoResetModal: React.FC<DemoResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            重置演示数据
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            此操作将清空当前的演示数据，但保留预置的基础数据。
            确认继续吗？
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-slate-500 p-4 bg-slate-800/50 rounded-lg">
          <p className="mb-2">重置范围：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>清空动态生成的演示数据</li>
            <li>保留预置的基础演示数据</li>
            <li>保留用户账户信息</li>
          </ul>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-slate-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2">...</span>
                重置中...
              </span>
            ) : (
              '确认重置'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DemoResetModal;