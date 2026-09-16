const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace Hex
  content = content.replace(/#0a84ff/g, '#FFD600');
  
  // Replace Tailwind blue
  content = content.replace(/blue-400/g, 'yellow-400');
  content = content.replace(/blue-500/g, 'yellow-400');
  content = content.replace(/blue-600/g, 'yellow-500');
  content = content.replace(/blue-700/g, 'yellow-600');
  content = content.replace(/cyan-400/g, 'yellow-200');

  // Replace Tailwind emerald (success states)
  content = content.replace(/emerald-200/g, 'yellow-200');
  content = content.replace(/emerald-300/g, 'yellow-300');
  content = content.replace(/emerald-400/g, 'yellow-400');
  content = content.replace(/emerald-500/g, 'yellow-500');
  content = content.replace(/emerald-600/g, 'yellow-600');
  
  // Replace Tailwind red (error/destructive states)
  content = content.replace(/red-400/g, 'yellow-400');
  content = content.replace(/red-500/g, 'yellow-500');
  content = content.replace(/red-600/g, 'yellow-600');
  
  // Replace Tailwind amber (if any was used)
  content = content.replace(/amber-500/g, 'yellow-500');

  // Replace green (for icons/success)
  content = content.replace(/green-400/g, 'yellow-400');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('./src');
console.log('Done.');
