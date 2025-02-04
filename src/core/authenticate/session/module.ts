import { DynamicModule, Provider }           from '@nestjs/common'
import { ConfigModule, ConfigService }       from '@nestjs/config'
import { JwtModule, JwtService }             from '@nestjs/jwt'
import { PassportModule }                    from '@nestjs/passport'
import crypto                                from 'crypto'
import { ToastModule, ToastService }         from '../../../util'
import { IdentityUser, IdentityUserService } from '../../database'
import { AuthenticateService }               from './service'
import { SessionStrategy }                   from './strategy'

type WithNotification    = { enableToast: true  }
type WithoutNotification = { enableToast: false }

type AuthenticateSetting = { enableEncrypt: boolean } & (WithNotification | WithoutNotification)

export class AuthenticateModule {

  static forRoot<
    T extends IdentityUser.Model = IdentityUser.Model,
    U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
            = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
  >(setting: AuthenticateSetting): DynamicModule {
    const MODULES = [
      JwtModule.registerAsync({
        imports:    [ConfigModule],
        inject:     [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret:        configService.get<string>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_SECRET', 'secret'),
          signOptions: { expiresIn: '1h' },
          global:        true
        })
      }),
      PassportModule.register({
        session:          true,
        defaultStrategy: 'cookie-session',
        property:        'user'
      }),
      ToastModule,
      ConfigModule
    ]

    const PROVIDERS: Provider[] = [
      {
        provide:     AuthenticateService<T>,
        inject:     [IdentityUserService, JwtService, ToastService, ConfigService],
        useFactory: (
          userService:   IdentityUserService<T>,
          jwt:           JwtService,
          toast:         ToastService,
          configService: ConfigService
        ) => {
          if (setting.enableEncrypt === true) {
            configService.set<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPT_ENABLE', true)
            crypto.generateKeyPair('rsa', {
              modulusLength:        2048,
              publicKeyEncoding:  { type: 'spki',  format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            }, (err: Error | null, publicKey: string, privateKey: string) => {
              configService.set<string>('MIRAGE_CRYPTO_PUBLIC_KEY',   publicKey)
              configService.set<string>('MIRAGE_CRYPTO_PRIVATE_KEY', privateKey)
            })
          }
          return new AuthenticateService<T>(
            setting.enableToast === true ? toast : undefined,
            userService,
            jwt,
            configService
          )
        }
      }
    ]
    return {
      imports:    MODULES,
      module:     this,
      providers: [...PROVIDERS, SessionStrategy],
      exports:   [...MODULES, ...PROVIDERS]
    }
  }

  static forTest(setting: AuthenticateSetting): DynamicModule {
    const MODULES = [
      JwtModule.registerAsync({
        imports:    [ConfigModule],
        inject:     [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret:        configService.get<string>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_SECRET', 'secret'),
          signOptions: { expiresIn: '1h' },
          global:        true
        })
      }),
      PassportModule.register({
        session:          true,
        defaultStrategy: 'cookie-session',
        property:        'user'
      }),
      ToastModule,
      ConfigModule
    ]

    const PROVIDERS: Provider[] = [
      {
        provide:     AuthenticateService,
        inject:     [JwtService, ToastService, ConfigService],
        useFactory: (
                       jwt:           JwtService,
                       toast:         ToastService,
                       configService: ConfigService
                     ) => {
          if (setting.enableEncrypt === true) {
            configService.set<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPT_ENABLE', true)
            crypto.generateKeyPair('rsa', {
              modulusLength:        2048,
              publicKeyEncoding:  { type: 'spki',  format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            }, (err: Error | null, publicKey: string, privateKey: string) => {
              configService.set<string>('MIRAGE_CRYPTO_PUBLIC_KEY',   publicKey)
              configService.set<string>('MIRAGE_CRYPTO_PRIVATE_KEY', privateKey)
            })
          }
          return new AuthenticateService(
            setting.enableToast === true ? toast : undefined,
            null,
            jwt,
            configService
          )
        }
      }
    ]
    return {
      imports:    MODULES,
      module:     this,
      providers: [...PROVIDERS, SessionStrategy],
      exports:   [...MODULES, ...PROVIDERS]
    }
  }
}
