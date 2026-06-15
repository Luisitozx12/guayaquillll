exports.handler = async (event) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const params = event.queryStringParameters || {};
  const offset = parseInt(params.offset || '0');
  const init = params.init === 'true'; // primer call: limpiar updates viejos

  try {
    // Si es el primer poll (init=true), consumimos todos los updates pendientes
    // para evitar que un botón viejo dispare la acción automáticamente
    if (init) {
      const flush = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1&timeout=0`
      );
      const flushData = await flush.json();
      // Si hay updates, marcamos el último como leído
      if (flushData.ok && flushData.result.length) {
        const lastId = flushData.result[flushData.result.length - 1].update_id;
        // Consumir hasta ese update
        await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastId + 1}&timeout=0`
        );
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ok: true, action: null, update_id: lastId }),
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, action: null, update_id: 0 }),
      };
    }

    // Poll normal
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset + 1}&timeout=5`
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
