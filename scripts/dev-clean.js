/* Safe dev cache cleaner for Windows/WSL */
const fs = require('fs');
const path = require('path');

function rmSafe(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('Removed', p);
  } catch (e) {
    console.log('Skip', p, e?.message || e);
  }
}

rmSafe(path.join(process.cwd(), '.next'));
rmSafe(path.join(process.cwd(), 'node_modules', '.cache'));