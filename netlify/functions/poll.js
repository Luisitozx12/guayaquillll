exports.handler = async (event) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;

  const params = event.queryStringParameters || {};
  const offset = parseInt(params.offset || '0');

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset + 1}&timeout=5`,
    );
    const data = await res.json();

    if (!data.ok || !data.result.length) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, action: null, update_id: offset }),
      };
    }

    for (const update of data.result) {
      const cb = update.callback_query;
      if (!cb) continue;

      // Responder al callback para quitar el "reloj" en Telegram
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id }),
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          action: cb.data,
          update_id: update.update_id,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, action: null, update_id: offset }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
