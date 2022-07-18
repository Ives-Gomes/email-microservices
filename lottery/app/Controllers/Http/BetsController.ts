import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { Kafka } from 'kafkajs'

import Bet from 'App/Models/Bet'
import Game from 'App/Models/Game'

import StoreValidator from 'App/Validators/Bet/StoreValidator'
import UpdateValidator from 'App/Validators/Bet/UpdateValidator'

import { sendCreatedBetMail } from 'App/Services/sendMail'
import User from 'App/Models/User'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    try {
      if (noPaginate) {
        return Bet.query().filter(inputs)
      }

      const bets = await Bet.query()
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok(bets)
    } catch (error) {
      return response.badRequest({ message: 'Error in bets list', originalError: error.message })
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const betSecureId = params.id

    try {
      const bet = await Bet.query().where('secure_id', betSecureId).preload('user').preload('game')

      return response.ok(bet)
    } catch (error) {
      return response.notFound({ message: 'Bet not found', originalError: error.message })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(StoreValidator)

    const userAuthenticated = auth.user?.id

    if (userAuthenticated) {
      const bodyBet = request.all()

      let betCreated

      const trx = await Database.beginGlobalTransaction()

      try {
        let betInfos: any = []

        await Promise.all(
          bodyBet.games.map(async (game) => {
            const currentGame = await Game.findByOrFail('id', game.game_id)
            const numbers = game.numbers

            if (
              numbers.length > currentGame.minAndMaxValue ||
              numbers.length < currentGame.minAndMaxValue
            ) {
              throw new Error('Numbers length is outside of min or max value expected')
            }

            numbers.forEach((number) => {
              if (number > currentGame.range) {
                throw new Error(`The number ${number} is outside of range`)
              }
            })

            const bet = {
              user_id: userAuthenticated,
              game_id: game.game_id,
              chosen_numbers: game.numbers.join(','),
            }

            betInfos.push(bet)
          })
        )

        betCreated = await Bet.createMany(betInfos, trx)
      } catch (error) {
        trx.rollback()

        return response.badRequest({ message: 'Error in create bet', originalError: error.message })
      }

      const kafka = new Kafka({
        clientId: 'lottery',
        brokers: ['localhost:9092'],
        enforceRequestTimeout: false
      })

      const admin = kafka.admin()
      const producer = kafka.producer()

      await admin.connect()
      await producer.connect()

      await admin.createTopics({
        validateOnly: false,
        waitForLeaders: true,
        timeout: 15000,
        topics: [{
          topic: 'kafka-topic-1',
          numPartitions: 6,
          replicationFactor: -1,
          replicaAssignment: [],
          configEntries: []
        }],
      })

      const responseKafka = await admin.listTopics()

      console.log(responseKafka)

      const kafkaResponse = await producer.send({
        topic: 'kafka-topic-1',
        messages: [
          { key: '1', value: 'Welcome to KAFKA!', partition: 0 },
        ],
      })

      console.log(kafkaResponse)

      await producer.disconnect()
      await admin.disconnect()

      trx.commit()

      return response.ok(betCreated)
    } else {
      return response.unauthorized({ message: 'You need to be logged' })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const betSecureId = params.id
    const bodyBet = request.all()

    let betUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      betUpdated = await Bet.findByOrFail('secure_id', betSecureId)

      betUpdated.useTransaction(trx)

      await betUpdated.merge(bodyBet).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in update bet', originalError: error.message })
    }

    let betFind

    try {
      betFind = await Bet.query().where('id', betUpdated.id).preload('user').preload('game')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find bet',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(betFind)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const betSecureId = params.id

    try {
      await Bet.query().where('secure_id', betSecureId).delete()

      return response.ok({ message: 'Bet deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'Bet not found', originalError: error.message })
    }
  }
}
