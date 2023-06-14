import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm'

import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(data: CreateUserDto) {
    const userExist= this.usersRepository.exist({
      where: { email: data.email },
    });

    if(userExist) throw new BadRequestException('e-mail já cadastrado!');

    // const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.password, 8);

    const user = this.usersRepository.create({ ...data, password: passwordHash });
    return this.usersRepository.save(user);
  }

  async findAll() {
    // { where: { email: { contains: '@gmail.com' } } }
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    await this.existUser(id);

    return this.usersRepository.findOne({
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

    await this.usersRepository.update(id, dataForm);
    return this.findOne(id);
  }

  async updatePartial(id: number, data: PatchUserDto) {
    await this.existUser(id);

    const dataForm: any = { ...data };
    if (dataForm.birthAt) dataForm.birthAt = new Date(data.birthAt);
    if (dataForm.password) {
      const passwordHash = await bcrypt.hash(data.password, 8);
      dataForm.password = passwordHash;
    }
    
    await this.usersRepository.update(id, dataForm);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.existUser(id);
    return this.usersRepository.delete(id);
  }

  async existUser(id: number) {
    const existUser = await this.usersRepository.exist({ where: { id } });
    if (!existUser) throw new NotFoundException(`Usuário não encontrado!`);
  }
}
