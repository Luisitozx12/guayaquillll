exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID   = process.env.CHAT_ID;

  try {
    const { text, buttons } = JSON.parse(event.body);

    const body = {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    };

    if (buttons && buttons.length) {
      body.reply_markup = { inline_keyboard: buttons };
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, message_id: data.result?.message_id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
