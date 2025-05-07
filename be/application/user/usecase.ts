import { UserRepository } from "@/be/domain/user";

export class UserUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(id: string)  {
    return this.userRepository.findById(id);
  }

  async deleteUser(id: string) {
    return this.userRepository.deleteById(id);
  }
}

export class DeleteUserUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async deleteUser(id: string) {
    return this.userRepository.deleteById(id);
  }
}
