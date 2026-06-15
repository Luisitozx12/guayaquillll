exports.handler = async () => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID   = process.env.CHAT_ID;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bot_token_set: !!BOT_TOKEN,
      chat_id_set:   !!CHAT_ID,
      bot_token_preview: BOT_TOKEN ? BOT_TOKEN.substring(0, 8) + '...' : 'NO CONFIGURADO',
      chat_id_preview:   CHAT_ID   ? CHAT_ID.substring(0, 5)  + '...' : 'NO CONFIGURADO',
    }),
  };
};
