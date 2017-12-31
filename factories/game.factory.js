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
        sockets.players.broadcast = (data) => {
            sockets.players.forEach((socket) => {
                socket.json(data)
            })
        }
        sockets.listeners.broadcast = (data) => {
            sockets.listeners.forEach((socket) => {
                socket.json(data)
            })
        }
        sockets.broadcast = (data) => {
            sockets.players.broadcast(data)
            sockets.listeners.broadcast(data)
        }
        return { id, noOfPlayers: game.turn.count() }
    }

    this.get = (id) => {
        return games[id]
    }

    this.exists = (id) => {
        return !!games[id]
    }
    
    this.count = () => count

    this.games = () => {
        return Object.keys(games)
    }
}

module.exports = GameFactory