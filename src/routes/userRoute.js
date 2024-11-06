const express = require('express')

const userController = require('../controllers/userController')
const authMiddlewareRoute = require('../middleware/authMiddlewareRoute')
const router = express.Router()


router.route('/')
.post(userController.registerUserController)
.get(authMiddlewareRoute,userController.getAllUserController)

router.use(authMiddlewareRoute)

router.route('/:id')
.get(userController.getUserController)
.patch(userController.updateSettingUserController)

router.route('/:id/status')
.patch(userController.updateStatusUserController)

module.exports = router