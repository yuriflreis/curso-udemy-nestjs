import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { tokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

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

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: tokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('Arquivo muito pequeno!');
    }

    const pessoa = await this.findOne(tokenPayload.sub);

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);
    const filename = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', filename);

    await fs.writeFile(fileFullPath, file.buffer);

    pessoa.picture = filename;
    await this.pessoaRepository.save(pessoa);

    return pessoa;
  }
}
