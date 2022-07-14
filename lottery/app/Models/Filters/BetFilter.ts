/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { BaseModelFilter } from '@ioc:Adonis/Addons/LucidFilter'
import { ModelQueryBuilderContract } from '@ioc:Adonis/Lucid/Orm'

import Bet from 'App/Models/Bet'

export default class BetFilter extends BaseModelFilter {
  public $query: ModelQueryBuilderContract<typeof Bet, Bet>

  user_id(value: string) {
    this.$query.where('user_id', 'LIKE', `%${value}%`)
  }

  game_id(value: string) {
    this.$query.where('game_id', 'LIKE', `%${value}%`)
  }

  createdAt(value: string) {
    this.$query.where('created_at', 'LIKE', `%${value}%`)
  }
}
