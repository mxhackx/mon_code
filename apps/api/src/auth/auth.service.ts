import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient | null = null;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      this.supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.ensureAdminUserExists();
    } else {
      this.logger.warn(
        'Supabase Auth non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants).',
      );
    }
  }

  /**
   * Vérifie et crée automatiquement l'unique compte administrateur dans Supabase Auth
   */
  private async ensureAdminUserExists() {
    if (!this.supabase) return;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@moncode.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'MateoGRANDGenQR';

    try {
      const { data, error } = await this.supabase.auth.admin.listUsers();
      if (error) {
        this.logger.error(`Erreur listUsers Supabase: ${error.message}`);
        return;
      }

      const existing = data.users.find((u) => u.email === adminEmail);

      if (!existing) {
        const previousAdmin = data.users.find(
          (u) => u.user_metadata?.role === 'admin' || u.email === 'admin@genqr.com',
        );

        if (previousAdmin) {
          await this.supabase.auth.admin.updateUserById(previousAdmin.id, {
            email: adminEmail,
            email_confirm: true,
          });
          this.logger.log(`Compte administrateur Supabase mis à jour (${previousAdmin.email} -> ${adminEmail})`);
        } else {
          const { error: createError } = await this.supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { role: 'admin' },
          });

          if (createError) {
            this.logger.error(`Erreur création compte admin: ${createError.message}`);
          } else {
            this.logger.log(`Compte administrateur Supabase créé avec succès (${adminEmail})`);
          }
        }
      } else {
        this.logger.log(`Compte administrateur Supabase opérationnel (${adminEmail})`);
      }
    } catch (err: unknown) {
      this.logger.error('Erreur lors de l’initialisation de l’administrateur:', err);
    }
  }

  /**
   * Authentification administrateur
   */
  async loginAdmin(password: string) {
    if (!password) {
      throw new BadRequestException('Le mot de passe est obligatoire');
    }

    if (!this.supabase) {
      throw new BadRequestException('Supabase n’est pas configuré sur le serveur');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@moncode.com';

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: adminEmail,
      password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Mot de passe administrateur incorrect');
    }

    return {
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
      },
    };
  }

  /**
   * Mise à jour des identifiants (email et/ou mot de passe)
  /**
   * Valide un jeton Bearer admin auprès de Supabase Auth
   */
  async validateAdminToken(token: string): Promise<boolean> {
    if (!token) return false;
    if (!this.supabase) return false;

    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      if (error || !data?.user) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mise à jour des identifiants (email et/ou mot de passe)
   */
  async updateCredentials(token: string, newEmail?: string, newPassword?: string) {
    if (!this.supabase) {
      throw new BadRequestException('Supabase n’est pas configuré');
    }

    if (!token) {
      throw new UnauthorizedException('Jeton d’authentification manquant');
    }

    // 1. Validation du token de session auprès de Supabase
    const { data: userData, error: userError } = await this.supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new UnauthorizedException('Session expirée ou non autorisée');
    }

    const trimmedEmail = newEmail?.trim();
    const trimmedPassword = newPassword?.trim();

    if (!trimmedEmail && !trimmedPassword) {
      throw new BadRequestException('Veuillez fournir un nouvel email ou un nouveau mot de passe');
    }

    // 2. Mise à jour dans Supabase Auth
    const updatePayload: { email?: string; password?: string; email_confirm?: boolean } = {};
    if (trimmedEmail) {
      updatePayload.email = trimmedEmail;
      updatePayload.email_confirm = true;
    }
    if (trimmedPassword) {
      updatePayload.password = trimmedPassword;
    }

    const { data: updatedUser, error: updateError } =
      await this.supabase.auth.admin.updateUserById(userData.user.id, updatePayload);

    if (updateError) {
      throw new BadRequestException(`Erreur mise à jour Supabase: ${updateError.message}`);
    }

    // 3. Mise à jour en mémoire pour les connexions subséquentes
    if (trimmedEmail) {
      process.env.ADMIN_EMAIL = trimmedEmail;
    }
    if (trimmedPassword) {
      process.env.ADMIN_PASSWORD = trimmedPassword;
    }

    // 4. Synchronisation facultative de secours sur disque (sans bloquer en cas de filesystem éphémère/read-only)
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
            envContent = envContent.replace(/ADMIN_EMAIL=.*/g, `ADMIN_EMAIL="${trimmedEmail}"`);
          } else {
            envContent += `\nADMIN_EMAIL="${trimmedEmail}"`;
          }
        }

        if (trimmedPassword) {
          if (envContent.includes('ADMIN_PASSWORD=')) {
            envContent = envContent.replace(/ADMIN_PASSWORD=.*/g, `ADMIN_PASSWORD="${trimmedPassword}"`);
          } else {
            envContent += `\nADMIN_PASSWORD="${trimmedPassword}"`;
          }
        }

        fs.writeFileSync(envPath, envContent, 'utf8');
        this.logger.log('Fichier .env synchronisé avec les nouveaux identifiants');
      }
    } catch {
      // Ignorer silencieusement si le conteneur est en lecture seule
    }

    return {
      success: true,
      message: 'Identifiants administrateur mis à jour avec succès',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        role: 'admin',
      },
    };
  }
}
