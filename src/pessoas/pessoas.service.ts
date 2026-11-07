import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { tokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPessoaDto.password,
      );

      const pessoaData = {
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
      };

      const novaPessoa = this.pessoaRepository.create(pessoaData);

      return this.pessoaRepository.save(novaPessoa);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail já está cadastrado!');
      }

      throw error;
    }
  }

  async findAll() {
    const pessoas = await this.pessoaRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return pessoas;
  }

  async findOne(id: number) {
    const pessoa = await this.pessoaRepository.findOne({
      where: {
        id,
      },
    });

    if (pessoa) return pessoa;

    throw new NotFoundException('Pessoa não encontrada!');
  }

  async update(
    id: number,
    updatePessoaDto: UpdatePessoaDto,
    tokenPayload: tokenPayloadDto,
  ) {
    const pessoaData = {
      nome: updatePessoaDto?.nome,
    };

    if (updatePessoaDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updatePessoaDto.password,
      );

      pessoaData['passwordHash'] = passwordHash;
    }

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...pessoaData,
    });

    if (!pessoa) throw new NotFoundException('Pessoa não encontrada!');

    if (pessoa.id !== tokenPayload.sub) {
      throw new ForbiddenException('Você não é essa pessoa.');
    }

    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number, tokenPayload: tokenPayloadDto) {
    const pessoa = await this.pessoaRepository.findOneBy({
      id,
    });

    if (!pessoa) throw new NotFoundException('Pessoa não encontrada!');

    if (pessoa.id !== tokenPayload.sub) {
      throw new ForbiddenException('Você não é essa pessoa.');
    }

    return this.pessoaRepository.remove(pessoa);
  }
}
