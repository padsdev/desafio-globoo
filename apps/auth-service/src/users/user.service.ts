import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UserResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
  }

  /**
   * Encontra um usuário pelo email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Encontra um usuário pelo username.
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  /**
   * Encontra um usuário pelo ID.
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Verifica se um email já está em uso.
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.usersRepository.count({ where: { email } });
    return count > 0;
  }

  /**
   * Verifica se um username já está em uso.
   */
  async usernameExists(username: string): Promise<boolean> {
    const count = await this.usersRepository.count({ where: { username } });
    return count > 0;
  }

  /**
   * Cria um novo usuário e salva no banco.
   * Valida se email e username já existem.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Valida se email já existe
    if (await this.emailExists(createUserDto.email)) {
      throw new ConflictException('Email já está em uso');
    }

    // Valida se username já existe
    if (await this.usernameExists(createUserDto.username)) {
      throw new ConflictException('Username já está em uso');
    }

    // Faz o hash da senha
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    // Cria a nova entidade
    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      passwordHash,
    });

    // Salva no banco de dados
    return this.usersRepository.save(newUser);
  }

  /**
   * Valida a senha de um usuário.
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Retorna um usuário sem o hash da senha (para resposta de API).
   */
  toResponseDto(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  }

  /**
   * Lista todos os usuários (útil para atribuição de tarefas).
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'username', 'createdAt'],
    });
  }
}