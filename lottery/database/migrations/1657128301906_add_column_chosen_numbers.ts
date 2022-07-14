import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'bets'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('chosen_numbers', 250).notNullable().after('game_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('chosen_numbers')
    })
  }
}
