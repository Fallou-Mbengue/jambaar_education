import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../minio/minio.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProgramsService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAllPublic() {
    const programs = await this.prisma.program.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      programs.map(async (p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        isPremium: p.isPremium,
        durationDays: p.durationDays,
        tags: p.tags,
        status: p.status,
        thumbnailUrl: p.thumbnailKey
          ? await this.minio.getPresignedReadUrl(p.thumbnailKey)
          : null,
        _count: p._count,
      })),
    );
  }

  async findByIdPublic(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId, status: 'ACTIVE' },
      include: {
        modules: {
          include: {
            course: {
              include: {
                modules: {
                  include: { content: true },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!program) throw new NotFoundException('Program not found');

    const [thumbnailUrl, participantCount] = await Promise.all([
      program.thumbnailKey
        ? this.minio.getPresignedReadUrl(program.thumbnailKey)
        : Promise.resolve(null),
      this.prisma.userProgress.count({ where: { programId } }),
    ]);

    const curriculum = program.modules.map((pm) => ({
      id: pm.id,
      order: pm.order,
      title: pm.title || pm.course.title,
      courseId: pm.courseId,
      lessons: pm.course.modules.map((m) => ({
        id: m.id,
        order: m.order,
        title: m.title,
        durationSeconds: m.content?.durationSeconds ?? null,
        contentId: m.contentId,
      })),
      totalDurationSeconds: pm.course.modules.reduce(
        (acc, m) => acc + (m.content?.durationSeconds ?? 0),
        0,
      ),
    }));

    const totalDurationSeconds = curriculum.reduce(
      (acc, ch) => acc + ch.totalDurationSeconds,
      0,
    );

    return {
      id: program.id,
      title: program.title,
      description: program.description,
      isPremium: program.isPremium,
      durationDays: program.durationDays,
      tags: program.tags,
      status: program.status,
      createdAt: program.createdAt,
      thumbnailUrl,
      participantCount,
      totalDurationSeconds,
      curriculum,
      _count: { modules: program.modules.length },
    };
  }

  async findAll(userId: string) {
    const programs = await this.prisma.program.findMany({
      where: { status: 'ACTIVE' },
      include: {
        modules: {
          include: { course: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userProgress = await this.prisma.userProgress.findMany({
      where: { userId, programId: { in: programs.map((p) => p.id) } },
    });
    const progressMap = new Map(userProgress.map((p) => [p.programId, p]));

    return Promise.all(
      programs.map(async (p) => ({
        ...p,
        thumbnailUrl: p.thumbnailKey
          ? await this.minio.getPresignedReadUrl(p.thumbnailKey)
          : null,
        progress: progressMap.get(p.id) ?? null,
      })),
    );
  }

  async findById(programId: string, userId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        modules: {
          include: {
            course: {
              include: {
                modules: {
                  include: { content: true },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!program) throw new NotFoundException('Program not found');

    const userProgress = await this.prisma.userProgress.findUnique({
      where: { userId_programId: { userId, programId } },
    });

    // Enroll if not already enrolled
    if (!userProgress) {
      await this.prisma.userProgress.create({
        data: { userId, programId, progressPercent: 0 },
      });
    }

    const thumbnailUrl = program.thumbnailKey
      ? await this.minio.getPresignedReadUrl(program.thumbnailKey)
      : null;

    return { ...program, thumbnailUrl, progress: userProgress };
  }

  async updateProgress(programId: string, userId: string, moduleId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: { modules: true },
    });
    if (!program) throw new NotFoundException('Program not found');

    const totalModules = program.modules.length;
    if (totalModules === 0) return { progressPercent: 0 };

    // Count completed content in this program
    const programContentIds = await this.prisma.module.findMany({
      where: { courseId: { in: program.modules.map((m) => m.courseId) } },
      select: { contentId: true },
    });

    const completedCount = await this.prisma.userProgress.count({
      where: {
        userId,
        contentId: { in: programContentIds.map((m) => m.contentId) },
        isCompleted: true,
      },
    });

    const progressPercent = Math.min(
      Math.round((completedCount / Math.max(programContentIds.length, 1)) * 100),
      100,
    );
    const isCompleted = progressPercent >= 100;

    const progress = await this.prisma.userProgress.upsert({
      where: { userId_programId: { userId, programId } },
      create: {
        userId,
        programId,
        progressPercent,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      update: {
        progressPercent,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        lastAccessedAt: new Date(),
      },
    });

    return progress;
  }

  async createAdmin(dto: {
    title: string;
    description?: string;
    thumbnailKey?: string;
    isPremium?: boolean;
    tags?: string[];
  }) {
    return this.prisma.program.create({
      data: {
        title: dto.title,
        description: dto.description,
        thumbnailKey: dto.thumbnailKey,
        isPremium: dto.isPremium ?? false,
        tags: dto.tags ?? [],
        status: 'INACTIVE',
      },
    });
  }

  async createProgramWithModules(dto: {
    title: string;
    description?: string;
    category: string;
    difficulty: string;
    thumbnailKey?: string;
    modules?: Array<{
      title: string;
      description?: string;
      lessons: Array<{
        title: string;
        type: string;
        description?: string;
        durationSeconds?: number;
        isFreePreview?: boolean;
        videoKey?: string;
        pdfKey?: string;
        exerciseBody?: string;
      }>;
    }>;
    price?: number;
    isFree?: boolean;
    accessDuration?: string;
    hasCertification?: boolean;
    paywallLessonIndex?: number;
    tags?: string[];
  }) {
    const isPremium = !dto.isFree && (dto.price ?? 0) > 0;

    const programTags = [
      ...(dto.tags || []),
      dto.category,
      dto.difficulty,
    ];

    // Create program
    const program = await this.prisma.program.create({
      data: {
        title: dto.title,
        description: dto.description,
        thumbnailKey: dto.thumbnailKey,
        isPremium,
        tags: programTags,
        status: 'INACTIVE', // Will be set to ACTIVE when published
        durationDays: dto.accessDuration === 'lifetime' ? null :
                      dto.accessDuration === '30days' ? 30 :
                      dto.accessDuration === '90days' ? 90 :
                      dto.accessDuration === '1year' ? 365 : null,
      },
    });

    // Create modules and lessons if provided
    if (dto.modules && dto.modules.length > 0) {
      let globalLessonIndex = 0;

      for (let moduleIndex = 0; moduleIndex < dto.modules.length; moduleIndex++) {
        const moduleDto = dto.modules[moduleIndex];

        // Create a course for this module
        const course = await this.prisma.course.create({
          data: {
            title: moduleDto.title,
            description: moduleDto.description,
            isPremium,
            isPublished: false,
            tags: programTags,
          },
        });

        // Link course to program
        await this.prisma.programModule.create({
          data: {
            programId: program.id,
            courseId: course.id,
            order: moduleIndex,
            title: moduleDto.title,
          },
        });

        // Create lessons (content + module entries)
        for (let lessonIndex = 0; lessonIndex < moduleDto.lessons.length; lessonIndex++) {
          const lessonDto = moduleDto.lessons[lessonIndex];

          // Determine if this lesson should be free based on paywall
          const isFreePreview =
            lessonDto.isFreePreview ??
            (dto.paywallLessonIndex !== undefined && globalLessonIndex < dto.paywallLessonIndex);

          // Map lesson type to content type
          const contentType =
            lessonDto.type === 'VIDEO' ? 'VIDEO' :
            lessonDto.type === 'PDF' || lessonDto.type === 'EXERCISE' ? 'ARTICLE' :
            'ARTICLE';

          // Create content
          const content = await this.prisma.content.create({
            data: {
              title: lessonDto.title,
              description: lessonDto.description,
              type: contentType,
              status: 'DRAFT',
              durationSeconds: lessonDto.durationSeconds,
              videoKey: lessonDto.videoKey,
              articleBody: lessonDto.exerciseBody,
              isPremium: !isFreePreview,
              tags: programTags,
            },
          });

          // Link content to course as a module
          await this.prisma.module.create({
            data: {
              courseId: course.id,
              contentId: content.id,
              order: lessonIndex,
              title: lessonDto.title,
              isLocked: !isFreePreview,
            },
          });

          globalLessonIndex++;
        }
      }
    }

    return program;
  }

  async updateProgramDetails(programId: string, dto: {
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    thumbnailKey?: string;
    price?: number;
    isFree?: boolean;
    accessDuration?: string;
    hasCertification?: boolean;
    tags?: string[];
  }) {
    const updateData: any = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.thumbnailKey !== undefined) updateData.thumbnailKey = dto.thumbnailKey;

    if (dto.isFree !== undefined || dto.price !== undefined) {
      updateData.isPremium = !dto.isFree && (dto.price ?? 0) > 0;
    }

    if (dto.accessDuration !== undefined) {
      updateData.durationDays =
        dto.accessDuration === 'lifetime' ? null :
        dto.accessDuration === '30days' ? 30 :
        dto.accessDuration === '90days' ? 90 :
        dto.accessDuration === '1year' ? 365 : null;
    }

    if (dto.tags || dto.category || dto.difficulty) {
      const existingProgram = await this.prisma.program.findUnique({
        where: { id: programId },
        select: { tags: true },
      });

      const newTags = [
        ...(dto.tags || existingProgram?.tags || []),
        ...(dto.category ? [dto.category] : []),
        ...(dto.difficulty ? [dto.difficulty] : []),
      ];

      updateData.tags = [...new Set(newTags)]; // Remove duplicates
    }

    return this.prisma.program.update({
      where: { id: programId },
      data: updateData,
    });
  }

  async publishProgram(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        modules: {
          include: {
            course: {
              include: { modules: true },
            },
          },
        },
      },
    });

    if (!program) throw new NotFoundException('Program not found');

    // Publish all courses and content
    for (const pm of program.modules) {
      await this.prisma.course.update({
        where: { id: pm.courseId },
        data: { isPublished: true },
      });

      for (const module of pm.course.modules) {
        await this.prisma.content.update({
          where: { id: module.contentId },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        });
      }
    }

    // Publish program
    return this.prisma.program.update({
      where: { id: programId },
      data: { status: 'ACTIVE' },
    });
  }

  async deleteDraft(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      select: { status: true },
    });

    if (!program) throw new NotFoundException('Program not found');
    if (program.status === 'ACTIVE') {
      throw new Error('Cannot delete published program');
    }

    return this.prisma.program.delete({
      where: { id: programId },
    });
  }
}
