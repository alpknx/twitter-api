module.exports = ctx => {
  if (ctx.request.body.author) {
    throw new ValidationError('Author should not be defined');
  }

  const { id } = ctx.state.user;
  ctx.request.body.data.author = id;

  return true;
};
