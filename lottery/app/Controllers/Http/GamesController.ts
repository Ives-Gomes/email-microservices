import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import Game from 'App/Models/Game'
import Cart from 'App/Models/Cart'

import StoreValidator from 'App/Validators/Game/StoreValidator'
import UpdateValidator from 'App/Validators/Game/UpdateValidator'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    try {
      let games

      const minCartValue = await (
        await Cart.query().select('min_cart_value').firstOrFail()
      ).minCartValue

      if (noPaginate) {
        games = await Game.query().filter(inputs)

        return response.ok({ min_cart_value: minCartValue, types: games })
      }

      games = await Game.query()
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok({ min_cart_value: minCartValue, types: games })
    } catch (error) {
      return response.badRequest({ message: 'Error in games list', originalError: error.message })
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const gameSecureId = params.id

    try {
      const game = await Game.query().where('secure_id', gameSecureId).preload('bet')

      return response.ok(game)
    } catch (error) {
      return response.notFound({ message: 'Game not found', originalError: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const bodyGame = request.all()

    let gameCreated

    const trx = await Database.beginGlobalTransaction()

    try {
      gameCreated = await Game.create(bodyGame, trx)
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in create game', originalError: error.message })
    }

    let gameFind

    try {
      gameFind = await Game.query().where('id', gameCreated.id).preload('bet')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find game',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(gameFind)
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const gameSecureId = params.id
    const bodyGame = request.all()

    let gameUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      gameUpdated = await Game.findByOrFail('secure_id', gameSecureId)

      gameUpdated.useTransaction(trx)

      await gameUpdated.merge(bodyGame).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in update game', originalError: error.message })
    }

    let gameFind

    try {
      gameFind = await Game.query().where('id', gameUpdated.id).preload('bet')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find game',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(gameFind)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const gameSecureId = params.id

    try {
      await Game.query().where('secure_id', gameSecureId).delete()

      return response.ok({ message: 'Game deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'Game not found', originalError: error.message })
    }
  }
}
