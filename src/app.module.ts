import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from './recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from './pessoas/pessoas.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import appConfig from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: async (appConfigurations: ConfigType<typeof appConfig>) => ({
        type: appConfigurations.database.type,
        host: appConfigurations.database.host,
        port: appConfigurations.database.port,
        username: appConfigurations.database.username,
        database: appConfigurations.database.database,
        password: appConfigurations.database.password,
        autoLoadEntities: appConfigurations.database.autoLoadEntities,
        synchronize: appConfigurations.database.synchronize,
      }),
    }),
    RecadosModule,
    PessoasModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
