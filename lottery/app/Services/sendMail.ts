import Mail from '@ioc:Adonis/Addons/Mail'

import Bet from 'App/Models/Bet'
import User from 'App/Models/User'

export async function sendWelcomeMail(user: User, template: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('tgl_api@email.com')
      .to(user.email)
      .subject('Welcome to TGL API!')
      .htmlView(template, { user })
  })
}

export async function sendInviteToBetMail(user: User, template: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('tgl_api@email.com')
      .to(user.email)
      .subject('We miss you!')
      .htmlView(template, { user })
  })
}

export async function sendCreatedBetMail(user: User, bet: Bet, template: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('tgl_api@email.com')
      .to(user.email)
      .subject('Your new bet!')
      .htmlView(template, { user, bet })
  })
}

export async function sendRememberPasswordMail(user: User, template: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('tgl_api@email.com')
      .to(user.email)
      .subject('Remember your password!')
      .htmlView(template, { user })
  })
}
