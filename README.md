# Whot Server

An HTTP server serving a REST API for hosting Whot! games.

## Setup and Usage

```bash
npm install
npm start
```

## Routes

The following routes are available:

| Category | Verb | Url | Description |
| --- | --- | --- | --- | --- |
| Default | GET/POST | ~/ | Welcomes you to the API |
| Games | GET | ~/games | Lists games |
| Games | POST | ~/games | Creates a new Game |
| Game | WebSockets | ~/game/:id | Participate in a Game |

## Socket Signals

| Event | Originator | Parameters | Description |
| --- | --- | --- | --- | --- |
| player:play | Client | index, iNeed | Player selects a card by index to play |
| market:pick | Client | -- | Pleyer opts to pick from market |
| player:hand | Server | hand | Shows Player's hand (cards) |
| game:start | Server | pile | Start Game |
| turn:switch | Server | -- | Tell Player it's his turn |
| pile:top | Server | pile | Show card at the top of the pile |
| error:player-out-of-turn | Server | -- | player is out of turn |
| error:invalid-card-index | Server | -- | card index played is our of bounds |
| error:card-not-match-pile | Server | -- | card played doesn't match card at the top of the pile |
| error:could-not-play-card | Server | -- | Hopefully, this never happens, but the card could not be played for some reason |

## Test Mock Script

Copy and paste this in your browser console:

```js
(() => {
  const makeRandomPlay = (ws) => {
    if (ws.canPlay()) {
      const compatibles = ws.hand.filter(card => card.matches(ws.pile))
      const compatibleCardIndex = ws.hand.indexOf(compatibles[Math.floor(Math.random() * compatibles.length)])
      let iNeed = null
      if (ws.hand[compatibleCardIndex].shape === 'Whot') {
        const eligibleCards = ws.hand.filter(card => card.shape != 'Whot')
        iNeed = (eligibleCards[Math.floor(Math.random() * eligibleCards.length)] || {}).shape || 'Circle'
      }
      ws.send(JSON.stringify({ message: 'player:play', index: compatibleCardIndex, card: ws.hand[compatibleCardIndex], iNeed }))
    }
    else {
      ws.send(JSON.stringify({ message: 'market:pick' }))
    }
  }

  const setupCard = (c) => {
    c.matches = (card = new Card()) => {
      return (c.shape === 'Whot') ||
        (card.shape === 'Whot' && c.iNeed && (c.iNeed === card.shape)) || (card.shape === c.shape) || (card.value === c.value)
    }
    return c
  }

  var wss = [1, 2, 3, 4].map(function () {
    const ws = new WebSocket('ws://localhost:8800/game/1')
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        switch(data.message) {
        case 'player:hand':
          ws.hand = data.hand.map(setupCard)
          break;
        case 'game:start':
          ws.pile = setupCard(data.pile)
          break;
        case 'turn:switch':
          makeRandomPlay(ws)
          break;
        case 'player:play':
        case 'pile:top':
          ws.pile = data.card
          break;
        }
      }
      catch (ex) {
        console.error(ex)
      }
    }
    ws.onerror = (err) => console.error(err)
    ws.onopen = () => {
      console.log('WebSocket connection opened')
      ws.send(JSON.stringify({ message: 'hello' }))
    }
    ws.canPlay = () => (ws.hand.findIndex(card => card.matches(ws.pile)) >= 0)
        return ws
    })

    return wss
})()
```