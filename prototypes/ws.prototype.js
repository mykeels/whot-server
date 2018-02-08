const logger = require('../logger')('ws.prototype')

module.exports = (ws) => {
    ws.json = function (data) {
        if (ws.readyState == ws.OPEN) {
            if (data) ws.send(JSON.stringify(data))
        }
        else logger.error('cannot send message because ws connection is not OPEN')
    }
}