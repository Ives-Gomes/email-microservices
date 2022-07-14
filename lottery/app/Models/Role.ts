import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { Filterable } from '@ioc:Adonis/Addons/LucidFilter'

import RoleFilter from './Filters/RoleFilter'

export default class Role extends compose(BaseModel, Filterable) {
  public static $filter = () => RoleFilter

  @column({ isPrimary: true })
  public id: number

  @column()
  public secureId: string

  @column()
  public name: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(role: Role) {
    role.secureId = uuidv4()
  }
}
