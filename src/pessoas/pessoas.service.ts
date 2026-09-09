import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const pessoaData = {
        nome: createPessoaDto.nome,
        passwordHash: createPessoaDto.password,
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

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    const pessoaData = {
      nome: updatePessoaDto?.nome,
      passwordHash: updatePessoaDto?.password,
    };
    const pessoa = await this.pessoaRepository.preload({
      id,
      ...pessoaData,
    });

    if (!pessoa) throw new NotFoundException('Pessoa não encontrada!');

    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number) {
    const pessoa = await this.pessoaRepository.findOneBy({
      id,
    });

    if (!pessoa) throw new NotFoundException('Pessoa não encontrada!');

    return this.pessoaRepository.remove(pessoa);
  }
}
