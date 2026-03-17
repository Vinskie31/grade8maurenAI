// ✅ PASTE YOUR ANTHROPIC API KEY BELOW — get it free at https://console.anthropic.com/settings/keys
const API_KEY = "sk-ant-PASTE_YOUR_KEY_HERE";

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Use hardcoded key OR fall back to environment variable if set
  const apiKey = API_KEY.startsWith("sk-ant-PASTE") 
    ? process.env.ANTHROPIC_API_KEY 
    : API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: { 
          type: 'config_error', 
          message: 'API key not configured. Open netlify/functions/chat.js and paste your Anthropic key on line 2.' 
        } 
      })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 1200,
        system: body.system,
        messages: body.messages
      })
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: { type: 'proxy_error', message: err.message } })
    };
  }
};
