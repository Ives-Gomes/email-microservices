import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

import User from 'App/Models/User'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract & any) {
    const { email, password } = request.all()

    const user = await User.query().where('email', email).preload('roles').first()

    try {
      const token = await auth.use('api').attempt(email, password, {
        name: user?.name,
        expiresIn: Env.get('NODE_ENV') === 'development' ? '' : '30mins',
      })

      return { token, user }
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }
}
