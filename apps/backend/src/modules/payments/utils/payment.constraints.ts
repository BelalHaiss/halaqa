import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'generated/prisma/client';

export const assertDateRange = (periodFrom: string, periodTo: string): void => {
  if (periodFrom > periodTo) {
    throw new BadRequestException('periodFrom must be before or equal to periodTo');
  }
};

export const assertActorCanManagePayments = (role: UserRole): void => {
  if (role !== UserRole.ADMIN && role !== UserRole.MODERATOR) {
    throw new ForbiddenException('You are not allowed to manage payments');
  }
};

export const assertActorCanDeletePayments = (role: UserRole): void => {
  if (role !== UserRole.ADMIN) {
    throw new ForbiddenException('Only admins can delete payments');
  }
};
