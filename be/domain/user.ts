export class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
    ) {}
}

// define user repository interface

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    deleteById(id: string): Promise<void>;
}