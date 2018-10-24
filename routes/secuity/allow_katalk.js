module.exports = (req, res) => {
  if(req.user) {
    res.render('/secuity/allow_katalk')
  } else {
    res.redirect('/auth/login')
  }
}
