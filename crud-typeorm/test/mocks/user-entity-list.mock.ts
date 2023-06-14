import { UserEntity } from 'src/users/entity/user.entity';
import { Role } from "src/enums/role.enum";

export const userEntityListMock: UserEntity[] = [
  {
    id: 1,
    email: 'fulano@gmail.com',
    name: 'fulano',
    password: '123456',
    birthAt: new Date('1999-09-17'),
    role: Role.Admin,
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: 2,
    email: 'ciclano@gmail.com',
    name: 'ciclano',
    password: '123456',
    birthAt: new Date('1999-09-17'),
    role: Role.User,
    updatedAt: new Date(),
    createdAt: new Date(),
  }
]