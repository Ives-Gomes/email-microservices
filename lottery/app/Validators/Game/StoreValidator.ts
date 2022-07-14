import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import MessagesCustom from '../messagesCustom'

export default class StoreValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
      rules.unique({ table: 'games', column: 'name' }),
    ]),
    description: schema.string({ trim: true }, [rules.maxLength(250), rules.minLength(8)]),
    range: schema.number([rules.unsigned()]),
    price: schema.number([rules.unsigned()]),
    min_and_max_value: schema.number([rules.unsigned()]),
    color: schema.string({ trim: true }, [
      rules.regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
      rules.minLength(4),
      rules.maxLength(7),
    ]),
  })
}
