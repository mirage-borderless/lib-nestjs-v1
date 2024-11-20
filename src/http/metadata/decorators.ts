import { createParamDecorator, ExecutionContext, HttpStatus, NotImplementedException, Type } from '@nestjs/common'
import { ROUTE_ARGS_METADATA }                                                               from '@nestjs/common/constants'

import { Reflector }                         from '@nestjs/core'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate }                          from 'class-validator'
import { IdentityUser }                      from 'src/common'
import { FunctionStatic }                    from 'src/util'

export const UseJs     = Reflector.createDecorator<string[] | string>()
export const UseCss    = Reflector.createDecorator<string[] | string>()
export const PageTitle = Reflector.createDecorator<string>()
export const Stepper   = Reflector.createDecorator<{ index: number, steps: string[] }>()

function getCallerFunction(): string | undefined {
  const err   = new Error()
  const stack = err.stack
  if (stack) {
    const lines = stack.split("\n");
    if (lines.length > 3) {
      const callerLine = lines[3]
      const match = callerLine.match(/at (\w+)/)
      if (match && match[1]) {
        return match[1]
      }
    }
  }
  return undefined
}

const getUser = (_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>()
  if (!request.user) throw new NotImplementedException('Not found attribute key user from request context, please login first, corrupted...')
  request.user.detail = plainToInstance(IdentityUser.Model, request.user.detail)
  return plainToInstance(IdentityUser.JwtSign, request.user)
}

/**
 * Lấy ra thông tin người dùng hiện tại từ request atrributes
 */
export const User = createParamDecorator(getUser)

function detectPropertyCtor<T>(ctx: ExecutionContext): Type<T> {
  const caller     = getCallerFunction()
  const handler    = ctx.getHandler()
  const mirror     = ctx.getClass().prototype
  const paramTypes = Reflect.getMetadata('design:paramtypes', mirror, handler.name) || []
  const args       = Reflect.getMetadata(ROUTE_ARGS_METADATA, mirror.constructor, handler.name) || {};
  const [_, meta]  = Object.entries(args).find(([_, meta]) => meta['factory']?.name === caller)
  const index      = meta['index']
  return paramTypes[index] as Type<T>
}

const getFormBody =  async <T>(_: unknown, ctx: ExecutionContext) => {
  const request       = ctx.switchToHttp().getRequest<FastifyRequest>()
  const response      = ctx.switchToHttp().getResponse<FastifyReply>()
  const ctor          = detectPropertyCtor<T>(ctx)
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
 * Lấy ra data của form được post từ html
 */
export const FormBody = createParamDecorator(getFormBody)

const getCookieValue = async <T>(key: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>()
  const raw     = request.cookies[key] || ''
  const ctor    = detectPropertyCtor<T>(ctx)
  if (!raw || raw.trim() === '') { return plainToInstance(ctor, {}) }
  const decrypt  = await FunctionStatic.decrypt(raw)
  return plainToInstance(ctor, JSON.parse(decrypt)) as ClassConstructor<T>
}

/**
 * Lấy value từ cookie
 * */
export const CookieValue = createParamDecorator(getCookieValue)
