import { getRepositoryToken } from '@nestjs/typeorm'

import { UserEntity } from "src/users/entity/user.entity";
import { userEntityListMock } from './user-entity-list.mock';

export const userRepositoryMock = {
  provide: getRepositoryToken(UserEntity),
  useValue: {
    exist: jest.fn(),
    create: jest.fn(),
    save: jest.fn().mockReturnValue(userEntityListMock[0]),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}