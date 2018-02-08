const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const Game = require('whot')
const GameFactory = require('../factories/game.factory')
const logger = require('../logger')('socket.route.js')

const Events = {
    GAME_CREATE: 'game:create',
    GAME_START: 'game:start',
    PLAYER_HAND: 'player:hand',
    PLAY: 'player:play',
    TURN_SWITCH: 'turn:switch',
    MARKET_PICK: 'market:pick',
    HOLD_ON: 'turn:holdon',
    PICK_TWO: 'turn:pick-two',
    PICK_THREE: 'turn:pick-three',
    SUSPENSION: 'turn:suspension',
    GENERAL_MARKET: 'turn:general-market'
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

const playTurn = (game) => {
    const player = game.turn.next()
    if (player.canPlay()) {
        player.socket.json({ message: Events.TURN_SWITCH })
    }
    else {
        //check that player can match the move used last (NOT to be used for general market)
        if (player.toPick > 1 && player.canMatchMove()) {
            player.socket.json({ message: Events.TURN_SWITCH })
        }
        else {
            //pick cards from the market and switch to the next player
            player.pick()
            player.socket.json({ message: Events.PLAYER_HAND, hand: player.hand() })
            game.turn.switch()
            playTurn(game)
        }
    }
}

const listenAndInformPlayers = (instance) => {
    const game = instance.game;

    const playerSelectorFn = (({ id, toPick, turn }) => ({ id, toPick, turn }))

    game.emitter.on(Events.HOLD_ON, (players) => {
        instance.sockets.players.broadcast({ message: Events.HOLD_ON, player: playerSelectorFn(player) });
    });

    game.emitter.on(Events.PICK_TWO, (players) => {
        instance.sockets.players.broadcast({ message: Events.PICK_TWO, player: playerSelectorFn(player) });
    });

    game.emitter.on(Events.PICK_THREE, (player) => {
        instance.sockets.players.broadcast({ message: Events.PICK_THREE, player: playerSelectorFn(player) });
    });

    game.emitter.on(Events.SUSPENSION, (players) => {
        instance.sockets.players.broadcast({ message: Events.SUSPENSION, players: players.map(playerSelectorFn) });
    });

    game.emitter.on(Events.GENERAL_MARKET, (players) => {
        instance.sockets.players.broadcast({ message: Events.GENERAL_MARKET, players: players.map(playerSelectorFn) });
    });
}

module.exports = (app, factory = new GameFactory()) => {
    expressWs(app)
    
    factory.create(new Game({ noOfPlayers: 4 })) //ONLY FOR TESTS

    app.ws('/game/:id', (ws, req) => {
        extendWs(ws)

        try {
            const id = req.params.id 
            const instance = factory.get(id)
            if (instance) {
                const game = instance.game

                /**
                 * ws.id is player id
                 * ws.type is player type
                 */
                
                if (!(ws.id && ws.type)) {
                    if (instance.sockets.players.length < game.turn.count() && instance.sockets.players.indexOf(ws) < 0) {
                        ws.id = instance.sockets.players.length + 1
                        ws.type = 'player'
                        instance.sockets.players.push(ws)
                        game.turn.all((player) => {
                            if (!player.socket) {
                                player.socket = instance.sockets.players.find((socket) => socket.id === player.id)
                            }
                        })
                    }
                    else {
                        ws.id = instance.sockets.listeners.length + 1
                        ws.type = 'listener'
                        instance.sockets.listeners.push(ws)
                    }
                }

                //onopen
                ws.json(Object.assign({ id, message: Events.GAME_CREATE, playerId: ws.id, type: ws.type }, instance.sockets.stats()))

                //start game
                if (instance.sockets.players.length === game.turn.count() && instance.sockets.listeners.length === 0) {
                    instance.sockets.broadcast({ message: Events.GAME_START, pile: game.pile.top() })
                    game.turn.all((player) => {
                        player.socket.json({ message: Events.PLAYER_HAND, hand: player.hand() })
                    })
                    
                    playTurn(game)
                }

                // Listen for events and inform players about certain game events
                listenAndInformPlayers(instance);
        
                //onmessage
                ws.on('message', (message = '') => {
                    const messageData = JSON.parse(message)
                    switch (messageData.message) {
                        case Events.PLAY:
                            if (game.turn.next().id === ws.id) {
                                const player = game.turn.next()
                                const cardIndex = messageData.index
                                const iNeed = messageData.iNeed
                                if (cardIndex >= 0 && cardIndex < player.hand().length) {
                                    if (game.pile.top().matches(player.hand()[cardIndex]) || iNeed) {
                                        const card = player.play(cardIndex, iNeed)
                                        if (card) {
                                            instance.sockets.broadcast({ message: Events.PLAY, id: ws.id, card }, ws) //broadcast to all except current ws
                                            ws.json({ message: Events.PLAYER_HAND, hand: player.hand() })
                                            game.turn.execute(game.pile.top())
                                            setTimeout(() => playTurn(game), 1000)
                                        }
                                        else {
                                            errorThrow('error:could-not-play-card:' + cardIndex, ws)
                                            setTimeout(() => ws.json({ message: Events.TURN_SWITCH }), 1000)
                                        }
                                    }
                                    else {
                                        errorThrow('error:card-not-match-pile:' + cardIndex, ws)

                                        setTimeout(() => {
                                            ws.json({ message: 'pile:top', card: game.pile.top() })
                                            ws.json({ message: Events.TURN_SWITCH })
                                        }, 1000)
                                    }
                                }
                                else {
                                    errorThrow('error:invalid-card-index', ws)
                                }
                            }
                            else {
                                errorThrow('error:player-out-of-turn', ws)
                            }
                        break;
                        case Events.MARKET_PICK:
                            if (game.turn.next().id === ws.id) {
                                setTimeout(() => {
                                    const player = game.turn.next()
                                    ws.json({ message: Events.MARKET_PICK, cards: player.pick() })
                                    ws.json({ message: Events.PLAYER_HAND, hand: player.hand() })
                                    game.turn.switch()
                                    playTurn(game)
                                }, 1000)
                            }
                            else {
                                errorThrow('error:player-out-of-turn', ws)
                            }
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