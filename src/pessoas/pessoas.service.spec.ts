import { PessoasService } from './pessoas.service';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';

describe('PessoasService', () => {
  let pessoasService: PessoasService;
  let pessoaRepository: Repository<Pessoa>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    pessoasService = module.get<PessoasService>(PessoasService);
    pessoaRepository = module.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = module.get<HashingService>(HashingService);
  });

  it('pessoasService deve estar definido', () => {
    expect(pessoasService).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova pessoa', async () => {
      // Arange
      // CreatePessoaDto
      const createPessoaDto: CreatePessoaDto = {
        email: 'yuri@email.com',
        nome: 'Yuri',
        password: '123456',
      };
      const passwordHash = 'HASHDESENHA';

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

      // Act
      await pessoasService.create(createPessoaDto);

      // Assert
      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      );
      expect(pessoaRepository.create).toHaveBeenCalledWith({
        nome: createPessoaDto.nome,
        passwordHash: passwordHash,
        email: createPessoaDto.email,
      });
    });
  });
});
