const { exec } = require('child_process');
require('dotenv').config();

console.log('🚀 MyIO Auto-Sync elindult...');
console.log(`📁 Repo path: ${process.cwd()}`);

const username = process.env.GIT_USERNAME || '';
const token = process.env.GIT_TOKEN || '';

let lastCommitHash = '';

function syncWithGithub() {
  console.log(`\n⏱️ Szinkronizálás kezdete...`);
  
  // Előbb pull
  exec('git pull origin main', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Pull hiba: ${error.message}`);
      return;
    }
    if (stdout.trim() && !stdout.includes('Already up to date')) {
      console.log(`📥 GitHub-ról letöltve`);
    }
    
    // Majd check for local changes
    exec('git status --short', (error, stdout) => {
      if (!stdout.trim()) {
        console.log(`✅ Nincs módosítás`);
        return;
      }
      
      console.log(`📤 Módosítások:\n${stdout}`);
      
      exec(`git add . && git commit -m "Auto-sync: ${new Date().toLocaleString('hu-HU')}"`, (error, stdout, stderr) => {
        if (error && !stderr.includes('nothing to commit')) {
          console.error(`❌ Commit hiba`);
          return;
        }
        
        exec('git push origin main', (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Push hiba: ${error.message}`);
            return;
          }
          console.log(`✅ Feltöltve GitHub-ra`);
        });
      });
    });
  });
}

// Sync minden 15 másodpercben
setInterval(syncWithGithub, 5000);

console.log('✅ Szinkronizálás minden 5 másodpercben...\n');

// Első szinkro azonnal
syncWithGithub();
