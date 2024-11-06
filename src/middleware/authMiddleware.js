const userService = require('../services/userService')
const util = require('util');
const promisify = util.promisify;
const jwt = require('jsonwebtoken')
const translatorNextIO = require('../utils/translatorNextIO')

module.exports= async (socket) => {
    const {token}=socket.handshake.query
 
    if (!token) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_NOT_TOKEN'),
            timestamp: new Date().toISOString()
        })
        socket.disconnect()
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await userService.getUserService(decoded.id);

    if (!currentUser) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_USER_NOT_EXIST'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    socket.userId = currentUser.data._id;
    socket.userName = currentUser.data.name;
}
