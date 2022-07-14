import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Game from 'App/Models/Game'

test.group('Bets index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should create new bet', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const games: any = []
    const numbers: any = []
    const gamesQuery = await Game.query()

    gamesQuery.map((game) => {
      games.push(game.$attributes)
    })

    const game = await Game.query().firstOrFail()

    for (let i = 0; i < game.minAndMaxValue; i++) {
      numbers.push(Math.floor(Math.random() * game.minAndMaxValue))
    }

    const bodyContent = {
      games: [
        {
          game_id: game.id,
          numbers: numbers,
        },
      ],
    }

    const response = await client
      .post(route('BetsController.store'))
      .bearerToken(token)
      .json(bodyContent)

    response.assertStatus(200)
    response.assertBodyContains({ Array })
  })
})
