import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    // const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.password, 8);

    return this.prisma.user.create({
      data: { ...data, password: passwordHash },
      select: { id: true, nome: true, email: true },
    });
  }

  async findAll() {
    // { where: { email: { contains: '@gmail.com' } } }
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    await this.existUser(id);

    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    await this.existUser(id);

    const dataForm = {
      ...data,
      birthAt: data.birthAt ? new Date(data.birthAt) : null,
    };

    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 8);
      dataForm.password = passwordHash;
    }

    return this.prisma.user.update({
      data: dataForm,
      where: { id },
    });
  }

  async updatePartial(id: number, data: PatchUserDto) {
    await this.existUser(id);

    const dataForm: any = { ...data };
    if (dataForm.birthAt) dataForm.birthAt = new Date(data.birthAt);
    if (dataForm.password) {
      const passwordHash = await bcrypt.hash(data.password, 8);
      dataForm.password = passwordHash;
    }
    
    return this.prisma.user.update({
      data: dataForm,
      where: { id },
    });
  }

  async remove(id: number) {
    await this.existUser(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async existUser(id: number) {
    const countUser = await this.prisma.user.count({ where: { id } });
    if (!countUser) throw new NotFoundException(`Usuário não encontrado!`);
  }
}
