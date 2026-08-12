// Minimal, dependency-free migration runner: applies every .sql file in
// this folder, in filename order, inside a single transaction each.
// Swap for Prisma/Drizzle migrations later if the team picks an ORM
// (see Open Decisions in the PKB) — this just gets day-one dev unblocked.
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      console.log(`Applying ${file}...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log('Migrations complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
