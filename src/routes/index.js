const express = require("express")
const route = express.Router()

const userRoute=require("./userRoute")
const conversationRoute=require("./conversationRoute")

route.use("/user",userRoute)
route.use("/conversation",conversationRoute)

module.exports = route