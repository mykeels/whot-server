const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => res.json({ message: 'Whot Server' }))

module.exports = router