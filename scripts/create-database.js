/**
 * Create the LernChih MySQL database if it does not already exist.
 *
 * Reads connection details from environment variables (matching the backend):
 *   DB_HOST      default: localhost
 *   DB_PORT      default: 3306
 *   DB_USERNAME  default: root
 *   DB_PASSWORD  default: root
 *   DB_NAME      default: lernchih_db
 *
 * Usage:
 *   npm install
 *   node create-database.js
 */

import mysql from 'mysql2/promise'

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = Number(process.env.DB_PORT || '3306')
const DB_USERNAME = process.env.DB_USERNAME || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || 'root'
const DB_NAME = process.env.DB_NAME || 'lernchih_db'

let connection

try {
  connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    charset: 'utf8mb4',
  })

  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` ` +
      `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )

  const [rows] = await connection.execute(
    `SELECT DEFAULT_CHARACTER_SET_NAME AS charset, ` +
      `DEFAULT_COLLATION_NAME AS collation ` +
      `FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
    [DB_NAME]
  )

  console.log(`Database "${DB_NAME}" is ready.`, rows[0])
} catch (err) {
  console.error('Failed to create database:', err.message)
  process.exit(1)
} finally {
  if (connection) await connection.end()
}
