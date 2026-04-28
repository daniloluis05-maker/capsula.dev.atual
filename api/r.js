// api/r.js — Vercel Serverless Function
// URL compartilhada: /api/r?token=xxx
// Gera OG tags personalizadas (nome da pessoa) e redireciona para a página real.

const SUPABASE_URL = 'https://dfnmofzbpdmnvlyowtmp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbm1vZnpicGRtbnZseW93dG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjQ4MzIsImV4cCI6MjA5MTE0MDgzMn0.KXcRmhpPFwpQGXkYIVjXPJvMh5w1KpIlZiwyIEUBrvU';
const BASE_URL    = 'https://capsula-dev-atualizado.vercel.app';

const NOMES = {
  disc:    'DISC',
  soar:    'SOAR',
  ikigai:  'Ikigai',
  ancoras: 'Âncoras de Carreira',
  johari:  'Janela de Johari',
  bigfive: 'Big Five',
  pearson: 'Pearson-Marr',
  tci:     'TCI',
};

const SUBS = {
  disc:    'Perfil Comportamental',
  soar:    'Análise Estratégica Pessoal',
  ikigai:  'Propósito de Vida e Carreira',
  ancoras: 'Motivadores Profissionais',
  johari:  'Autoconhecimento e Feedback',
  bigfive: 'Os Cinco Grandes Traços',
  pearson: 'Estilos de Pensamento',
  tci:     'Temperamento e Caráter',
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  const token = (req.query.token || '').trim();
  if (!token) return res.redirect(302, '/');

  let matriz = 'disc';
  let nome   = '';

  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/remote_links?token=eq.${encodeURIComponent(token)}&select=matriz,etiqueta&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await resp.json();
    if (Array.isArray(rows) && rows[0]) {
      matriz = rows[0].matriz || 'disc';
      const etiq = rows[0].etiqueta || '';
      // Etiqueta pode ser "João Silva — Processo Seletivo" ou só "João Silva"
      nome = etiq.split(/\s[—\-]\s/)[0].trim();
    }
  } catch (_) { /* usa fallback */ }

  const matrizNome = NOMES[matriz] || matriz.toUpperCase();
  const sub        = SUBS[matriz]  || 'Avaliação de Perfil';
  const imageUrl   = `${BASE_URL}/og-${matriz}.png`;
  const targetUrl  = `/${matriz}.html?token=${encodeURIComponent(token)}`;

  const title = nome
    ? `${matrizNome} | Sistema Gnosis — Convite para ${nome}`
    : `Avaliação ${matrizNome} — Sistema Gnosis`;

  const desc = nome
    ? `Você foi convidado para responder o ${matrizNome}. Descubra seu ${sub.toLowerCase()} agora.`
    : `Você foi convidado para a avaliação ${matrizNome} — ${sub}. Responda e descubra seu perfil.`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:type" content="website">
<meta property="og:url" content="${BASE_URL}/api/r?token=${encodeURIComponent(token)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(imageUrl)}">
<meta http-equiv="refresh" content="0;url=${esc(targetUrl)}">
<title>${esc(title)}</title>
</head>
<body>
<script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(html);
};
