import { DynamicModule, Module, Provider }   from '@nestjs/common'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { IdentityUserService } from 'src/common/database/auth/service/identity-user.service'
import { Repository }          from 'typeorm'
import { IdentityUser }        from 'src/common/database/auth/entity/identity-user.entity'

@Module({})
export class CommonAuthRepositoryModule {

  static forRoot<T extends IdentityUser.Model = IdentityUser.Model>(
    options: { dsn?: 'slave' | 'master', entity: EntityClassOrSchema }
  ): DynamicModule {
    const MODULES = [
      TypeOrmModule.forFeature([options.entity], options.dsn ?? 'slave')
    ]
    const PROVIDERS: Provider[] = [{
      provide:    IdentityUserService<T>,
      inject:     [getRepositoryToken(options.entity, options.dsn ?? 'slave')],
      useFactory: (repository: Repository<T>) => new IdentityUserService<T>(repository)
    }]

    return {
      imports:   MODULES,
      module:    this,
      providers: PROVIDERS,
      exports:   PROVIDERS,
      global:    true
    }
  }
}
