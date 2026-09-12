import {
  Controller,
  Post,
  Patch,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth/admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('password') password: string) {
    return this.authService.loginAdmin(password);
  }

  @Patch('credentials')
  async updateCredentials(
    @Headers('authorization') authHeader: string,
    @Body() body: { email?: string; newEmail?: string; password?: string; newPassword?: string },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token Bearer manquant');
    }

    const token = authHeader.split(' ')[1];
    const emailToUpdate = body?.email ?? body?.newEmail;
    const passwordToUpdate = body?.password ?? body?.newPassword;

    return this.authService.updateCredentials(token, emailToUpdate, passwordToUpdate);
  }
}

