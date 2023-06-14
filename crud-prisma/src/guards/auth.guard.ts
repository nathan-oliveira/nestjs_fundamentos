import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    // @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService, 
    // @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    
    try {
      const payload = this.authService.checkToken(authorization ?? ''.split(' ')[1]);
      request.user = await this.usersService.findOne(payload.id)
      return true;
    } catch (error) {
      return false;
    }
  }
}