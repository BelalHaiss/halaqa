import { Controller, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.userService.delete(id);
    return { success: true };
  }
}
