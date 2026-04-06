import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录用户的装饰器
 * 用法: @CurrentUser() user: UserEntity
 */
export const CurrentUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果指定了具体字段，返回该字段值
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
