/* eslint-disable @typescript-eslint/naming-convention */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import 'dayjs/locale/pt-br'

import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Address from 'App/Models/Address'
import Bet from 'App/Models/Bet'

import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'

import { sendRememberPasswordMail, sendWelcomeMail } from 'App/Services/sendMail'

export default class UsersController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    try {
      if (noPaginate) {
        return User.query()
          .preload('addresses')
          .preload('roles', (roleTable) => {
            roleTable.select('id', 'name')
          })
          .filter(inputs)
      }

      const users = await User.query()
        .preload('addresses')
        .preload('roles', (roleTable) => {
          roleTable.select('id', 'name')
        })
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok(users)
    } catch (error) {
      return response.badRequest({ message: 'Error in users list', originalError: error.message })
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const userSecureId = params.id

    try {
      const user = await User.query()
        .where('secure_id', userSecureId)
        .preload('addresses')
        .preload('roles')
        .firstOrFail()

      const bets = await Bet.query().where('user_id', user.id)

      let betsInLast1Month: any = []

      bets.map((bet) => {
        dayjs.extend(isLeapYear)
        dayjs.locale('pt-br')

        const newDateMoreThan1Month = dayjs(
          bet.createdAt.toSQL().replace(' ', 'T').replace('.000 ', '')
        )
          .add(1, 'M')
          .format()
        const currentDate = dayjs().format()

        if (newDateMoreThan1Month >= currentDate) {
          betsInLast1Month.push(bet)
        }
      })

      return response.ok({ user, betsInLast1Month })
    } catch (error) {
      return response.notFound({ message: 'User not found', originalError: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const bodyUser = request.only(['name', 'cpf', 'email', 'password'])
    const bodyAddress = request.only([
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let userCreated

    const trx = await Database.beginGlobalTransaction()

    try {
      userCreated = await User.create(bodyUser, trx)

      const roleClient = await Role.findBy('name', 'client')

      if (roleClient) await userCreated.related('roles').attach([roleClient.id], trx)
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in create user', originalError: error.message })
    }

    try {
      await userCreated.related('addresses').create(bodyAddress)
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in create address',
        originalError: error.message,
      })
    }

    let user

    try {
      user = await User.query()
        .where('id', userCreated.id)
        .preload('roles')
        .preload('addresses')
        .firstOrFail()
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }

    try {
      await sendWelcomeMail(user, 'email/welcome')
    } catch (error) {
      trx.rollback()
      return response.badRequest({
        message: 'Error in send email welcome',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(user)
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userSecureId = params.id
    const bodyUser = request.only(['name', 'cpf', 'email', 'password'])
    const bodyAddress = request.only([
      'addressId',
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let userUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      userUpdated = await User.findByOrFail('secure_id', userSecureId)

      userUpdated.useTransaction(trx)

      await userUpdated.merge(bodyUser).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in update user', originalError: error.message })
    }

    try {
      const addressesUpdtated = await Address.findByOrFail('id', bodyAddress.addressId)

      addressesUpdtated.useTransaction(trx)

      delete bodyAddress.addressId

      await addressesUpdtated.merge(bodyAddress).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in update address',
        originalError: error.message,
      })
    }

    let userFind

    try {
      userFind = await User.query()
        .where('id', userUpdated.id)
        .preload('roles')
        .preload('addresses')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(userFind)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const userSecureId = params.id

    try {
      await User.query().where('secure_id', userSecureId).delete()

      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'User not found', originalError: error.message })
    }
  }

  public async rememberPassword({ request, response }: HttpContextContract) {
    const rememberPasswordBody = request.all()

    try {
      const user = await User.query().where('email', rememberPasswordBody.email).firstOrFail()

      await sendRememberPasswordMail(user, 'email/remember_password')

      return response.ok({ message: 'Remember password mail sended successfully' })
    } catch (error) {
      return response.notFound({
        message: 'Error in send remember password mail',
        originalError: error.message,
      })
    }
  }
}
