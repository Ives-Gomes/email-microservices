import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

import { UserFactory } from 'Database/factories/index'

test.group('Users index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should not create new user without the body content', async ({ client, route }) => {
    const response = await client.post(route('UsersController.store'))

    response.assertStatus(422)
    response.assertBodyContains({ Array })
  })

  test('should not create new user with invalid email', async ({ client, route }) => {
    const user = await UserFactory.with('addresses', 1).makeStubbed()

    const response = await client.post(route('UsersController.store')).json({
      name: user.name,
      cpf: user.cpf,
      email: 'invalidemail.com',
      password: user.password,
      zipCode: user.addresses[0].zipCode,
      state: user.addresses[0].state,
      city: user.addresses[0].city,
      street: user.addresses[0].street,
      district: user.addresses[0].district,
      number: user.addresses[0].number,
      complement: user.addresses[0].complement,
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'email',
          field: 'email',
          message: 'email field should be a valid email',
        },
      ],
    })
  })

  test('should create new user with correct body content', async ({ client, route }) => {
    const user = await UserFactory.with('addresses', 1).makeStubbed()

    const response = await client.post(route('UsersController.store')).json({
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      password: user.password,
      zipCode: user.addresses[0].zipCode,
      state: user.addresses[0].state,
      city: user.addresses[0].city,
      street: user.addresses[0].street,
      district: user.addresses[0].district,
      number: user.addresses[0].number,
      complement: user.addresses[0].complement,
    })

    response.assertStatus(200)
    response.assertBodyContains({ Object })
  })

  test('should authenticate user', async ({ client, route }) => {
    const response = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    response.assertStatus(200)
    response.assertBodyContains({ Object })
  })

  test('should not authenticate user', async ({ client, route }) => {
    const response = await client.post(route('AuthController.login')).json({
      email: 'invalidemail@email.com',
      password: 'secret1',
    })

    response.assertStatus(401)
    response.assertBodyContains({ message: 'Invalid credentials' })
  })

  test('should test if user is authenticated', async ({ client, route }) => {
    const login = await client.post(route('AuthController.login')).json({
      email: 'admin@email.com',
      password: 'secret',
    })

    const token = login.body().token.token

    const response = await client.get(route('RolesController.index')).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ Object })
  })

  test('should test if user is not authenticated', async ({ client, route }) => {
    const response = await client.get(route('RolesController.index'))

    response.assertStatus(401)
    response.assertBodyContains({
      errors: [
        {
          message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access',
        },
      ],
    })
  })
})
