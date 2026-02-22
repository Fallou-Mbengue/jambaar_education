import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../minio/minio.service';
import { UpdateProfileDto, OnboardingDto } from './dto/update-profile.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const { passwordHash: _ph, ...safe } = user;
    return {
      ...safe,
      profile: user.profile
        ? {
            ...user.profile,
            avatarUrl: user.profile.avatarKey
              ? await this.minio.getPresignedReadUrl(user.profile.avatarKey)
              : null,
          }
        : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });
    return profile;
  }

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        objectives: dto.objectives,
        interests: dto.interests,
        level: dto.level,
        onboardingDone: true,
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
      },
    });

    // Award XP for completing onboarding
    return profile;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: { select: { progresses: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _ph, ...safe } = user;
    return safe;
  }

  async listUsers(params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { profile: { firstName: { contains: search, mode: 'insensitive' as const } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(role && { role: role as 'USER' | 'COACH' | 'ADMIN' }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
          _count: { select: { progresses: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map(({ passwordHash: _ph, ...u }) => u),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
