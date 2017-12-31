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
        games[id].sockets.stats = () => ({ players: games[id].sockets.players.length, listeners: games[id].sockets.listeners.length })
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