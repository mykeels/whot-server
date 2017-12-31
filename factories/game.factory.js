function GameFactory() {
    let count = 0
    const games = {}

    this.create = (game) => {
        const id = ++count
        games[id] = game
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