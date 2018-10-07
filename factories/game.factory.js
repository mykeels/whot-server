function GameFactory() {
    let count = 0
    const games = {}

    this.create = (game) => {
        const id = ++count
        games[id] = { 
                        id,
                        game, 
                        sockets: {
                            players: [],
                            listeners: []
                        }
                    }
        const sockets = games[id].sockets
        sockets.stats = () => ({ players: sockets.players.length, listeners: sockets.listeners.length })
        sockets.players.broadcast = (data, exceptWs) => {
            sockets.players.filter(ws => !exceptWs || (ws != exceptWs)).forEach((socket) => {
                socket.json(data)
            })
        }
        sockets.listeners.broadcast = (data, exceptWs) => {
            sockets.listeners.filter(ws => !exceptWs || (ws != exceptWs)).forEach((socket) => {
                socket.json(data)
            })
        }
        sockets.broadcast = (data, exceptWs) => {
            sockets.players.broadcast(data, exceptWs)
            sockets.listeners.broadcast(data, exceptWs)
        }
        return { id, noOfPlayers: game.turn.count() }
    }

    this.get = (id) => {
        return games[id]
    }

    this.game = (id) => {
        console.log('id', id)
        const currentGame = games[id]
        if (currentGame) {
            const { id, game, sockets } = currentGame
            return { 
                id, 
                players: sockets.players.map(p => p.username), 
                listeners: sockets.listeners.map(l => l.username) 
            }
        }
        throw { status: 404, message: 'Game not found' }
    }

    this.exists = (id) => {
        return !!games[id]
    }
    
    this.count = () => count

    this.games = () => {
        return Object.values(games).map(({ id, game, sockets }) => ({ id, ...sockets.stats() }))
    }
}

module.exports = GameFactory