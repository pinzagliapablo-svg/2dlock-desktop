const slug = process.env.UPDATE_REPO || process.env.GITHUB_REPOSITORY || '';
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const cleaned = String(slug).trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
const parts = cleaned.split('/').filter(Boolean);
if (parts.length !== 2) {
  console.error('Errore: imposta UPDATE_REPO="proprietario/nome-repository" oppure usa GitHub Actions.');
  process.exit(1);
}
if (!token) {
  console.error('Errore: GH_TOKEN o GITHUB_TOKEN è necessario per pubblicare la release su GitHub.');
  process.exit(1);
}
console.log(`Pubblicazione configurata per GitHub: ${parts[0]}/${parts[1]}`);
