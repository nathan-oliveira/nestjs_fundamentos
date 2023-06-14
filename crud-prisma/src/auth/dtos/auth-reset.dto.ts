import { IsJSON, IsString, MinLength } from "class-validator";

export class AuthResetDto {
  @IsString()
  @MinLength(6)
  password: string;

  @IsJSON()
  token: string;
}
