//1o criar test 
//2o criar passwordHelper
//3o gerar senha e guardar
//4o criar model de usuario
//5o adicionar chamada em api.js
//6o adicionar no construtor de auth receber o model
//7o criar logica na route
//8o adicionar upsert no context e postgresStrategy
//9o adicionar no arquivo postgres.sql o script para criar a tabela

const assert = require('assert')
const api = require('../api')
const Context = require('./../src/db/strategies/base/contextStrategy')
const PostgresDB = require('./../src/db/strategies/postgres/postgresSQLStrategy')
const UserSchema = require('./../src/db/strategies/postgres/schemas/userSchema')

let app = {}
const USER = {
    username: 'rafael',
    password: '321123'
}

const USER_DB = {
    ...USER,
    password: '$2b$04$BWyMLO1FjbeXkfMYGZUaR.Rcv03WJDy/XDryWbfgWm.dkI9AsRVKS'
}


describe('Auth test suite', function () {
    this.beforeAll(async () => {
        app = await api

        const connectionPostgres = await PostgresDB.connect()
        const model = await PostgresDB.defineModel(connectionPostgres, UserSchema)
        const postgresModel = new Context(new PostgresDB(connectionPostgres, model));
        await postgresModel.update(null, USER_DB, true)
    })
    it('deve obter um token', async () => {
        const result = await app.inject({
            method: 'POST',
            url: '/login',
            payload: USER
        });
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 200)
        assert.ok(dados.token.length > 10)
    })

    it('deve retornar não autorizado ao tentar obter um token com login errado', async () => {
        const result = await app.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'rafaelFerreira',
                password: '123'
            }
        });
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 401)
        assert.deepEqual(dados.error, "Unauthorized")
    })
})