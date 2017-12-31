const express = require('express')
const router = express.Router()

require('express-ws')(router)

router.ws('', (ws, req) => {
    ws.on('message', (message = '') => {
        ws.send('hello')
    })
})

module.exports = router