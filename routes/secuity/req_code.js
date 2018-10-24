var send2fa = require('../../libs/send2fa');
module.exports = async (req, res) => {
  if(req.user && req.body.phone) {
    try {
      res.json(await send2fa(req.user.id, req.body.phone, req.ip))
    } catch(e) {
      res.json(e)
    }
  }
}
