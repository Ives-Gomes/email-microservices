import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

import Game from 'App/Models/Game'

import { GameFactory } from 'Database/factories'

test.group('Games index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should list games', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const response = await client.get(route('GamesController.index')).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ Array })
  })

  test('should create new game', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const game = await GameFactory.makeStubbed()

    const response = await client.post(route('GamesController.store')).bearerToken(token).json({
      name: game.name,
      description: game.description,
      range: game.range,
      price: game.price,
      min_and_max_value: game.minAndMaxValue,
      color: game.color,
    })

    response.assertStatus(200)
    response.assertBodyContains({ Array })
  })

  test('should not update a game with wrong game id', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const game = await GameFactory.makeStubbed()

    const response = await client
      .put(route('GamesController.update', ['123']))
      .bearerToken(token)
      .json({
        name: game.name,
      })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Error in update game',
      originalError: 'E_ROW_NOT_FOUND: Row not found',
    })
  })

  test('should update a game', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const gameInstance = await GameFactory.makeStubbed()

    const game = await Game.query().firstOrFail()
    const gameId = game.secureId

    const response = await client
      .put(route('GamesController.update', [gameId]))
      .bearerToken(token)
      .json({
        name: gameInstance.name,
      })

    response.assertStatus(200)
    response.assertBodyContains({ Array })
  })

  test('should destroy a game', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const game = await Game.query().firstOrFail()
    const gameId = game.secureId

    const response = await client
      .delete(route('GamesController.destroy', [gameId]))
      .bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Game deleted successfully' })
  })
})
