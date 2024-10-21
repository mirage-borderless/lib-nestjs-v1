import { IdentityUser }                      from 'src/common/auth/conf/database/entity/identity-user.entity'
import { DynamicModule, Module, Provider }   from '@nestjs/common'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { EntityClassOrSchema }               from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { Repository }                        from 'typeorm'
import { IdentityUserRepository }            from './identity-user.repository'

@Module({})
export class CommonAuthRepositoryModule {

  static forRoot<T extends IdentityUser.Model = IdentityUser.Model>(
    options: { dsn?: 'slave' | 'master', entity: EntityClassOrSchema }
  ): DynamicModule {
    const MODULES = [
      TypeOrmModule.forFeature([options.entity], options.dsn ?? 'slave')
    ]
    const PROVIDERS: Provider[] = [{
      provide:    IdentityUserRepository<T>,
      inject:     [getRepositoryToken(options.entity, options.dsn ?? 'slave')],
      useFactory: (repository: Repository<T>) => new IdentityUserRepository<T>(repository)
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
