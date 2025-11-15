import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress?: string) {
    const { email, password, firstName, lastName, organizationId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Verify organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || !organization.isActive) {
      throw new UnauthorizedException('Organización inválida o inactiva');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        organizationId,
        authProvider: 'LOCAL',
        isActive: true,
        isVerified: false,
      },
      include: {
        organization: true,
      },
    });

    // Assign default role
    const defaultRole = await this.prisma.role.findFirst({
      where: { isDefault: true },
    });

    if (defaultRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    }

    // Audit log
    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'user',
      resourceId: user.id,
      action: 'register',
      description: `Usuario ${email} registrado`,
      userId: user.id,
      ipAddress,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.organizationId);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      // Audit failed login
      await this.auditService.log({
        eventType: 'AUTH_FAILED',
        resource: 'user',
        action: 'login',
        description: `Intento de login fallido para ${email}`,
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit successful login
    await this.auditService.log({
      eventType: 'AUTH_LOGIN',
      resource: 'user',
      resourceId: user.id,
      action: 'login',
      description: `Usuario ${email} inició sesión`,
      userId: user.id,
      ipAddress,
      userAgent,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.organizationId);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    if (!user.password) {
      // OAuth user without password
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async generateTokens(userId: string, email: string, organizationId: string) {
    const payload = { sub: userId, email, organizationId };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario inválido');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.organizationId);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(userId: string, ipAddress?: string) {
    // Audit logout
    await this.auditService.log({
      eventType: 'AUTH_LOGOUT',
      resource: 'user',
      resourceId: userId,
      action: 'logout',
      description: 'Usuario cerró sesión',
      userId,
      ipAddress,
    });

    return { message: 'Logout exitoso' };
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  private sanitizeUser(user: any) {
    const sanitizedUser = { ...user };
    delete sanitizedUser.password;
    return sanitizedUser;
  }
}
