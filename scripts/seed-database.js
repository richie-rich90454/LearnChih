/**
 * Seed the LernChih MySQL database with development demo data.
 *
 * Reads connection details from environment variables (matching the backend):
 *   DB_HOST      default: localhost
 *   DB_PORT      default: 3306
 *   DB_USERNAME  default: root
 *   DB_PASSWORD  default: root
 *   DB_NAME      default: lernchih_db
 *
 * The seed file is loaded from:
 *   ../backend/lernchih/src/main/resources/db/seed/V999__dev_seed_data.sql
 *
 * Seeding is skipped if the `users` table already contains rows so the script
 * stays idempotent. Run with --force to seed anyway.
 *
 * Usage:
 *   npm install
 *   node seed-database.js
 *   node seed-database.js --force
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = Number(process.env.DB_PORT || '3306')
const DB_USERNAME = process.env.DB_USERNAME || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || 'root'
const DB_NAME = process.env.DB_NAME || 'lernchih_db'
const FORCE = process.argv.includes('--force')

const SEED_FILE = path.join(
  __dirname,
  '..',
  'backend',
  'lernchih',
  'src',
  'main',
  'resources',
  'db',
  'seed',
  'V999__dev_seed_data.sql'
)

let connection

try {
  connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: true,
  })

  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS count FROM information_schema.tables ` +
      `WHERE table_schema = ? AND table_name = 'users'`,
    [DB_NAME]
  )

  if (rows[0].count === 0) {
    console.error(
      `The schema does not exist in "${DB_NAME}". ` +
        `Start the backend with the dev profile so Flyway can create the schema first.`
    )
    process.exit(1)
  }

  const [countRows] = await connection.execute('SELECT COUNT(*) AS count FROM users')
  if (countRows[0].count > 0 && !FORCE) {
    console.log(`Database "${DB_NAME}" already seeded (${countRows[0].count} users). Skipping.`)
    console.log('Run with --force to re-seed anyway.')
    process.exit(0)
  }

  try {
    await fs.access(SEED_FILE)
  } catch {
    console.log(
      `Seed SQL file not found: ${SEED_FILE}\n` +
        `The Java demo seeder is the supported path for local seeding. ` +
        `Start the backend with app.seed.enabled=true (e.g. --spring.profiles.active=local).`
    )
    process.exit(0)
  }

  const sql = await fs.readFile(SEED_FILE, 'utf8')
  await connection.query(sql)

  const [afterRows] = await connection.execute('SELECT COUNT(*) AS count FROM users')
  console.log(`Seeding complete. Users table now has ${afterRows[0].count} rows.`)
} catch (err) {
  console.error('Failed to seed database:', err.message)
  process.exit(1)
} finally {
  if (connection) await connection.end()
}
