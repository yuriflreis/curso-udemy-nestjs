import { Injectable } from '@nestjs/common';
import { RecadoEntity } from './entities/recado.entity';

@Injectable()
export class RecadosService {
  private lastId = 1;
  private recados: RecadoEntity[] = [
    {
      id: 1,
      texto: 'Este é um recado teste',
      de: 'Joana',
      para: 'João',
      lido: false,
      data: new Date(),
    }
  ];

  findAll() {
    return this.recados;
  }

  findOne(id: string) {
    return this.recados.find(item => item.id === +id);
  }

  create(body: any) {
    this.lastId++;
    const id = this.lastId;
    const newRecado = {
      id,
      ...body
    };
    this.recados.push(newRecado);

    return newRecado;
  }

  update(id: string, body: any) {
    const recadoExistenteIndex = this.recados.findIndex(
      item => item.id === +id,
    );

    if (recadoExistenteIndex >= 0) {
      const recadoExistente = this.recados[recadoExistenteIndex];

      this.recados[recadoExistenteIndex] = {
        ...recadoExistente,
        ...body,
      }
    }

    return this.recados[recadoExistenteIndex];
  }

  remove(id: string) {
    const recadoExistenteIndex = this.recados.findIndex(
      item => item.id === +id,
    );

    if (recadoExistenteIndex >= 0) {
      this.recados.slice(recadoExistenteIndex, 1);
    }
  }
}