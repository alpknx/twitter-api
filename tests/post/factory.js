const mockPostData = (data = {}) => {
  return {
    text: 'Test post text',
    author: null,
    ...data,
  }
}

const createPost = async (data = {}) => {
  return strapi.db.query('api::post.post').create({
    data: {
      ...mockPostData(data),
    },
  })
}

module.exports = {
  mockPostData,
  createPost,
}
