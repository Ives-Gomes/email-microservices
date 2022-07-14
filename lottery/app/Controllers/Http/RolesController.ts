import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import Role from 'App/Models/Role'

import StoreValidator from 'App/Validators/Role/StoreValidator'
import UpdateValidator from 'App/Validators/Role/UpdateValidator'

export default class RolesController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    try {
      if (noPaginate) {
        return Role.query().filter(inputs)
      }

      const roles = await Role.query()
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok(roles)
    } catch (error) {
      return response.badRequest({ message: 'Error in roles list', originalError: error.message })
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const roleSecureId = params.id

    try {
      const role = await Role.query().where('secure_id', roleSecureId)

      return response.ok(role)
    } catch (error) {
      return response.notFound({ message: 'Role not found', originalError: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const bodyRole = request.all()

    let roleCreated

    const trx = await Database.beginGlobalTransaction()

    try {
      roleCreated = await Role.create(bodyRole, trx)
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in create role', originalError: error.message })
    }

    let roleFind

    try {
      roleFind = await Role.query().where('id', roleCreated.id)
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find role',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(roleFind)
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const roleSecureId = params.id
    const bodyRole = request.all()

    let roleUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      roleUpdated = await Role.findByOrFail('secure_id', roleSecureId)

      roleUpdated.useTransaction(trx)

      await roleUpdated.merge(bodyRole).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in update role', originalError: error.message })
    }

    let roleFind

    try {
      roleFind = await Role.query().where('id', roleUpdated.id)
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find role',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(roleFind)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const roleSecureId = params.id

    try {
      await Role.query().where('secure_id', roleSecureId).delete()

      return response.ok({ message: 'Role deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'Role not found', originalError: error.message })
    }
  }
}
