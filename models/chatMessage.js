/**
 * Created by einavcarmon on 20/06/2017.
 */
const Sequelize = require('sequelize')
module.exports = function (sequelize) {
  const ChatMessage = sequelize.define('chat_message', {
    clientName: Sequelize.TEXT,
    clientId: Sequelize.TEXT,
    text: Sequelize.TEXT
  })

  ChatMessage.associate = function (models) {
    ChatMessage.belongsTo(models.Chat)
  }

  return ChatMessage
}
