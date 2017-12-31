const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const Game = require('whot')
const GameFactory = require('../factories/game.factory')
const logger = require('../logger')('socket.route.js')

const extendWs = require('../prototypes/ws.prototype')

const wsErrorHandler = (err) => {
    if (err) logger.error("ws-error", err)
  }

const errorThrow = (err, ws) => {
    console.error(err)
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
        
                if (instance.sockets.players.length < game.turn.count() && instance.sockets.players.indexOf(ws) < 0) {
                    instance.sockets.players.push(ws)
                }
                else {
                    instance.sockets.listeners.push(ws)
                }

                //onopen
                ws.json(Object.assign({ id }, instance.sockets.stats()))
        
                //onmessage
                ws.on('message', (message = '') => {

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