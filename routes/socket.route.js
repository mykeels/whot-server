const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const Game = require('whot')
const GameFactory = require('../factories/game.factory')
const logger = require('../logger')('socket.route.js')

const Events = {
    GAME_CREATE: 'game:create'
}

const extendWs = require('../prototypes/ws.prototype')

const wsErrorHandler = (err) => {
    if (err) logger.error("ws-error", err)
}

const errorThrow = (err, ws) => {
    logger.error(err)
    if (ws) {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                error: err
            }), wsErrorHandler)
        }
    }
}

module.exports = (app, factory = new GameFactory()) => {
    expressWs(app)

    app.ws('/game/:id', (ws, req) => {
        extendWs(ws)

        try {
            const id = req.params.id 
            const instance = factory.get(id)
            if (instance) {
                const game = instance.game
                
                if (!(ws.id && ws.type)) {
                    if (instance.sockets.players.length < game.turn.count() && instance.sockets.players.indexOf(ws) < 0) {
                        ws.id = instance.sockets.players.length + 1
                        ws.type = 'player'
                        instance.sockets.players.push(ws)
                    }
                    else {
                        ws.id = instance.sockets.listeners.length + 1
                        ws.type = 'listener'
                        instance.sockets.listeners.push(ws)
                    }
                }

                //onopen
                ws.json(Object.assign({ id, message: Events.GAME_CREATE, playerId: ws.id, type: ws.type }, instance.sockets.stats()))
        
                //onmessage
                ws.on('message', (message = '') => {
                    const messageData = JSON.parse(message)
                    switch (messageData.message) {
                        case '':
                        break;
                    }
                })
            }
            else {
                errorThrow('could not find a game with id "' + id + '"', ws)
            }
        }
        catch (ex) {
            logger.error(ex)
        }
    })
}