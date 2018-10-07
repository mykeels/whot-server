const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const GameFactory = require('./factories/game.factory')
const factory = new GameFactory()
const indexRoute = require('./routes/index.route')
const gameRoute = require('./routes/game.route')(factory)
const socketRoute = require('./routes/socket.route')

app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(require('./utils/cross-domain'))

app.use('/', indexRoute)
app.use('/games/', gameRoute)

socketRoute(app, factory)

app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.send(err.toString())
})

if (require.main === module) {
    var listener = app.listen(process.env.PORT || 8800, function(){
        console.log('Listening on port ' + listener.address().port)
    })
}
  
module.exports = app