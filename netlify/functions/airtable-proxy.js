exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const AT_TOKEN = "patHlU3Eo0wAWFnTy.342367a8b0c16b369383297aa6035fbe4454dd0fedb027be20565a4e85a655d5";
  const AT_BASE  = "appmgf5OnBCK2rjHB";
  const AT_TABLE = "Membres";

  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données invalides' }) };
  }

  if (!body || !body.records) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données invalides' }) };
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(AT_TABLE)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    const data = await response.json();
    return { statusCode: response.status, headers, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
