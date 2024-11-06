const express = require('express')
const authMiddlewareRoute = require('../middleware/authMiddlewareRoute')
const conversationController = require('../controllers/conversationController')
const router = express.Router()
const uploadImage = require('../utils/uploadImage')

router.use(authMiddlewareRoute)
router.post('/init',conversationController.initiateConversationController)

router.patch('/:id/editPhoto',uploadImage,conversationController.editPhotoConversationController)

module.exports = router