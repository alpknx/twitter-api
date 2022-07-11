'use strict'

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/posts/:id/like',
      handler: 'post.like',
      config: {
        policies: ['global::set-entity'],
      },
    },
    {
      method: 'POST',
      path: '/posts/:id/unlike',
      handler: 'post.unlike',
      config: {
        policies: ['global::set-entity'],
      },
    },
  ],
}
