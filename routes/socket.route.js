const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const Game = require('whot')
const GameFactory = require('../factories/game.factory')

const extendWs = require('../prototypes/ws.prototype')

module.exports = (app, factory = new GameFactory()) => {
    expressWs(app)

    app.ws('/game/:id', (ws, req) => {
        extendWs(ws)

        ws.on('message', (message = '') => {
            ws.json({ id: req.params.id })
        })
    })
}