'use strict'

/**
 *  post controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async like(ctx) {
    try {
      const entity = await strapi.service('api::post.post').update(ctx.params.id, {
        data: { likes: [...ctx.request.data.entity.likes, ctx.state.user.id] },
      })

      return this.transformResponse(entity)
    } catch (err) {
      strapi.log.error(err)
      ctx.badRequest()
    }
  },

  async unlike(ctx) {
    try {
      const entity = await strapi.service('api::post.post').update(ctx.params.id, {
        data: {
          likes: ctx.request.data.entity.likes
            .map(({ id }) => id)
            .filter((id) => id !== ctx.state.user.id),
        },
      })

      return this.transformResponse(entity)
    } catch (err) {
      strapi.log.error(err)
      ctx.badRequest()
    }
  },
}))
