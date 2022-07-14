import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned()
      table.uuid('secure_id').unique().notNullable()

      table.string('name', 50).notNullable()
      table.string('description', 250).notNullable()
      table.integer('range').unsigned().notNullable()
      table.decimal('price', 8, 2).defaultTo(0).unsigned().notNullable()
      table.integer('min_and_max_value').unsigned().notNullable()
      table.string('color', 50).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
