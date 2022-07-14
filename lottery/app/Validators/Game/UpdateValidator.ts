import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import MessagesCustom from '../messagesCustom'

export default class StoreValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public refs = schema.refs({
    id: this.ctx.params.id,
  })

  public schema = schema.create({
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
      rules.unique({
        table: 'games',
        column: 'name',
        caseInsensitive: true,
        whereNot: {
          secure_id: this.refs.id,
        },
      }),
    ]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(250), rules.minLength(8)]),
    range: schema.number.optional([rules.unsigned()]),
    price: schema.number.optional([rules.unsigned()]),
    min_and_max_value: schema.number.optional([rules.unsigned()]),
    color: schema.string.optional({ trim: true }, [
      rules.regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
      rules.minLength(4),
      rules.maxLength(7),
    ]),
  })
}
