import { Test, TestingModule } from "@nestjs/testing";

import { UsersService } from "./users.service";
import { userRepositoryMock } from "src/../test/mocks/user-repository.mock";
import { CreateUserDto } from "./dtos/create-user.dto";
import { userEntityListMock } from "test/mocks/user-entity-list.mock";


describe('UserService', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        userRepositoryMock,
      ],
    }).compile();

    userService = module.get(UsersService)
  })

  test('Validarm a definição', () => {
    expect(userService).toBeDefined();
  });

  describe('Create', () => {
    test('method create', async () => {
      const data: CreateUserDto = {
        birthAt: '1999-09-17',
        email: 'fulano@gmail.com',
        name: 'fulano',
        password: '123456',
        role: 1
      };

      const result = await userService.create(data);
      expect(result).toEqual(userEntityListMock[0])
    })
  });

  describe('Read', () => {});

  describe('Update', () => {});
  
  describe('Delete', () => {});
});

// test('UserService', () => {
//   const somar = (a, b) => a + b;
//   const result = somar(1, 2);
//   expect(result).toEqual(3);
// })