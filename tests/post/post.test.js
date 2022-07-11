const qs = require('qs')
const request = require('supertest')
const { JEST_TIMEOUT } = require('./../helpers')
const { setupStrapi, stopStrapi, grantPrivileges } = require('./../helpers/strapi')
const { createUser } = require('../user/factory')
const { createPost } = require('./factory')

jest.setTimeout(JEST_TIMEOUT)

beforeAll(async () => {
  await setupStrapi()
})

afterAll(async () => {
  await stopStrapi()
})

describe('Default post methods', () => {
  let author
  let authorJwt

  beforeAll(async () => {
    author = await createUser()
    authorJwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: author.id })

    await grantPrivileges(1, [
      'api::post.controllers.post.create',
      'api::post.controllers.post.update',
      'api::post.controllers.post.find',
      'api::post.controllers.post.findOne',
      'api::post.controllers.post.delete',

      'api::post.controllers.post.like',
      'api::post.controllers.post.unlike',

      'api::comment.controllers.comment.find',

      'plugin::users-permissions.controllers.user.find',
    ])
  })

  it('should allow get posts with populated data', async () => {
    const post1 = await createPost({ text: 'post1', author: author.id })
    await createPost({ text: 'post2', author: author.id })
    await createPost({ text: 'post3', author: author.id })

    await request(strapi.server.httpServer)
      .get(`/api/posts?populate=*`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${authorJwt}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body: { data } }) => {
        expect(data).toHaveLength(3)
        expect(data[0].id).toBe(post1.id)
        expect(data[0].attributes.text).toBe(post1.text)
        expect(data[0].attributes.author.data.id).toBe(author.id)
        expect(data[0].attributes.comments.data).toEqual([])
        expect(data[0].attributes.likes.data).toEqual([])
      })
  })

  it('should post be created', async () => {
    await request(strapi.server.httpServer)
      .post(`/api/posts?populate=*`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${authorJwt}`)
      .send({ data: { text: 'post 1' } })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body: { data } }) => {
        expect(data.attributes.text).toBe('post 1')
        expect(data.attributes.author.data.id).toBe(author.id)
      })
  })

  it('should post be updated by anyone', async () => {
    const post = await createPost({ text: 'post 1', author: author.id })

    await request(strapi.server.httpServer)
      .put(`/api/posts/${post.id}`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${authorJwt}`)
      .send({ data: { text: 'post 2' } })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body: { data } }) => {
        expect(data.attributes.text).toBe('post 2')
      })
  })

  it('should post be deleted by anyone', async () => {
    const post = await createPost({ text: 'post 1', author: author.id })

    await request(strapi.server.httpServer)
      .delete(`/api/posts/${post.id}`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${authorJwt}`)
      .expect('Content-Type', /json/)
      .expect(200)
  })
})

describe('Likes flow', () => {
  let author
  let authorJwt
  let user
  let userJwt

  beforeAll(async () => {
    await grantPrivileges(1, [
      'api::post.controllers.post.find',
      'api::post.controllers.post.like',
      'api::post.controllers.post.unlike',

      'api::comment.controllers.comment.find',

      'plugin::users-permissions.controllers.user.find',
    ])

    author = await createUser()
    user = await createUser()
    authorJwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: author.id })
    userJwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id })
  })

  it('should like a post as authentificated user', async () => {
    const post = await createPost({ text: 'post 1', author: author.id })

    await request(strapi.server.httpServer)
      .post(`/api/posts/${post.id}/like`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userJwt}`)
      .expect('Content-Type', /json/)
      .expect(200)

    await request(strapi.server.httpServer)
      .get(`/api/posts/${post.id}?populate=*`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userJwt}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body: { data } }) => {
        expect(data.attributes.likes.data[0].id).toBe(user.id)
      })
  })

  it('should unlike a post as authentificated user', async () => {
    const post = await createPost({ text: 'post 1', author: author.id, likes: [user.id] })

    await request(strapi.server.httpServer)
      .post(`/api/posts/${post.id}/unlike`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userJwt}`)
      .expect('Content-Type', /json/)
      .expect(200)

    await request(strapi.server.httpServer)
      .get(`/api/posts/${post.id}?populate=*`)
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${userJwt}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body: { data } }) => {
        expect(data.attributes.likes.data).toEqual([])
      })
  })
})
