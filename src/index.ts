import { DatabaseType }           from 'typeorm'
import { IdentityUser }           from './common/auth/conf/database/entity/identity-user.entity'
import * as nest                  from '@nestjs/core'
import * as fastify               from 'fastify'
import type { DataSourceOptions } from 'typeorm'
import type { Driver }            from 'typeorm/driver/Driver'

export * from './http/fastify-mvc'
import * as fView   from '@fastify/view/types'
import * as fCookie from '@fastify/cookie'

type RouteOptions = {
  name: string,
  canActive?: boolean
  data?: Record<string, any>
}
declare global {
  type JwtUserSign<T extends IdentityUser.Model = IdentityUser.Model> = IdentityUser.JwtSign<T>
  type FastifyReply   = fastify.FastifyReply
  type FastifyRequest = fastify.FastifyRequest
  type Validators     = {
    values$:  Record<string, any>,
    errors?: { [K in keyof Validators['values$']]: { [type: string]: string } } | string
  }

  interface FormBase extends Record<any, any> {
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
  }
  type DbConfigInstance = {
    [db_name: string]: {
      options?: DataSourceOptions
    }
  }
  type DatabaseSetting = DbConfigHostSpec & DbConfigInstance
  type DatabaseServer  = Record<DatabaseType, DatabaseSetting>
}
