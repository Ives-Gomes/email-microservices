/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { BaseModelFilter } from '@ioc:Adonis/Addons/LucidFilter'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'

import Role from 'App/Models/Role'

export default class RoleFilter extends BaseModelFilter {
  public $query: ModelQueryBuilderContract<typeof Role, Role>

  // public method (value: any): void {
  //   this.$query.where('name', value)
  // }

  name(value: string) {
    this.$query.where('name', 'LIKE', `%${value}%`)
  }

  createdAt(value: string) {
    this.$query.where('created_at', 'LIKE', `%${value}%`)
  }
}
