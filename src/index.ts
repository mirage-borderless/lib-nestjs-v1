import { IdentityUser }      from './core'
import { DatabaseType }      from 'typeorm'
import * as nest             from '@nestjs/core'
import * as fastify          from 'fastify'
import { DataSourceOptions } from 'typeorm'
import { Driver }            from 'typeorm/driver/Driver'

export * from './fastify'
export * from './util'
export * from './core'

type RouteOptions = {
  name: string,
  canActive?: boolean
  data?: Record<string, any>
}
declare global {
  type JwtUserSign    = IdentityUser.JwtSign
  type FastifyReply   = fastify.FastifyReply
  type FastifyRequest = fastify.FastifyRequest
  type Validators     = {
    values$:  Record<string, any>,
    errors?: { [K in keyof Validators['values$']]: { [type: string]: string } } | string
  }

  interface FormBase {
    isValid?: boolean
  }

  type RouteTree = nest.RouteTree & RouteOptions
  type Routes    = RouteTree[]

  interface DbConfigHostSpec {
    host_spec: {
      driver?:   Driver
      host?:     string
      port?:     number
      username?: string
      password?: string
      options?:  DataSourceOptions
    }
    [db_name: string & { readonly __brand: unique symbol }]: {
      options?: DataSourceOptions
    }
  }
  type DatabaseServer = Record<DatabaseType, DbConfigHostSpec>
}
