const fs = require("node:fs");
const { Client } = require("pg");

function getPostgresSslConfig(connectionString) {
  const url = new URL(connectionString);
  const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

  return localHostnames.has(url.hostname) ? false : { rejectUnauthorized: false };
}

// SECURITY: Load environment variables from process.env first, then .env files.
// Never log or display the values of these variables.
let env = { ...process.env };
const envFilePath = process.env.ENV_FILE_PATH || ".env.local";
try {
  const envFileContent = fs.readFileSync(envFilePath, "utf8");
  const fileEnv = Object.fromEntries(
    envFileContent
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );
  
  // Override file values with actual process.env values (process.env takes priority)
  env = { ...fileEnv, ...process.env };
} catch {
  throw new Error("Failed to load environment configuration. Check your .env file.");
}

async function main() {
  const client = new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 15_000,
    ssl: getPostgresSslConfig(env.DATABASE_URL),
  });

  await client.connect();

  const { rows } = await client.query(`
    select 'table' as kind, tablename as name
    from pg_tables
    where schemaname = 'public'
      and tablename in ('nations', 'squad_players', 'match_fixtures', 'translations')
    union all
    select 'type' as kind, typname as name
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and typname in ('nations', 'squad_players', 'match_fixtures', 'translations')
    order by kind, name;
  `);

  console.log(JSON.stringify(rows, null, 2));
  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
