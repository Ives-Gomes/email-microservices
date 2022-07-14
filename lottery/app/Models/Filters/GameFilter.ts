/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { BaseModelFilter } from '@ioc:Adonis/Addons/LucidFilter'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'

import Game from 'App/Models/Game'

export default class GameFilter extends BaseModelFilter {
  public $query: ModelQueryBuilderContract<typeof Game, Game>

  // public method (value: any): void {
  //   this.$query.where('name', value)
  // }

  name(value: string) {
    this.$query.where('name', 'LIKE', `%${value}%`)
  }

  createdAt(value: string) {
    this.$query.where('created_at', 'LIKE', `%${value}%`)
  }

  price(value: string) {
    this.$query.where('price', 'LIKE', `%${value}%`)
  }
}
