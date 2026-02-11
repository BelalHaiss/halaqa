import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { loginSchema } from './validation/auth.validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { IsPublic } from 'src/decorators/public.decorator';
import type {
  DatesAsObjects,
  LoginCredentialsDto,
  AuthResponseDto,
} from '@halaqa/shared';

@Controller('auth')
@IsPublic()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) loginDTO: LoginCredentialsDto,
  ): Promise<DatesAsObjects<AuthResponseDto>> {
    return this.authService.login(loginDTO);
  }
}
