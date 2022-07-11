const { describe, beforeAll, afterAll, it, expect } = require('@jest/globals')
const request = require('supertest')

const { JEST_TIMEOUT } = require('./../helpers')
const { setupStrapi, stopStrapi, grantPrivileges } = require('./../helpers/strapi')
const { createUser, mockUserData } = require('./factory')

jest.setTimeout(JEST_TIMEOUT)

beforeAll(async () => {
  await setupStrapi()
})

afterAll(async () => {
  await stopStrapi()
})

describe('Default User methods', () => {
  let user

  beforeAll(async () => {
    await grantPrivileges(1, [
      'api::post.controllers.post.find',
      'api::comment.controllers.comment.find',
      'plugin::users-permissions.controllers.user.find',
    ])

    user = await createUser()
  })

  it('should allow register users', async () => {
    await request(strapi.server.httpServer)
      .post('/api/auth/local/register')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ ...mockUserData() })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body: { jwt, user } }) => {
        expect(jwt).toBeDefined()
        expect(user).toBeDefined()
        return user
      })
  })

  it('should login user and return jwt token', async () => {
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id })

    await request(strapi.server.httpServer)
      .post('/api/auth/local')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ identifier: user.email, password: mockUserData().password })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(async (data) => {
        expect(data.body.jwt).toBeDefined()
        const verified = await strapi.plugins['users-permissions'].services.jwt.verify(
          data.body.jwt
        )
        expect(data.body.jwt === jwt || !!verified).toBe(true)
      })
  })

  it('should return populated data for users list', async () => {
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id })

    await request(strapi.server.httpServer)
      .get('/api/users?populate=*')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + jwt)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((data) => {
        expect(data.body[0]).toBeDefined()
        expect(data.body[0].id).toBe(user.id)
        expect(data.body[0].username).toBe(user.username)
        expect(data.body[0].posts).toEqual([])
        expect(data.body[0].comments).toEqual([])
        expect(data.body[0].followers).toEqual([])
        expect(data.body[0].followees).toEqual([])
        expect(data.body[0].liked).toEqual([])
      })
  })

  it('should return populated personal data for authenticated user', async () => {
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id })

    await request(strapi.server.httpServer)
      .get('/api/users/me?populate=*')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + jwt)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined()
        expect(data.body.id).toBe(user.id)
        expect(data.body.username).toBe(user.username)
        expect(data.body.posts).toEqual([])
        expect(data.body.comments).toEqual([])
        expect(data.body.followers).toEqual([])
        expect(data.body.followees).toEqual([])
        expect(data.body.liked).toEqual([])
      })
  })
})
