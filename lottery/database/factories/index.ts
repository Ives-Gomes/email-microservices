/* eslint-disable prettier/prettier */
import Factory from '@ioc:Adonis/Lucid/Factory'

import User from 'App/Models/User'
import Address from 'App/Models/Address'
import Game from 'App/Models/Game'
import Bet from 'App/Models/Bet'

export const AddressFactory = Factory.define(Address, ({ faker }) => {
  return {
    zipCode: `${faker.random.numeric(5)}-${faker.random.numeric(3)}`,
    state: faker.address.stateAbbr(),
    city: faker.address.cityName(),
    street: faker.address.street(),
    district: faker.address.streetPrefix(),
    number: faker.address.buildingNumber(),
    complement: faker.lorem.words(10),
  }
}).build()

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    name: faker.name.firstName(),
    cpf: `${faker.random.numeric(3, { allowLeadingZeros: true })}.${faker.random.numeric(3, { allowLeadingZeros: true })}.${faker.random.numeric(3, { allowLeadingZeros: true })}-${faker.random.numeric(2, { allowLeadingZeros: true })}`,
    email: `${faker.random.alphaNumeric(10)}@email.com`,
    password: faker.random.alphaNumeric(5),
  }
})
  .relation('addresses', () => AddressFactory)
  .build()

export const GameFactory = Factory.define(Game, ({ faker }) => {
  return {
    name: faker.name.firstName(),
    description: faker.lorem.lines(),
    range: Number(faker.random.numeric(2)),
    price: Number(faker.random.numeric(1)),
    minAndMaxValue: Number(faker.random.numeric(2)),
    color: `#${faker.random.numeric(6)}`,
  }
})
  .relation('bet', () => BetFactory)
  .build()

export const BetFactory = Factory.define(Bet, ({ faker }) => {
  return {
  }
})
  .relation('user', () => UserFactory)
  .relation('game', () => GameFactory)
  .build()
