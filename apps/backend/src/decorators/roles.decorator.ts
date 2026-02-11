import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma/client';

export const Roles = Reflector.createDecorator<UserRole[]>();
