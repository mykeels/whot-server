const express = require('express')
const router = express.Router()
const Game = require('whot')
const GameFactory = require('../factories/game.factory')
const resStatus = require('express-res-status')

router.use(resStatus())

const noOfPlayersMandatoryFilter = (req, res, next) => {
    if (req.method === 'POST') {
        const noOfPlayers = req.body.noOfPlayers
        if (!noOfPlayers || !Number(noOfPlayers) || Number(noOfPlayers) === 1) {
            return res.badRequest({ message: 'invalid property: "noOfPlayers" must be a number > 1' })
        }
    }
    next()
}

module.exports = (factory = new GameFactory()) => {
    router.get('/', (req, res, next) => {
        return res.json(factory.games())
    })

    router.get('/:id', (req, res, next) => {
        const id = Number(req.params.id)
        try {
            return res.json(factory.game(id))
        }
        catch (err) {
            if (err.status) return res.status(err.status).send(err.message)
            return res.status(500).send(err)
        }
    })

    router.post('/', noOfPlayersMandatoryFilter)
    router.post('/', (req, res, next) => {
        const noOfPlayers = req.body.noOfPlayers
        return res.json(factory.create(new Game({ noOfPlayers })))
    })
    return router
}