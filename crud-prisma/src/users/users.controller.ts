import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

// import { ThrottlerGuard } from '@nestjs/throttler';

import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

import { ParamId } from 'src/decorators/param-id.decorator';

import { LogInterceptor } from 'src/interceptors/log.interceptor';

import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

import { UsersService } from './users.service';

@Roles(Role.Admin)
@UseGuards(AuthGuard, RoleGuard) // ThrottlerGuard, AuthGuard, RoleGuard
@UseInterceptors(LogInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
 
  // @UseGuards(ThrottlerGuard)
  // @SkipThrottle() // para ignorar a proteção contra ataque de força bruta (rate limiting)
  // @Throttle(500, 60) // para subscrever a configuração atual...
  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  // @Roles(Role.Admin, Role.User)
  @Get()
  async read() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async readOne(@ParamId() id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(@ParamId() id: number, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: PatchUserDto,
  ) {
    return this.usersService.updatePartial(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
