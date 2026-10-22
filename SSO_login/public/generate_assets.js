const fs = require("fs");
const path = require("path");

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else {
      filelist.push(filepath.replace(/\\/g, "/"));
    }
  });
  return filelist;
}

const assets = walk("./"); // or your root folder

const output = `
const CACHE_NAME = "pwa-cache-v3";
const ASSETS = ${JSON.stringify(assets, null, 2)};
`;

fs.writeFileSync("assets.js", output);
console.log("Assets generated");
