'use strict'

/**
 * post router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('api::post.post', {
  prefix: '',
  except: [],
  config: {
    find: {},
    findOne: {},
    create: {
      policies: ['global::set-owner'],
    },
    update: {
      policies: ['global::is-owner'],
    },
    delete: {},
  },
})
