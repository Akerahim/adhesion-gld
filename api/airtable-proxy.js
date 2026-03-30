export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const AT_TOKEN = "patHlU3Eo0wAWFnTy.342367a8b0c16b369383297aa6035fbe4454dd0fedb027be20565a4e85a655d5";
  const AT_BASE  = "appmgf5OnBCK2rjHB";
  const AT_TABLE = "Membres";

  const body = req.body;
  if (!body || !body.records) return res.status(400).json({ error: 'Données invalides' });

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
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
