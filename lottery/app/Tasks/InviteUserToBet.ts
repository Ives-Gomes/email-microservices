/* eslint-disable @typescript-eslint/naming-convention */
import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import 'dayjs/locale/pt-br'

import User from 'App/Models/User'
import Bet from 'App/Models/Bet'

import { sendInviteToBetMail } from 'App/Services/sendMail'

export default class VerifyTimeItemInCart extends BaseTask {
  public static get schedule() {
    return '* * 9 * * *'
  }

  public static get useLock() {
    return false
  }

  public async handle() {
    dayjs.extend(isLeapYear)
    dayjs.locale('pt-br')

    try {
      const bets = await Bet.all()

      await Promise.all(
        bets.map(async (bet) => {
          const { created_at, user_id } = bet.serialize()

          const newDateMoreThan1week = dayjs(created_at).add(1, 'w').format()
          const currentDate = dayjs().format()

          if (newDateMoreThan1week < currentDate) {
            try {
              const user = await User.query().where('id', user_id).firstOrFail()

              await sendInviteToBetMail(user, 'email/invite_to_bet')
              return Logger.info('Email invited')
            } catch (error) {
              return Logger.error('Error in invite email')
            }
          }
        })
      )
    } catch (error) {
      Logger.error('Error in send email to invite user to do a bet')
    }
  }
}
