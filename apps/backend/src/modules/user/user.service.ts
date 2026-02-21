import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import argon from 'argon2';
import { DatabaseService } from '../database/database.service';
import {
  ChangeOwnPasswordDto,
  CountDto,
  CreateStaffUserDto,
  CreateLearnerDto,
  DEFAULT_TIMEZONE,
  ISODateString,
  LearnerDto,
  QueryLearnersDto,
  QueryLearnersResponseDto,
  StaffUserDto,
  StaffUsersResponseDto,
  UpdateOwnProfileDto,
  UpdateStaffUserDto,
  UserAuthRole,
  UserAuthType,
  UpdateLearnerDto,
} from '@halaqa/shared';
import { Prisma, User, UserRole } from 'generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: DatabaseService) {}

  async findByUsername(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });
    return user;
  }

  async getStaffUsers(actor: User): Promise<StaffUsersResponseDto> {
    this.assertActorCanManageStaff(actor);

    const users = await this.prismaService.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR],
        },
      },
      orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
    });

    return users.map((staffUser) => this.toStaffDto(staffUser));
  }

  async createStaffUser(
    actor: User,
    dto: CreateStaffUserDto,
  ): Promise<StaffUserDto> {
    this.assertActorCanManageStaff(actor);
    this.assertActorCanManageTargetRole(actor, dto.role);

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        username: dto.username,
      },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const createdStaffUser = await this.prismaService.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        role: dto.role,
        timezone: dto.timezone ?? DEFAULT_TIMEZONE,
        password: await argon.hash(dto.password),
      },
    });

    return this.toStaffDto(createdStaffUser);
  }

  async updateStaffUser(
    id: string,
    actor: User,
    dto: UpdateStaffUserDto,
  ): Promise<StaffUserDto> {
    this.assertActorCanManageStaff(actor);

    const targetUser = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!targetUser || !this.isStaffRole(targetUser.role)) {
      throw new NotFoundException('Staff user not found');
    }

    this.assertActorCanManageTargetRole(actor, targetUser.role);
    if (dto.role) {
      this.assertActorCanManageTargetRole(actor, dto.role);
    }

    if (dto.username && dto.username !== targetUser.username) {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          username: dto.username,
        },
        select: { id: true },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    const updatedStaffUser = await this.prismaService.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.username !== undefined ? { username: dto.username } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.password
          ? {
              password: await argon.hash(dto.password),
            }
          : {}),
      },
    });

    return this.toStaffDto(updatedStaffUser);
  }

  async deleteStaffUser(id: string, actor: User): Promise<void> {
    this.assertActorCanManageStaff(actor);

    if (id === actor.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const targetUser = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser || !this.isStaffRole(targetUser.role)) {
      throw new NotFoundException('Staff user not found');
    }

    this.assertActorCanManageTargetRole(actor, targetUser.role);

    await this.prismaService.user.delete({
      where: { id },
    });
  }

  async getMe(userId: string): Promise<UserAuthType> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toAuthUserDto(user);
  }

  async updateOwnProfile(
    userId: string,
    dto: UpdateOwnProfileDto,
  ): Promise<UserAuthType> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.username !== existingUser.username) {
      const found = await this.prismaService.user.findUnique({
        where: {
          username: dto.username,
        },
        select: { id: true },
      });
      if (found && found.id !== userId) {
        throw new ConflictException('Username already exists');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        username: dto.username,
        timezone: dto.timezone,
      },
    });

    return this.toAuthUserDto(updatedUser);
  }

  async changeOwnPassword(
    userId: string,
    dto: ChangeOwnPasswordDto,
  ): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.password) {
      throw new BadRequestException('Password is not set for this account');
    }

    const isCurrentPasswordValid = await argon.verify(
      user.password,
      dto.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (
      dto.confirmPassword !== undefined &&
      dto.newPassword !== dto.confirmPassword
    ) {
      throw new BadRequestException('Password confirmation does not match');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: await argon.hash(dto.newPassword),
      },
    });
  }

  async createLearner(dto: CreateLearnerDto): Promise<LearnerDto> {
    const createdLearner = await this.prismaService.user.create({
      data: {
        name: dto.name,
        role: UserRole.STUDENT,
        username: null,
        password: null,
        timezone: dto.timezone ?? DEFAULT_TIMEZONE,
        notes: dto.contact?.notes,
      },
    });

    return this.toLearnerDto(createdLearner);
  }

  async queryLearners(
    query: QueryLearnersDto,
  ): Promise<QueryLearnersResponseDto> {
    const { skip, take, page } =
      this.prismaService.handleQueryPagination(query);
    const searchQuery = query.search?.trim();

    const where: Prisma.UserWhereInput = {
      role: UserRole.STUDENT,
      ...(searchQuery
        ? {
            name: {
              contains: searchQuery,
            },
          }
        : {}),
    };

    const [learners, count] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      data: learners.map((learner) => this.toLearnerDto(learner)),
      ...this.prismaService.formatPaginationResponse({
        page,
        count,
        limit: take,
      }),
    };
  }

  async updateLearner(id: string, dto: UpdateLearnerDto): Promise<LearnerDto> {
    const learner = await this.prismaService.user.findFirst({
      where: {
        id,
        role: UserRole.STUDENT,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone;
    }

    if (dto.contact?.notes !== undefined) {
      data.notes = dto.contact.notes;
    }

    const updatedLearner = await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });

    return this.toLearnerDto(updatedLearner);
  }

  async deleteLearner(id: string): Promise<void> {
    const deletedLearnersCount = await this.prismaService.user.deleteMany({
      where: {
        id,
        role: UserRole.STUDENT,
      },
    });

    if (deletedLearnersCount.count === 0) {
      throw new NotFoundException('Learner not found');
    }
  }

  async getTutorsCount(): Promise<number> {
    return this.prismaService.user.count({
      where: {
        role: UserRole.TUTOR,
      },
    });
  }

  async getLearnersCount(): Promise<number> {
    return this.prismaService.user.count({
      where: {
        role: UserRole.STUDENT,
      },
    });
  }

  async getLearnersCountByTutor(tutorId: string): Promise<number> {
    const learners = await this.prismaService.groupStudent.findMany({
      where: {
        group: {
          tutorId,
        },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    return learners.length;
  }

  async getTutorsCountDto(user: User): Promise<CountDto> {
    if (user.role === UserRole.TUTOR) {
      return { count: 1 };
    }

    const count = await this.getTutorsCount();
    return { count };
  }

  async getLearnersCountDto(user: User): Promise<CountDto> {
    if (user.role !== UserRole.TUTOR) {
      const count = await this.getLearnersCount();
      return { count };
    }

    const count = await this.getLearnersCountByTutor(user.id);
    return { count };
  }

  private assertActorCanManageStaff(actor: User): void {
    if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.MODERATOR) {
      throw new ForbiddenException('You are not allowed to manage staff users');
    }
  }

  private assertActorCanManageTargetRole(
    actor: User,
    role: UserAuthRole,
  ): void {
    if (actor.role === UserRole.ADMIN) {
      return;
    }

    if (
      actor.role === UserRole.MODERATOR &&
      (role === UserRole.MODERATOR || role === UserRole.TUTOR)
    ) {
      return;
    }

    throw new ForbiddenException(
      'You are not allowed to manage users with this role',
    );
  }

  private isStaffRole(role: UserRole): role is UserAuthRole {
    return (
      role === UserRole.ADMIN ||
      role === UserRole.MODERATOR ||
      role === UserRole.TUTOR
    );
  }

  private toStaffDto(user: {
    id: string;
    username: string | null;
    name: string;
    role: UserRole;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
  }): StaffUserDto {
    if (!user.username || !this.isStaffRole(user.role)) {
      throw new NotFoundException('Staff user not found');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString() as ISODateString,
      updatedAt: user.updatedAt.toISOString() as ISODateString,
    };
  }

  private toAuthUserDto(user: {
    id: string;
    username: string | null;
    name: string;
    role: UserRole;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserAuthType {
    if (!user.username || !this.isStaffRole(user.role)) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString() as ISODateString,
      updatedAt: user.updatedAt.toISOString() as ISODateString,
    };
  }

  private toLearnerDto(user: {
    id: string;
    name: string;
    role: UserRole;
    timezone: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): LearnerDto {
    return {
      id: user.id,
      name: user.name,
      role: 'STUDENT',
      timezone: user.timezone,
      contact: {
        notes: user.notes ?? undefined,
      },
      createdAt: user.createdAt.toISOString() as ISODateString,
      updatedAt: user.updatedAt.toISOString() as ISODateString,
    };
  }
}
