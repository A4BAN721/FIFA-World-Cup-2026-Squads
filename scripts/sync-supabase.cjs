const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const watchedFiles = [
  path.join(rootDir, "lib", "world-cup-data.ts"),
  path.join(rootDir, "lib", "match-fixtures.ts"),
  path.join(rootDir, "lib", "jersey-numbers.json"),
];

let debounceTimer;
let isSeeding = false;
let pendingSeed = false;

function runSeed(reason) {
  if (isSeeding) {
    pendingSeed = true;
    return;
  }

  isSeeding = true;
  console.log(`\nSyncing Supabase database (${reason})...`);

  const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "db:seed"], {
    cwd: rootDir,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    isSeeding = false;

    if (code === 0) {
      console.log("Supabase database is in sync.");
    } else {
      console.error(`Supabase sync failed with exit code ${code}.`);
    }

    if (pendingSeed) {
      pendingSeed = false;
      runSeed("queued change");
    }
  });
}

function scheduleSeed(filePath) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runSeed(path.relative(rootDir, filePath));
  }, 750);
}

for (const filePath of watchedFiles) {
  fs.watch(filePath, { persistent: true }, () => {
    scheduleSeed(filePath);
  });
}

console.log("Watching data files for Supabase sync:");
for (const filePath of watchedFiles) {
  console.log(`- ${path.relative(rootDir, filePath)}`);
}

runSeed("initial sync");
