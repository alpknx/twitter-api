const isOwner = require('./is-owner');

module.exports = async (ctx, config, { strapi }) => isOwner(ctx, config, { strapi }).then(res => !res);
