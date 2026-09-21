import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthSessionUser {
  id: string;
  email?: string;
  role: 'admin' | 'user';
}

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  user: AuthSessionUser;
  redirect: string;
}

export interface RefreshResult {
  access_token: string;
  refresh_token: string;
  user: AuthSessionUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient | null = null;

  constructor() {
    this.logger.log('Initialisation du AuthService (Strictement basé sur Supabase)');
  }

  async onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.error("Configuration Supabase manquante (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
      return;
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    this.logger.log('Connecté à Supabase Auth avec succès. Fin de la dépendance aux mots de passe locaux.');
  }

  async login(identifier: string, password: string): Promise<AuthResult> {
    if (!this.supabase) {
      throw new UnauthorizedException('Service d\'authentification momentanément indisponible.');
    }

    const cleanId = (identifier || '').trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@moncode.com').toLowerCase();
    const userEmail = (process.env.USER_EMAIL || 'user@moncode.com').toLowerCase();

    let targetEmail = cleanId;
    let expectedRole: 'admin' | 'user' = 'user';

    // Conservation du confort de frappe pour le frontend (alias "admin" ou "user")
    if (!cleanId || cleanId === 'admin' || cleanId === adminEmail) {
      targetEmail = adminEmail;
      expectedRole = 'admin';
    } else if (cleanId === 'user' || cleanId === 'restaurant' || cleanId === 'resto' || cleanId === userEmail) {
      targetEmail = userEmail;
      expectedRole = 'user';
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect');
    }

    // Le rôle est récupéré des métadonnées de Supabase ou déduit de l'email
    const role: 'admin' | 'user' = (data.user.user_metadata?.role as 'admin' | 'user') || expectedRole;
    const redirect = role === 'admin' ? '/admin' : '/intervenant';

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
      },
      redirect,
    };
  }

  async loginAdmin(password: string): Promise<AuthResult> {
    return this.login('admin', password);
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    if (!refreshToken) {
      throw new BadRequestException('Le jeton de rafraîchissement est obligatoire');
    }

    if (!this.supabase) {
      throw new UnauthorizedException('Service d\'authentification indisponible.');
    }

    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide ou expiré');
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@moncode.com').toLowerCase();
    const role: 'admin' | 'user' = (data.user.user_metadata?.role as 'admin' | 'user') || 
      (data.user.email?.toLowerCase() === adminEmail ? 'admin' : 'user');

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
      },
    };
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: AuthSessionUser }> {
    if (!token || !this.supabase) return { valid: false };

    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      if (!error && data?.user) {
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@moncode.com').toLowerCase();
        const role: 'admin' | 'user' =
          (data.user.user_metadata?.role as 'admin' | 'user') ||
          (data.user.email?.toLowerCase() === adminEmail ? 'admin' : 'user');

        return {
          valid: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            role,
          },
        };
      }
    } catch {
      // ignore network err
    }
    return { valid: false };
  }

  async validateAdminToken(token: string): Promise<boolean> {
    const { valid, user } = await this.validateToken(token);
    return valid && user?.role === 'admin';
  }

  async validateUserToken(token: string): Promise<boolean> {
    const { valid, user } = await this.validateToken(token);
    return valid && (user?.role === 'user' || user?.role === 'admin');
  }

  async updateCredentials(token: string, newEmail?: string, newPassword?: string) {
    const { valid, user } = await this.validateToken(token);
    if (!valid || !user) {
      throw new UnauthorizedException('Session expirée ou non autorisée');
    }

    const trimmedEmail = newEmail?.trim();
    const trimmedPassword = newPassword?.trim();

    if (!trimmedEmail && !trimmedPassword) {
      throw new BadRequestException('Veuillez fournir un nouvel email ou un nouveau mot de passe');
    }

    if (!this.supabase || !user.id) {
      throw new BadRequestException('Service d\'authentification indisponible.');
    }

    const updatePayload: Record<string, unknown> = {};
    if (trimmedEmail) {
      updatePayload.email = trimmedEmail;
      updatePayload.email_confirm = true;
    }
    if (trimmedPassword) {
      updatePayload.password = trimmedPassword;
    }

    const { error: updateError } = await this.supabase.auth.admin.updateUserById(
      user.id,
      updatePayload,
    );

    if (updateError) {
      this.logger.error(`Erreur Supabase: ${updateError.message}`, updateError.stack);
      throw new BadRequestException('Impossible de mettre à jour les identifiants pour le moment.');
    }

    return {
      success: true,
      message: 'Identifiants mis à jour avec succès dans Supabase.',
      user: {
        id: user.id,
        email: trimmedEmail || user.email,
        role: user.role,
      },
    };
  }
}
