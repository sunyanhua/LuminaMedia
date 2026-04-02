import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader as Loader2, Sparkles, Building2, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: '错误',
          description: error.message,
          variant: 'destructive',
        });
      } else if (!isLogin) {
        toast({
          title: '注册成功',
          description: '请使用您的账号登录',
        });
        setIsLogin(true);
      } else {
        // 登录成功，跳转到版本选择页
        toast({
          title: '登录成功',
          description: '欢迎回来！',
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '发生了一个错误，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 填充商务版演示账号
  const fillBusinessAccount = () => {
    setEmail('admin@demo.lumina.com');
    setPassword('demo123');
    toast({
      title: '已填充',
      description: '商务版演示账号已填充',
    });
  };

  // 填充政务版演示账号
  const fillGovernmentAccount = () => {
    setEmail('gov-admin');
    setPassword('gov123');
    toast({
      title: '已填充',
      description: '政务版演示账号已填充',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.1),transparent_50%)]" />

      <Card className="w-full max-w-md relative bg-slate-900/80 backdrop-blur-sm border-slate-800 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-slate-950" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
            灵曜智媒
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            AI驱动的企业级内容营销平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-medium">
                邮箱地址 / 用户名
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-medium">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>{isLogin ? '登录' : '注册'}</>
              )}
            </Button>

            {/* 演示账号快捷填充 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-slate-500 bg-slate-900">演示账号</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={fillBusinessAccount}
                disabled={loading}
                className="border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-300"
              >
                <Building2 className="w-4 h-4 mr-2 text-amber-500" />
                商务版账号
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={fillGovernmentAccount}
                disabled={loading}
                className="border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 text-slate-300"
              >
                <Landmark className="w-4 h-4 mr-2 text-blue-500" />
                政务版账号
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-slate-500 bg-slate-900">或者</span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？返回登录'}
            </Button>
          </form>

          {/* 演示账号提示 */}
          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              商务版: admin@demo.lumina.com / demo123<br />
              政务版: gov-admin / gov123
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-8 text-center text-slate-500 text-sm">
        <p>© 2026 灵曜智媒 - 智能新媒体管理解决方案</p>
      </div>
    </div>
  );
}

export default Login;
