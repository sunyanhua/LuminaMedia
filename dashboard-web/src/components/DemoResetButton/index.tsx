import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface DemoResetButtonProps {
  onReset: () => Promise<void>;
  disabled?: boolean;
}

const DemoResetButton: React.FC<DemoResetButtonProps> = ({ onReset, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onReset();
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <Button
          variant="destructive"
          onClick={() => setIsOpen(true)}
          disabled={disabled || isLoading}
          className="bg-red-700 hover:bg-red-800 text-slate-50 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置演示数据
        </Button>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-100">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              确认清空演示数据？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              此操作将清空当前所有的演示数据，但保留预置的基础数据。此操作不可逆。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DemoResetButton;