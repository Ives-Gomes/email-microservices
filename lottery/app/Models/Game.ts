import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Filterable } from '@ioc:Adonis/Addons/LucidFilter'

import Bet from './Bet'

import GameFilter from './Filters/GameFilter'

export default class Game extends compose(BaseModel, Filterable) {
  public static $filter = () => GameFilter

  @column({ isPrimary: true })
  public id: number

  @column()
  public secureId: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public range: number

  @column()
  public price: number

  @column()
  public minAndMaxValue: number

  @column()
  public color: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Bet)
  public bet: HasMany<typeof Bet>

  @beforeCreate()
  public static assignUuid(game: Game) {
    game.secureId = uuidv4()
  }
}
