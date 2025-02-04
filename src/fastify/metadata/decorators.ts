import { createParamDecorator, ExecutionContext, HttpStatus, NotImplementedException, Type, UnauthorizedException } from '@nestjs/common'
import { ROUTE_ARGS_METADATA }                                                                                      from '@nestjs/common/constants'
import { ConfigService }                                                                     from '@nestjs/config'

import { Reflector }                         from '@nestjs/core'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate }                          from 'class-validator'
import { IdentityUser }                      from '../../core'
import { FunctionStatic }                    from '../../util'

/**
 * @example
 * ```typescript
 * @Controller()
 * export class HomeController {
 *    @Get('path/:id')
 *    @UseJs(['jquery', 'bootstrap'])
 *    view() { }
 * }
 * ```
 */
export const UseJs     = Reflector.createDecorator<string[] | string>()
/**
 * @example
 * ```typescript
 * @Controller()
 * export class HomeController {
 *    @Get('path/:id')
 *    @UseCss(['site', 'bootstrap'])
 *    view() { }
 * }
 * ```
 */
export const UseCss    = Reflector.createDecorator<string[] | string>()
/**
 * @example
 * ```typescript
 * @Controller()
 * export class HomeController {
 *    @Get('path/:id')
 *    @PageTitle('Home page')
 *    view() { }
 * }
 * ```
 */
export const PageTitle = Reflector.createDecorator<string>()
/**
 * @example
 * ```typescript
 * @Controller()
 * export class HomeController {
 *    @Get('path/:id')
 *    @Stepper({ index: 1, steps: ['Step 1', 'Step 2'] })
 *    view() { }
 * }
 * ```
 */
export const Stepper   = Reflector.createDecorator<{ index: number, steps: string[] }>()

/**
 * Lấy ra tên của function đang call function đang chạy
 * */
function getCallerFunction(): string | undefined {
  const err   = new Error()
  const stack = err.stack
  if (stack) {
    const lines = stack.split("\n")
    if (lines.length > 3) {
      const callerLine = lines[3]
      const match = callerLine.match(/at (\w+)/)
      if (match && match[1]) { return match[1] }
    }
  }
  return undefined
}

const __userFn = (_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>()
  if (!request.user) throw new NotImplementedException('Not found attribute key user from request context, please login first, corrupted...')
  request.user.detail = plainToInstance(IdentityUser.Model, request.user.detail)
  return plainToInstance(IdentityUser.JwtSign, request.user)
}
/**
 * @example
 * ```typescript
 * @Controller()
 * @UseGuard(CommonAuthJwtGuard)
 * export class HomeController {
 *    @Get('path/:id')
 *    view(@User() user: JwtUserSign) { ... }
 * }
 * ```
 */
export const User = createParamDecorator(__userFn)

/**
 * Lấy ra kiểu trả về của 1 param khi param có sử dụng Param
 * Decorator
 * */
function detectTypeofParam<T>(ctx: ExecutionContext): Type<T> {
  const caller     = getCallerFunction()
  const handler    = ctx.getHandler()
  const mirror     = ctx.getClass().prototype
  const paramTypes = Reflect.getMetadata('design:paramtypes', mirror, handler.name) || []
  const args       = Reflect.getMetadata(ROUTE_ARGS_METADATA, mirror.constructor, handler.name) || {};
  const [_, meta]  = Object.entries(args).find(([_, meta]) => meta['factory']?.name === caller)
  const index      = meta['index']
  return paramTypes[index] as Type<T>
}

const __formBodyFn = async <T>(_: unknown, ctx: ExecutionContext) => {
  const request       = ctx.switchToHttp().getRequest<FastifyRequest>()
  const response      = ctx.switchToHttp().getResponse<FastifyReply>()
  const ctor          = detectTypeofParam<T>(ctx)
  const instance      = plainToInstance(ctor, request.body) as ClassConstructor<T>
  const errors        = await validate(instance)
  const formBody: any = instance
  if (errors.length) {
    const form           = errors[0].target
    const takeFirstError = (constraints: { [key: string]: string }) => {
      if (!constraints) return {}
      const firstKey = Object.keys(constraints)[0]
      return { [firstKey]: constraints[firstKey] }
    }
    Object.keys(form).map(field =>
      response.formFieldError(field,
        takeFirstError(errors.find(_ => _.property === field)?.constraints)))
    response.status(HttpStatus.BAD_REQUEST)
    return null
  } else {
    response.setValidatorErrors(null)
  }
  return formBody
}
/**
 * @example
 * ```typescript
 * @Controller()
 * export class LoginController {
 *    @Get('auth/login')
 *    async login(@FormBody() form: LoginForm) { }
 * }
 * ```
 */
export const FormBody = createParamDecorator(__formBodyFn)

const __cookieValueFn = async <T>(key: string, ctx: ExecutionContext) => {
  const request  = ctx.switchToHttp().getRequest<FastifyRequest>()
  const response = ctx.switchToHttp().getResponse<FastifyReply>()
  const config  = request.backend().get(ConfigService<any>)
  const raw     = request.cookies[key] || ''
  const ctor    = detectTypeofParam<T>(ctx)
  if (!raw || raw.trim() === '') { return plainToInstance(ctor, {}) }
  if (config.get<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPT_ENABLE', false)) {
    const privateKey = config.get<string>('MIRAGE_CRYPTO_PRIVATE_KEY')
    const decrypt    = await FunctionStatic.decrypt(raw, privateKey, function (e) {
      response.clearCookie(key)
      throw new UnauthorizedException()
    })
    return plainToInstance(ctor, decrypt) as ClassConstructor<T>
  }
  return plainToInstance(ctor, raw) as ClassConstructor<T>
}

/**
 * @example
 * ```typescript
 * @Controller()
 * export class ShoppingController {
 *    @Get('cart')
 *    async cart(@CookieValue('__cookie.cart') cart: ShoppingCart) { }
 * }
 * ```
 */
export const CookieValue = createParamDecorator(__cookieValueFn)
