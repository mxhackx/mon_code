import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface AuthSessionUser {
  id?: string;
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
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient | null = null;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error("Sécurité critique : JWT_SECRET doit être défini avec au moins 32 caractères.");
    }
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 8) {
      throw new Error("Sécurité critique : ADMIN_PASSWORD doit être défini avec au moins 8 caractères.");
    }
    
    const userPassword = process.env.USER_PASSWORD;
    if (!userPassword || userPassword.length < 8) {
      throw new Error("Sécurité critique : USER_PASSWORD doit être défini avec au moins 8 caractères.");
    }
    if (supabaseUrl && serviceRoleKey) {
      this.supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.ensureAdminUserExists();
      this.ensureRestaurantUserExists();
    } else {
      this.logger.warn(
        'Supabase Auth non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants).',
      );
    }
  }

  /**
   * Génère un jeton JWT signé avec HMAC-SHA256 (mécanisme de secours autonome)
   */
  private signPayload(
    payload: { id?: string; email?: string; role: 'admin' | 'user' },
    type: 'access' | 'refresh' = 'access',
    expiresInMs: number = 3600 * 1000,
  ): string {
    const secret = process.env.JWT_SECRET as string;
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Date.now() + expiresInMs;
    const body = Buffer.from(JSON.stringify({ ...payload, type, exp })).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(header + '.' + body).digest('base64url');
    return header + '.' + body + '.' + signature;
  }

  /**
   * Vérifie un jeton signé HMAC-SHA256
   */
  private verifySignedPayload(token: string, expectedType?: 'access' | 'refresh'): AuthSessionUser | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const secret = process.env.JWT_SECRET as string;
      const expectedSig = crypto.createHmac('sha256', secret).update(header + '.' + body).digest('base64url');
      if (signature !== expectedSig) return null;
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && Date.now() > payload.exp) return null;
      if (expectedType && payload.type && payload.type !== expectedType) return null;
      if (payload.role !== 'admin' && payload.role !== 'user') return null;
      return {
        id: payload.id || (payload.role === 'admin' ? 'admin-id' : 'user-id'),
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }

  /**
   * Vérifie et crée automatiquement le compte administrateur dans Supabase Auth
   */
  private async ensureAdminUserExists() {
    if (!this.supabase) return;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@moncode.com';
    const adminPassword = process.env.ADMIN_PASSWORD as string;

    try {
      const { data: usersData, error: listError } = await this.supabase.auth.admin.listUsers();
      if (listError) {
        this.logger.warn('Impossible de lister les utilisateurs Supabase Auth: ' + listError.message);
        return;
      }

      const existingAdmin = usersData.users.find(
        (u) => u.email?.toLowerCase() === adminEmail.toLowerCase(),
      );

      if (!existingAdmin) {
        this.logger.log('Création du compte administrateur par défaut dans Supabase Auth: ' + adminEmail);
        const { error: createError } = await this.supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { role: 'admin' },
        });

        if (createError) {
          this.logger.error('Erreur création compte admin: ' + createError.message);
        } else {
          this.logger.log('Compte administrateur Supabase Auth créé avec succès.');
        }
      } else {
        if (existingAdmin.user_metadata?.role !== 'admin') {
          await this.supabase.auth.admin.updateUserById(existingAdmin.id, {
            user_metadata: { role: 'admin' },
          });
        }
      }
    } catch (err: unknown) {
      this.logger.warn('Erreur lors de la vérification de admin Supabase: ' + err);
    }
  }

  /**
   * Vérifie et crée automatiquement le compte utilisateur restaurant dans Supabase Auth
   */
  private async ensureRestaurantUserExists() {
    if (!this.supabase) return;

    const userEmail = process.env.USER_EMAIL || 'user@moncode.com';
    const userPassword = process.env.USER_PASSWORD as string;

    try {
      const { data: usersData, error: listError } = await this.supabase.auth.admin.listUsers();
      if (listError) {
        this.logger.warn('Impossible de lister les utilisateurs Supabase Auth: ' + listError.message);
        return;
      }

      const existingUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === userEmail.toLowerCase(),
      );

      if (!existingUser) {
        this.logger.log('Création du compte utilisateur restaurant dans Supabase Auth: ' + userEmail);
        const { error: createError } = await this.supabase.auth.admin.createUser({
          email: userEmail,
          password: userPassword,
          email_confirm: true,
          user_metadata: { role: 'user' },
        });

        if (createError) {
          this.logger.error('Erreur création compte utilisateur: ' + createError.message);
        } else {
          this.logger.log('Compte utilisateur restaurant Supabase Auth créé avec succès.');
        }
      } else {
        if (existingUser.user_metadata?.role !== 'user') {
          await this.supabase.auth.admin.updateUserById(existingUser.id, {
            user_metadata: { role: 'user' },
          });
        }
      }
    } catch (err: unknown) {
      this.logger.warn('Erreur lors de la vérification de utilisateur Supabase: ' + err);
    }
  }

  /**
   * Connexion unifiée pour Administrateur et Utilisateur Restaurant
   */
  async login(identifier: string, password: string): Promise<AuthResult> {
    if (!password) {
      throw new BadRequestException('Le mot de passe est obligatoire');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@moncode.com';
    const adminPassword = process.env.ADMIN_PASSWORD as string;
    const userEmail = process.env.USER_EMAIL || 'user@moncode.com';
    const userPassword = process.env.USER_PASSWORD as string;

    const cleanId = (identifier || '').trim().toLowerCase();

    let targetEmail = cleanId;
    let expectedRole: 'admin' | 'user' | null = null;

    if (!cleanId || cleanId === 'admin' || cleanId === adminEmail.toLowerCase()) {
      targetEmail = adminEmail;
      expectedRole = 'admin';
    } else if (
      cleanId === 'user' ||
      cleanId === 'restaurant' ||
      cleanId === 'resto' ||
      cleanId === userEmail.toLowerCase()
    ) {
      targetEmail = userEmail;
      expectedRole = 'user';
    }

    if (this.supabase && targetEmail) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (!error && data.session) {
          const roleFromMeta = (data.user.user_metadata?.role as 'admin' | 'user') ||
            (data.user.email?.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : (expectedRole || 'user'));

          const role: 'admin' | 'user' = roleFromMeta;
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
      } catch (err: unknown) {
        this.logger.warn('Échec de connexion via Supabase Auth, tentative de secours: ' + err);
      }
    }

    const isAdminMatch =
      (!cleanId || cleanId === 'admin' || cleanId === adminEmail.toLowerCase()) &&
      password === adminPassword;

    if (isAdminMatch) {
      const accessToken = this.signPayload(
        { id: 'admin-local', email: adminEmail, role: 'admin' },
        'access',
        3600 * 1000,
      );
      const refreshToken = this.signPayload(
        { id: 'admin-local', email: adminEmail, role: 'admin' },
        'refresh',
        30 * 24 * 3600 * 1000,
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: 'admin-local', email: adminEmail, role: 'admin' },
        redirect: '/admin',
      };
    }

    const isUserMatch =
      (cleanId === 'user' || cleanId === 'resto' || cleanId === 'restaurant' || cleanId === userEmail.toLowerCase()) &&
      password === userPassword;

    if (isUserMatch) {
      const accessToken = this.signPayload(
        { id: 'user-local', email: userEmail, role: 'user' },
        'access',
        3600 * 1000,
      );
      const refreshToken = this.signPayload(
        { id: 'user-local', email: userEmail, role: 'user' },
        'refresh',
        30 * 24 * 3600 * 1000,
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: 'user-local', email: userEmail, role: 'user' },
        redirect: '/intervenant',
      };
    }

    throw new UnauthorizedException('Identifiant ou mot de passe incorrect');
  }

  async loginAdmin(password: string): Promise<AuthResult> {
    return this.login('admin', password);
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    if (!refreshToken) {
      throw new BadRequestException('Le jeton de rafraîchissement est obligatoire');
    }

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (!error && data.session && data.user) {
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@moncode.com';
          const role: 'admin' | 'user' =
            (data.user.user_metadata?.role as 'admin' | 'user') ||
            (data.user.email?.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user');

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
      } catch (err: unknown) {
        this.logger.warn('Échec de refreshSession Supabase, passage au contrôle de secours: ' + err);
      }
    }

    const verified = this.verifySignedPayload(refreshToken, 'refresh');
    if (verified) {
      const newAccessToken = this.signPayload(verified, 'access', 3600 * 1000);
      const newRefreshToken = this.signPayload(verified, 'refresh', 30 * 24 * 3600 * 1000);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: verified,
      };
    }

    throw new UnauthorizedException('Jeton de rafraîchissement invalide ou expiré');
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: AuthSessionUser }> {
    if (!token) return { valid: false };

    const signedUser = this.verifySignedPayload(token, 'access');
    if (signedUser) {
      return { valid: true, user: signedUser };
    }

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.getUser(token);
        if (!error && data?.user) {
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@moncode.com';
          const role: 'admin' | 'user' =
            (data.user.user_metadata?.role as 'admin' | 'user') ||
            (data.user.email?.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user');

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
        return { valid: false };
      }
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
    if (!valid || user?.role !== 'admin') {
      throw new UnauthorizedException('Session administrateur expirée ou non autorisée');
    }

    const trimmedEmail = newEmail?.trim();
    const trimmedPassword = newPassword?.trim();

    if (!trimmedEmail && !trimmedPassword) {
      throw new BadRequestException('Veuillez fournir un nouvel email ou un nouveau mot de passe');
    }

    if (this.supabase && user.id && user.id !== 'admin-local') {
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
    }

    if (trimmedEmail) {
      process.env.ADMIN_EMAIL = trimmedEmail;
    }
    if (trimmedPassword) {
      process.env.ADMIN_PASSWORD = trimmedPassword;
    }

    try {
      const possiblePaths = [
        path.join(process.cwd(), '.env'),
        path.join(process.cwd(), 'apps/api/.env'),
        path.join(__dirname, '../../.env'),
      ];
      const envPath = possiblePaths.find((p) => fs.existsSync(p));
      if (envPath) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (trimmedEmail) {
          if (envContent.includes('ADMIN_EMAIL=')) {
            envContent = envContent.replace(/ADMIN_EMAIL=.*/g, 'ADMIN_EMAIL="' + trimmedEmail + '"');
          } else {
            envContent += '\nADMIN_EMAIL="' + trimmedEmail + '"';
          }
        }

        if (trimmedPassword) {
          if (envContent.includes('ADMIN_PASSWORD=')) {
            envContent = envContent.replace(/ADMIN_PASSWORD=.*/g, 'ADMIN_PASSWORD="' + trimmedPassword + '"');
          } else {
            envContent += '\nADMIN_PASSWORD="' + trimmedPassword + '"';
          }
        }

        fs.writeFileSync(envPath, envContent, 'utf8');
        this.logger.log('Fichier .env synchronisé avec les nouveaux identifiants');
      }
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Identifiants administrateur mis à jour avec succès',
      user: {
        id: user.id,
        email: trimmedEmail || process.env.ADMIN_EMAIL,
        role: 'admin',
      },
    };
  }
}
