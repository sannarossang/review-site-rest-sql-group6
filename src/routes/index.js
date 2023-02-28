const express = require('express')
const router = express.Router()

const authRoutes = require('./authRoutes')
const userRoutes = require('../routes/userRoutes')
const reviewRoutes = require('../routes/reviewRoutes')
const tailorshopRoutes = require('../routes/tailorshopRoutes')

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/reviews', reviewRoutes)
router.use('/tailorshops', tailorshopRoutes)

module.exports = router
