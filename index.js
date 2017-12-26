const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const Game = require('whot')

app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.send(err)
})

var listener = app.listen(process.env.PORT || 8800, function(){
    console.log('Listening on port ' + listener.address().port)
})
  
module.exports = app