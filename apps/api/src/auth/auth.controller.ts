import {
  Req,
  Res,
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Connexion unifiée : Administrateur ou Utilisateur Restaurant
   */
  @Post('login')
  async login(
    @Body()
    body: {
      identifier?: string;
      email?: string;
      password?: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const identifier = body?.identifier ?? body?.email ?? '';
    const password = body?.password ?? '';
    const result = await this.authService.login(identifier, password);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 1000,
    });
    
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 3600 * 1000,
    });
    
    return result;
  }
  
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true };
  }

  /**
   * Rafraîchissement des jetons d'accès et de rafraîchissement
   */
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refresh_token') bodyRefreshToken?: string,
    @Body('refreshToken') altRefreshToken?: string,
  ) {
    let token = bodyRefreshToken ?? altRefreshToken ?? '';
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/refresh_token=([^;]+)/);
      if (match) token = match[1];
    }
    const result = await this.authService.refresh(token);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 1000,
    });
    
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 3600 * 1000,
    });
    
    return result;
  }

  /**
   * Vérification de session et profil actif via Bearer token
   */
  @Get('me')
  async getProfile(@Req() req: Request, @Headers('authorization') authHeader?: string) {
    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/access_token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token) {
      throw new UnauthorizedException('Token Bearer ou cookie manquant');
    }
    const { valid, user } = await this.authService.validateToken(token);

    if (!valid || !user) {
      throw new UnauthorizedException('Session expirée ou invalide');
    }

    return {
      authenticated: true,
      user,
    };
  }

  /**
   * Mise à jour des identifiants administrateur
   */
  @Patch('admin/credentials')
  async updateCredentials(
    @Req() req: Request,
    @Headers('authorization') authHeader: string,
    @Body() body: { email?: string; newEmail?: string; password?: string; newPassword?: string },
  ) {
    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/access_token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token) {
      throw new UnauthorizedException('Token Bearer ou cookie manquant');
    }
    const emailToUpdate = body?.email ?? body?.newEmail;
    const passwordToUpdate = body?.password ?? body?.newPassword;

    return this.authService.updateCredentials(token, emailToUpdate, passwordToUpdate);
  }
}
