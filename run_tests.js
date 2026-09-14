const fs = require('fs');
const path = require('path');

const vueFile = path.join(__dirname, 'src/components/ChatWindow.vue');
const content = fs.readFileSync(vueFile, 'utf8');

const vTabRegex = /<v-tab\b[^>]*>([\s\S]*?)<\/v-tab>/g;
let match;
let inTab = false;
while ((match = vTabRegex.exec(content)) !== null) {
  if (match[1].includes('mdi-cog')) {
    inTab = true;
  }
}

const vTabItemRegex = /<v-tab-item\b[^>]*>([\s\S]*?)<\/v-tab-item>/g;
let inTabItem = false;
while ((match = vTabItemRegex.exec(content)) !== null) {
  if (match[1].includes('mdi-cog')) {
    inTabItem = true;
  }
}

if (inTab) {
  console.error("FAIL: mdi-cog icon is still inside <v-tab>");
  process.exit(1);
}

if (!inTabItem) {
  console.error("FAIL: mdi-cog icon is not inside <v-tab-item>");
  process.exit(1);
}

console.log("PASS: mdi-cog icon is correctly inside <v-tab-item>");
process.exit(0);
