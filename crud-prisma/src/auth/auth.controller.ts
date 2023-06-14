import { 
  BadRequestException, 
  Body, 
  Controller, 
  FileTypeValidator, 
  ParseFilePipe, 
  Post, 
  UploadedFile, 
  UploadedFiles, 
  UseGuards, 
  UseInterceptors, 
  MaxFileSizeValidator,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express";
import { Express } from 'express';
import { join } from 'path';

import { User } from "src/decorators/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { FileService } from 'src/file/file.service';

import { AuthService } from './auth.service';
import { AuthForgetDto } from "./dtos/auth-forget.dto";
import { AuthLoginDto } from "./dtos/auth-login.dto";
import { AuthRegisterDto } from "./dtos/auth-register.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('login')
  async login(@Body() body: AuthLoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDto) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() body: AuthForgetDto) {
    return this.authService.forget(body);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  async uploadPhoto(
    @User() user, 
    @UploadedFile(
      new ParseFilePipe({ 
        validators: [
          new FileTypeValidator({ fileType: 'image/png' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 50 }),
        ]
      })
    ) photo: Express.Multer.File,
  ) {
    const path = join(__dirname, '..', '..', 'storage', 'photos', `photo-${user.id}.png`);
    try {
      await this.fileService.upload(photo, path);
      return { upload: true }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('files')
  async uploadMultiFiles(@User() user, @UploadedFiles() files: Express.Multer.File[]) {
    return files;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'photo', maxCount: 1 }, { name: 'documents', maxCount: 10 }]
    )
  )
  @Post('files-fields')
  async uploadMultiFilesFields(@User() user, @UploadedFiles() files: { photo: Express.Multer.File, documents: Express.Multer.File[] } ) {
    return files;
  }

  @UseGuards(AuthGuard)
  @Post('verify-token')
  async verifyToken(@User() user) {
    return { user };
    // @Headers('authorization') token: string
    // return this.authService.checkToken((token ?? '').split(' ')[1]);
  }
}
