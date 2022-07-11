module.exports = async (ctx, config, { strapi }) => {
  const {
    user,
    route: {
      info: { apiName },
    },
  } = ctx.state;

  const entity = await strapi.db.query(`api::${apiName}.${apiName}`).findOne({
    where: { id: ctx.params.id },
    populate: { author: true },
  });

  return entity?.author?.id === user.id;
};
