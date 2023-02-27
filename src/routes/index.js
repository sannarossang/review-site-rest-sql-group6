const express = require('express')
const router = express.Router()

const authRoutes = require('./authRoutes')
const userRoutes = require('./userRoutes')
const todoListRoutes = require('./listRoutes')
const todoRoutes = require('./todoRoutes')

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/lists', todoListRoutes)
router.use('/todos', todoRoutes)

module.exports = router
