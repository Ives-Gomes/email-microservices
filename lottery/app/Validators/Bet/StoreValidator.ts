import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MessagesCustom from '../messagesCustom'

export default class StoreValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    games: schema.array().members(
      schema.object().members({
        game_id: schema.number([rules.exists({ table: 'games', column: 'id' }), rules.unsigned()]),
        numbers: schema.array().members(schema.number()),
      })
    ),
  })
}
