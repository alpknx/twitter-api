const { NotFoundError } = require('@strapi/utils').errors

/**
 * Pass order as ctx.request.entity forward, otherwise throw 404
 *
 * @param {*} ctx
 * @param {*} config
 * @param {*} { strapi }
 * @returns
 */
module.exports = async (ctx, config, { strapi }) => {
  const {
    route: {
      info: { apiName },
    },
  } = ctx.state

  const entity = await strapi.db.query(`api::${apiName}.${apiName}`).findOne({
    where: { id: ctx.params.id },
    populate: ctx.request.data?.populate ?? true,
  })

  if (!entity) {
    strapi.log.error(`${apiName} not found`)
    throw new NotFoundError(`${apiName} not found`)
  }

  ctx.request.data = {}
  ctx.request.data.entity = entity
  return true
}
