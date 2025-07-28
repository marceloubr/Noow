function sendNotification(userId, title, body) {
  console.log(`Enviando notificação para o usuário ${userId}:`);
  console.log(`  Título: ${title}`);
  console.log(`  Corpo: ${body}`);
  // Em um app real, aqui seria a chamada para o Firebase Admin SDK
}

module.exports = { sendNotification };
