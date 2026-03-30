const { Buffer } = require('buffer');

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

  const { fields, fileBase64, fileName, fileType } = body;

  if (!fields) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Champs manquants' }) };
  }

  // Si un fichier est fourni, l'uploader sur tmpfiles.org pour obtenir une URL
  let attachmentUrl = null;
  if (fileBase64 && fileName) {
    try {
      const fileBuffer = Buffer.from(fileBase64, 'base64');
      const boundary = '----FormBoundary' + Date.now();
      const bodyParts = [
        `--${boundary}\r\n`,
        `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
        `Content-Type: ${fileType || 'application/octet-stream'}\r\n\r\n`,
      ];
      const bodyEnd = `\r\n--${boundary}--\r\n`;

      const startBuffer = Buffer.from(bodyParts.join(''));
      const endBuffer = Buffer.from(bodyEnd);
      const fullBody = Buffer.concat([startBuffer, fileBuffer, endBuffer]);

      const uploadResp = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: fullBody
      });
      const uploadData = await uploadResp.json();

      if (uploadData.status === 'success' && uploadData.data && uploadData.data.url) {
        // tmpfiles.org renvoie une page, il faut transformer l'URL pour obtenir le lien direct
        attachmentUrl = uploadData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      }
    } catch(e) {
      console.error('Upload error:', e);
    }
  }

  // Construire les champs Airtable
  const airtableFields = { ...fields };
  if (attachmentUrl) {
    airtableFields.Photo_URL = [{ url: attachmentUrl }];
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
        body: JSON.stringify({ records: [{ fields: airtableFields }] })
      }
    );
    const data = await response.json();
    return { statusCode: response.status, headers, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
