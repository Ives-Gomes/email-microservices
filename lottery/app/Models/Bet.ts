import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Filterable } from '@ioc:Adonis/Addons/LucidFilter'

import User from './User'
import Game from './Game'

import BetFilter from './Filters/BetFilter'

export default class Bet extends compose(BaseModel, Filterable) {
  public static $filter = () => BetFilter

  @column({ isPrimary: true })
  public id: number

  @column()
  public secureId: string

  @column()
  public userId: number

  @column()
  public gameId: number

  @column()
  public chosenNumbers: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Game)
  public game: BelongsTo<typeof Game>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @beforeCreate()
  public static assignUuid(bet: Bet) {
    bet.secureId = uuidv4()
  }
}
