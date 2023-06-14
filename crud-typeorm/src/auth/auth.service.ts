import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer'
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm'

import { UsersService } from '../users/users.service';
import { AuthForgetDto } from './dtos/auth-forget.dto';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { AuthResetDto } from './dtos/auth-reset.dto';
import { UserEntity } from 'src/users/entity/user.entity';

@Injectable()
export class AuthService {
  private readonly issuer: string = 'login';
  private readonly audience: string = 'users';

  constructor(
    private readonly jwtService: JwtService, 
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  createToken(user: UserEntity) {
    return {
      accessToken: this.jwtService.sign({ 
        id: user.id,
        name: user.name,
        email: user.name,
      }, { 
        // expiresIn: 60 * 60 * 12, // iat: Date.now()/1000,
        expiresIn: "12 hours",
        subject: String(user.id),
        issuer: this.issuer,
        audience: this.audience,
        // notBefore: Math.ceil((Date.now() + 1000 * 60 * 60) / 1000), // Token fica válido após uma hora!
      })
    }
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        issuer: this.issuer,
        audience: this.audience,
      })

      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login({ email, password }: AuthLoginDto) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) throw new UnauthorizedException('E-mail e/ou senha incorretos.');

    const isHashValid = await bcrypt.compare(password, user.password);
    if (!isHashValid) throw new UnauthorizedException('E-mail e/ou senha incorretos.');

    return this.createToken(user);
  }

  async forget({ email }: AuthForgetDto) {
    const user = await this.usersRepository.findOne({
      where: { email }
    })

    if (!user) throw new UnauthorizedException('E-mail inválido.');

    // enviar e-mail...
    const token = this.jwtService.sign({ id: user.id }, { 
      expiresIn: "30 minutes",
      subject: String(user.id),
      issuer: 'forget',
      audience: 'users',
    });
    await this.mailer.sendMail({
      subject: 'recuperação de senha',
      to: 'nathan_oliveiramendonca@hotmail.com',
      template: 'forget',
      context: { name: user.name, token },
    })

    return true;
  }

  async reset({ password, token }: AuthResetDto) {
    // validar token
    try {
      const { id } = this.jwtService.verify(token, {
        issuer: 'forget',
        audience: 'users',
      }) as { id: number };

      if (isNaN(Number(id))) throw new BadRequestException('token inválido');
      const passwordHash = await bcrypt.hash(password, 8);

      await this.usersRepository.update(id, {
        password: passwordHash,
      });

      const user = await this.usersService.findOne(id);
      return this.createToken(user);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async register(data: AuthRegisterDto) {
    const user = await this.usersService.create(data);
    return this.createToken(user);
  }
}