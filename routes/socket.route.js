const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const Game = require('whot')
const GameFactory = require('../factories/game.factory')

module.exports = (app, factory = new GameFactory()) => {
    expressWs(app)

    app.ws('/game/:id', (ws, req) => {
        ws.on('message', (message = '') => {
            ws.send('hello ' + req.params.id)
        })
    })
}