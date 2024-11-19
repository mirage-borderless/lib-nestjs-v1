import { ROUTE_ARGS_METADATA }                                                   from '@nestjs/common/constants';
import { ClassConstructor }                                                      from 'class-transformer/types/interfaces/class-constructor.type';
import { FunctionStatic }                                                        from 'src/util'
import { IdentityUser }                                                          from '../../common'
import { createParamDecorator, ExecutionContext, NotImplementedException, Type } from '@nestjs/common'

import { Reflector }             from '@nestjs/core'
import { plainToInstance }       from 'class-transformer'
import { validate }              from 'class-validator'

export const UseJs     = Reflector.createDecorator<string[] | string>()
export const UseCss    = Reflector.createDecorator<string[] | string>()
export const PageTitle = Reflector.createDecorator<string>()
export const Stepper   = Reflector.createDecorator<{ index: number, steps: string[] }>()

/**
 * Lấy ra thông tin người dùng hiện tại từ request atrributes
 */
export const User = createParamDecorator(
  <T extends IdentityUser.Model = IdentityUser.Model>(ctor: Type<T>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    if (!request.user) throw new NotImplementedException('Not found attribute key user from request context, please login first, corrupted...')
    request.user.detail = plainToInstance(ctor, request.user.detail)
    return request.user
  }
)

function detectCtor<T>(ctx: ExecutionContext, f: Function): Type<T> {
  const handler    = ctx.getHandler()
  const mirror     = ctx.getClass().prototype
  const paramTypes = Reflect.getMetadata('design:paramtypes', mirror, handler.name) || []
  const args       = Reflect.getMetadata(ROUTE_ARGS_METADATA, mirror.constructor, handler.name) || {};
  const [_, meta]  = Object.entries(args).find(([_, meta]) => meta['factory'] == f)
  if (!meta || !meta['index']) {
    throw new Error('method detectCtor error')
  }
  const index      = meta['index']
  return paramTypes[index] as Type<T>
}

const getFormBody =  async <T>(_: unknown, ctx: ExecutionContext) => {
  const request  = ctx.switchToHttp().getRequest<FastifyRequest>()
  const response = ctx.switchToHttp().getResponse<FastifyReply>()
  const ctor     = detectCtor<T>(ctx, getFormBody)
  const instance = plainToInstance(ctor, request.body) as any
  const errors   = await validate(instance)
  const formBody = instance
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
  } else {
    response.setValidatorErrors(null)
  }
  formBody['isValid'] = errors.length === 0
  return formBody
}

/**
 * Lấy ra data của form được post từ html
 */
export const FormBody = createParamDecorator(getFormBody)

const getCookieValue = async <T>(option: { key: string, decrypted?: boolean }, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>()
  const raw     = request.cookies[option.key] || ''
  if (!raw || raw.trim() === '') { return null }
  const ctor = detectCtor(ctx, getCookieValue)
  if (!option.decrypted) {
    return await FunctionStatic
      .decrypt(raw)
      .then(JSON.parse)
      .then(value => plainToInstance(ctor, value))
  }
  return plainToInstance(ctor, JSON.parse(raw))
}

/**
 * Lấy value từ cookie
 * */
export const CookieValue = createParamDecorator(getCookieValue)
