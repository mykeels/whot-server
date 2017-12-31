function GameFactory() {
    const count = 0
    const games = {}

    this.create = (game) => {
        const id = ++this.count
        games[id] = game
        return id
    }

    this.get = (id) => {
        return games[id]
    }

    this.exists = (id) => {
        return !!games[id]
    }
    
    this.count = () => count


}

module.exports = GameFactory