// Minimal, dependency-free migration runner: applies every .sql file in
// this folder, in filename order, inside a single transaction each.
// Swap for Prisma/Drizzle migrations later if the team picks an ORM
// (see Open Decisions in the PKB) — this just gets day-one dev unblocked.
const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/db");

async function migrate() {
  const dir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await pool.connect();
  try {
    // 1. Start ONE master transaction for all files
    await client.query("BEGIN");
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`Applying ${file}...`);
      // Execute the SQL. If it fails, it throws an error to the outer catch.
      await client.query(sql);
    }
    // 2. Only commit if EVERY single file succeeds
    await client.query("COMMIT");
    console.log("All migrations complete.");
  } catch (err) {
    // 3. Roll back everything if any file breaks
    console.log("Error detected. Rolling back ALL migrations...");
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
