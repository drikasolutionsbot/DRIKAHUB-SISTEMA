const fs = require('fs');

const d1 = "MTQ4Mzk0MzE5ODg4MjY2NDU3OQ";
const d2 = ".G6zPx8.TeT0RnpEGf6ouol_WSFgSemqJeOKs6ycjuShdw";
const su = "https://krudxivcuygykoswjbbx.supabase.co";
const s1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydWR4aXZjdXlneWtvc3dqYmJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQxMzg5OCwiZXhwIjoyMDg3OTg5ODk4fQ";
const s2 = ".95BPv62QBgVg_036c_n25x2TWbf1jaI_dKQD6ndWRgA";

const envContent = `DISCORD_BOT_TOKEN=${d1}${d2}
SUPABASE_URL=${su}
SUPABASE_SERVICE_ROLE_KEY=${s1}${s2}
`;

fs.writeFileSync('.env', envContent);
console.log('Arquivo .env gerado com sucesso!');
