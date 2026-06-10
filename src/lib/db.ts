import { PrismaClient } from '@prisma/client'
import { createClient, type Client } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  libsql: Client | undefined
}

const dbUrl = process.env.DATABASE_URL || "file:./db/custom.db"
const isTurso = dbUrl.startsWith("libsql://") || dbUrl.startsWith("http://") || dbUrl.startsWith("https://")

/**
 * Create a Prisma-like database interface.
 * For Turso: uses @libsql/client directly (no Prisma adapter needed).
 * For local: uses standard PrismaClient with file: SQLite.
 */

// ── libSQL client for Turso ──
let _libsqlClient: Client | null = null

function getLibSqlClient(): Client {
  if (_libsqlClient) return _libsqlClient
  if (globalForPrisma.libsql) {
    _libsqlClient = globalForPrisma.libsql
    return _libsqlClient
  }

  let url = dbUrl
  let authToken = process.env.DATABASE_AUTH_TOKEN

  // Always strip authToken from URL if present to avoid conflicts
  try {
    const u = new URL(url)
    if (u.searchParams.has("authToken")) {
      // Only use URL token if env var is not set
      if (!authToken) {
        authToken = u.searchParams.get("authToken") || undefined
      }
      u.searchParams.delete("authToken")
      url = u.toString()
    }
  } catch {
    // URL parsing failed, pass as-is
  }

  console.log(`[DB] Connecting to Turso: ${url.substring(0, 60)}... (auth: ${authToken ? 'yes' : 'no'})`)
  const client = createClient({ url, authToken })
  _libsqlClient = client
  if (process.env.NODE_ENV !== 'production') globalForPrisma.libsql = client
  console.log("[DB] Using libSQL client for Turso")
  return client
}

// ── Prisma client for local SQLite ──
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Unified database interface that works with both Turso and local SQLite.
 * Returns PrismaClient for local, or a compatible wrapper for Turso.
 */
export const db = isTurso
  ? createTursoDbProxy()
  : prisma

/**
 * Create a Proxy that mimics the PrismaClient interface but uses libSQL.
 */
function createTursoDbProxy() {
  const client = getLibSqlClient()

  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$executeRaw' || prop === '$executeRawUnsafe' || prop === '$queryRaw' || prop === '$queryRawUnsafe') {
        return async (...args: unknown[]) => {
          const sql = typeof args[0] === 'string' ? args[0] as string : args[1] as string
          const params = Array.isArray(args[1]) ? args[1] : (Array.isArray(args[2]) ? args[2] : [])
          if (params.length > 0) {
            return client.execute({ sql, args: params })
          }
          return client.execute(sql)
        }
      }

      // Model access
      if (prop === 'readingBooking') return createModelProxy(client, 'ReadingBooking')
      if (prop === 'crystalOrder') return createModelProxy(client, 'CrystalOrder')
      if (prop === 'membership') return createModelProxy(client, 'Membership')
      if (prop === 'newsletterSubscriber') return createModelProxy(client, 'NewsletterSubscriber')
      if (prop === 'settings') return createSettingsProxy(client)
      if (prop === 'siteContent') return createSiteContentProxy(client)
      if (prop === 'student') return createModelProxy(client, 'Student')
      if (prop === 'studentEnrollment') return createModelProxy(client, 'StudentEnrollment')
      if (prop === 'courseContent') return createModelProxy(client, 'CourseContent')

      // $transaction support
      if (prop === '$transaction') {
        return async (fns: Array<() => Promise<unknown>>) => {
          const results = []
          for (const fn of fns) {
            results.push(await fn())
          }
          return results
        }
      }

      return undefined
    }
  })
}

function createModelProxy(client: Client, tableName: string) {
  return new Proxy({} as never, {
    get(_target, prop) {
      if (prop === 'findMany') {
        return async (args?: { orderBy?: Record<string, string>; where?: Record<string, unknown>; select?: Record<string, boolean> }) => {
          let sql = `SELECT * FROM ${tableName}`
          const params: unknown[] = []

          if (args?.where) {
            const conditions: string[] = []
            for (const [key, value] of Object.entries(args.where)) {
              if (value === undefined || value === null) continue
              if (typeof value === 'object' && !Array.isArray(value)) {
                // Handle { contains, equals, etc }
                for (const [op, val] of Object.entries(value as Record<string, unknown>)) {
                  if (op === 'contains' || op === 'equals') {
                    conditions.push(`${key} LIKE ?`)
                    params.push(val)
                  }
                }
              } else {
                conditions.push(`${key} = ?`)
                params.push(value)
              }
            }
            if (conditions.length > 0) {
              sql += ` WHERE ${conditions.join(' AND ')}`
            }
          }

          if (args?.orderBy) {
            const [[field, dir]] = Object.entries(args.orderBy)
            sql += ` ORDER BY ${field} ${dir === 'desc' ? 'DESC' : 'ASC'}`
          } else {
            sql += ` ORDER BY createdAt DESC`
          }

          const result = await client.execute({ sql, args: params })
          return result.rows.map(mapRowToJs)
        }
      }

      if (prop === 'findUnique') {
        return async (args: { where: Record<string, string> }) => {
          const [[key, value]] = Object.entries(args.where)
          const result = await client.execute({
            sql: `SELECT * FROM ${tableName} WHERE ${key} = ?`,
            args: [value]
          })
          return result.rows.length > 0 ? mapRowToJs(result.rows[0]) : null
        }
      }

      if (prop === 'findFirst') {
        return async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> }) => {
          let sql = `SELECT * FROM ${tableName}`
          const params: unknown[] = []

          if (args?.where) {
            const conditions: string[] = []
            for (const [key, value] of Object.entries(args.where)) {
              if (value === undefined || value === null) continue
              conditions.push(`${key} = ?`)
              params.push(value)
            }
            if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`
          }

          if (args?.orderBy) {
            const [[field, dir]] = Object.entries(args.orderBy)
            sql += ` ORDER BY ${field} ${dir === 'desc' ? 'DESC' : 'ASC'}`
          } else {
            sql += ` ORDER BY createdAt DESC`
          }
          sql += ` LIMIT 1`

          const result = await client.execute({ sql, args: params })
          return result.rows.length > 0 ? mapRowToJs(result.rows[0]) : null
        }
      }

      if (prop === 'create') {
        return async (args: { data: Record<string, unknown> }) => {
          const data = args.data
          const cols = Object.keys(data)
          const placeholders = cols.map(() => '?').join(', ')
          const values = cols.map(k => {
            const v = data[k]
            // Prisma sends Date objects; convert to ISO string for SQLite
            if (v instanceof Date) return v.toISOString()
            if (ArrayBuffer.isView(v)) return new TextDecoder().decode(v)
            return v
          })

          const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`
          await client.execute({ sql, args: values })

          // Return the created record
          const id = data.id
          if (id) {
            const result = await client.execute({
              sql: `SELECT * FROM ${tableName} WHERE id = ?`,
              args: [id as string]
            })
            return result.rows.length > 0 ? mapRowToJs(result.rows[0]) : data
          }
          return data
        }
      }

      if (prop === 'update') {
        return async (args: { where: Record<string, string>; data: Record<string, unknown> }) => {
          const [[key, value]] = Object.entries(args.where)
          const data = args.data
          const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
          const values = Object.values(data).map(v => {
            if (v instanceof Date) return v.toISOString()
            return v
          })

          const sql = `UPDATE ${tableName} SET ${sets} WHERE ${key} = ?`
          await client.execute({ sql, args: [...values, value] })

          const result = await client.execute({
            sql: `SELECT * FROM ${tableName} WHERE ${key} = ?`,
            args: [value]
          })
          return result.rows.length > 0 ? mapRowToJs(result.rows[0]) : null
        }
      }

      if (prop === 'delete') {
        return async (args: { where: Record<string, string> }) => {
          const [[key, value]] = Object.entries(args.where)
          const result = await client.execute({
            sql: `SELECT * FROM ${tableName} WHERE ${key} = ?`,
            args: [value]
          })
          await client.execute({
            sql: `DELETE FROM ${tableName} WHERE ${key} = ?`,
            args: [value]
          })
          return result.rows.length > 0 ? mapRowToJs(result.rows[0]) : null
        }
      }

      if (prop === 'count') {
        return async (args?: { where?: Record<string, unknown> }) => {
          let sql = `SELECT COUNT(*) as count FROM ${tableName}`
          const params: unknown[] = []

          if (args?.where) {
            const conditions: string[] = []
            for (const [key, value] of Object.entries(args.where)) {
              if (value === undefined || value === null) continue
              conditions.push(`${key} = ?`)
              params.push(value)
            }
            if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`
          }

          const result = await client.execute({ sql, args: params })
          return Number(result.rows[0]?.count || 0)
        }
      }

      return undefined
    }
  })
}

/**
 * Specialized proxy for Settings model — uses key/value pairs.
 * Settings are stored as JSON strings in the `value` column.
 * Key "form_toggles" stores the form enabled/disabled map.
 * Key "pause_message" stores the custom pause message.
 */
function createSettingsProxy(client: Client) {
  return {
    findFirst: async () => {
      const [formsRow, msgRow] = await Promise.all([
        client.execute({ sql: `SELECT value FROM Settings WHERE key = ?`, args: ['form_toggles'] }),
        client.execute({ sql: `SELECT value FROM Settings WHERE key = ?`, args: ['pause_message'] }),
      ])

      let forms: Record<string, boolean> = {}
      try {
        if (formsRow.rows.length > 0) {
          forms = JSON.parse(formsRow.rows[0].value as string)
        }
      } catch {}

      let pauseMessage = "Fer se encuentra en pausa temporal. ¡Pronto volvemos!"
      if (msgRow.rows.length > 0) {
        pauseMessage = msgRow.rows[0].value as string
      }

      return { id: 'singleton', forms, pauseMessage } as any
    },
    update: async (args: { where: Record<string, string>; data: Record<string, unknown> }) => {
      const data = args.data

      if (data.forms !== undefined) {
        const value = JSON.stringify(data.forms)
        const existing = await client.execute({ sql: `SELECT key FROM Settings WHERE key = ?`, args: ['form_toggles'] })
        if (existing.rows.length > 0) {
          await client.execute({ sql: `UPDATE Settings SET value = ?, updatedAt = datetime('now') WHERE key = ?`, args: [value, 'form_toggles'] })
        } else {
          await client.execute({ sql: `INSERT INTO Settings (key, value) VALUES (?, ?)`, args: ['form_toggles', value] })
        }
      }

      if (data.pauseMessage !== undefined) {
        const existing = await client.execute({ sql: `SELECT key FROM Settings WHERE key = ?`, args: ['pause_message'] })
        if (existing.rows.length > 0) {
          await client.execute({ sql: `UPDATE Settings SET value = ?, updatedAt = datetime('now') WHERE key = ?`, args: [data.pauseMessage as string, 'pause_message'] })
        } else {
          await client.execute({ sql: `INSERT INTO Settings (key, value) VALUES (?, ?)`, args: ['pause_message', data.pauseMessage] })
        }
      }

      // Return updated settings
      return createSettingsProxy(client).findFirst()
    },
  }
}

/**
 * Specialized proxy for SiteContent model — key/value with section grouping.
 */
function createSiteContentProxy(client: Client) {
  return {
    findMany: async () => {
      const result = await client.execute({ sql: `SELECT * FROM SiteContent ORDER BY section, key`, args: [] })
      return result.rows.map(mapRowToJs)
    },
    findUnique: async (args: { where: { key: string } }) => {
      const result = await client.execute({ sql: `SELECT * FROM SiteContent WHERE key = ?`, args: [args.where.key] })
      return result.rows.length > 0 ? mapRowToJs(result.rows[0]) : null
    },
    create: async (args: { data: Record<string, unknown> }) => {
      const d = args.data
      await client.execute({
        sql: `INSERT INTO SiteContent (key, value, section, label, type, updatedAt) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        args: [d.key as string, d.value as string, d.section as string, d.label as string, (d.type as string) || 'text']
      })
      return mapRowToJs((await client.execute({ sql: `SELECT * FROM SiteContent WHERE key = ?`, args: [d.key as string] })).rows[0])
    },
    update: async (args: { where: { key: string }; data: Record<string, unknown> }) => {
      const d = args.data
      await client.execute({
        sql: `UPDATE SiteContent SET value = ?, updatedAt = datetime('now') WHERE key = ?`,
        args: [d.value as string, args.where.key]
      })
      return mapRowToJs((await client.execute({ sql: `SELECT * FROM SiteContent WHERE key = ?`, args: [args.where.key] })).rows[0])
    },
  }
}

/** Map a libSQL row (which may have Buffer values) to a plain JS object. */
function mapRowToJs(row: Record<string, unknown>) {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    if (value instanceof ArrayBuffer) {
      // Try to decode as UTF-8 string
      try {
        obj[key] = new TextDecoder().decode(value)
      } catch {
        obj[key] = value
      }
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      // Auto-parse ISO date strings
      obj[key] = new Date(value)
    } else {
      obj[key] = value
    }
  }
  return obj
}

/**
 * Ensure all tables exist in the DB (safe for Turso + local SQLite).
 * Uses CREATE TABLE IF NOT EXISTS so it's idempotent.
 */
let _migrated = false

export async function ensureSchema() {
  if (_migrated) return
  _migrated = true
  try {
    const client = isTurso ? getLibSqlClient() : null

    const sql = `
      CREATE TABLE IF NOT EXISTS Membership (
        id             TEXT PRIMARY KEY,
        name           TEXT NOT NULL,
        email          TEXT NOT NULL,
        membershipId   TEXT NOT NULL,
        membershipName TEXT NOT NULL,
        status         TEXT NOT NULL DEFAULT 'activa',
        createdAt      TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    const newsletterSql = `
      CREATE TABLE IF NOT EXISTS NewsletterSubscriber (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        subscribedAt  TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    const settingsSql = `
      CREATE TABLE IF NOT EXISTS Settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '{}',
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // ReadingBooking table
    const readingBookingSql = `
      CREATE TABLE IF NOT EXISTS ReadingBooking (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL DEFAULT '',
        email       TEXT NOT NULL DEFAULT '',
        phone       TEXT NOT NULL DEFAULT '',
        readingType TEXT NOT NULL DEFAULT 'Lectura Akáshica Individual',
        message     TEXT NOT NULL DEFAULT '',
        status      TEXT NOT NULL DEFAULT 'pendiente',
        deliveryDate TEXT,
        createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt   TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // CrystalOrder table (also used for course enrollments)
    const crystalOrderSql = `
      CREATE TABLE IF NOT EXISTS CrystalOrder (
        id             TEXT PRIMARY KEY,
        customerName   TEXT NOT NULL DEFAULT '',
        customerEmail  TEXT NOT NULL DEFAULT '',
        customerPhone  TEXT NOT NULL DEFAULT '',
        address        TEXT NOT NULL DEFAULT '',
        city           TEXT NOT NULL DEFAULT '',
        province       TEXT NOT NULL DEFAULT '',
        postalCode     TEXT NOT NULL DEFAULT '',
        notes          TEXT,
        items          TEXT NOT NULL DEFAULT '[]',
        total          REAL NOT NULL DEFAULT 0,
        paymentMethod  TEXT NOT NULL DEFAULT '',
        paymentId      TEXT,
        status         TEXT NOT NULL DEFAULT 'pendiente',
        createdAt      TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt      TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // CourseInterest table
    const courseInterestSql = `
      CREATE TABLE IF NOT EXISTS CourseInterest (
        id        TEXT PRIMARY KEY,
        name      TEXT NOT NULL DEFAULT '',
        email     TEXT NOT NULL DEFAULT '',
        phone     TEXT NOT NULL DEFAULT '',
        course    TEXT NOT NULL DEFAULT '',
        message   TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // ResourcePurchase table
    const resourcePurchaseSql = `
      CREATE TABLE IF NOT EXISTS ResourcePurchase (
        id             TEXT PRIMARY KEY,
        resourceId     TEXT NOT NULL,
        resourceTitle  TEXT NOT NULL DEFAULT '',
        customerName   TEXT NOT NULL,
        customerEmail  TEXT NOT NULL,
        paymentMethod  TEXT NOT NULL,
        paymentId      TEXT,
        amount         REAL NOT NULL DEFAULT 0,
        downloadToken  TEXT NOT NULL UNIQUE,
        status         TEXT NOT NULL DEFAULT 'pendiente',
        createdAt      TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    if (client) {
      await client.execute(sql)
      await client.execute(newsletterSql)
      await client.execute(settingsSql)
      await client.execute(readingBookingSql)
      await client.execute(crystalOrderSql)
      await client.execute(courseInterestSql)
      await client.execute(resourcePurchaseSql)
      // Add deliveryDate column to ReadingBooking if missing
      try {
        await client.execute(`ALTER TABLE ReadingBooking ADD COLUMN deliveryDate TEXT`)
        console.log("[DB] Added deliveryDate column to ReadingBooking")
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('duplicate column') || msg.includes('already exists')) {
          // Column already exists, ignore
        } else {
          console.warn("[DB] Could not add deliveryDate column:", msg)
        }
      }
      // Add UNIQUE constraint to NewsletterSubscriber email if missing
      try {
        await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email ON NewsletterSubscriber(email)`)
        console.log("[DB] Added unique index on NewsletterSubscriber.email")
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        console.warn("[DB] Could not add newsletter email index:", msg)
      }
    } else {
      await prisma.$executeRawUnsafe(sql)
      await prisma.$executeRawUnsafe(newsletterSql)
      await prisma.$executeRawUnsafe(settingsSql)
      await prisma.$executeRawUnsafe(readingBookingSql)
      await prisma.$executeRawUnsafe(crystalOrderSql)
      await prisma.$executeRawUnsafe(courseInterestSql)
      await prisma.$executeRawUnsafe(resourcePurchaseSql)
    }
    // Create SiteContent table
    const siteContentSql = `
      CREATE TABLE IF NOT EXISTS SiteContent (
        key       TEXT PRIMARY KEY,
        value     TEXT NOT NULL,
        section   TEXT NOT NULL,
        label     TEXT NOT NULL,
        type      TEXT NOT NULL DEFAULT 'text',
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // Student table (aula virtual)
    const studentSql = `
      CREATE TABLE IF NOT EXISTS Student (
        id           TEXT PRIMARY KEY,
        email        TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        nombre       TEXT NOT NULL DEFAULT '',
        phone        TEXT NOT NULL DEFAULT '',
        createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // StudentEnrollment table (what each student has access to)
    const studentEnrollmentSql = `
      CREATE TABLE IF NOT EXISTS StudentEnrollment (
        id           TEXT PRIMARY KEY,
        studentId    TEXT NOT NULL,
        type         TEXT NOT NULL,
        referenceId  TEXT NOT NULL DEFAULT '',
        title        TEXT NOT NULL DEFAULT '',
        status       TEXT NOT NULL DEFAULT 'activa',
        assignedBy   TEXT,
        notes        TEXT,
        createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `

    // CourseContent table (material for courses in R2)
    const courseContentSql = `
      CREATE TABLE IF NOT EXISTS CourseContent (
        id           TEXT PRIMARY KEY,
        courseId     TEXT NOT NULL,
        title        TEXT NOT NULL,
        description  TEXT NOT NULL DEFAULT '',
        fileType     TEXT NOT NULL DEFAULT '',
        r2Key        TEXT NOT NULL,
        fileName     TEXT NOT NULL DEFAULT '',
        sortOrder    INTEGER NOT NULL DEFAULT 0,
        active       INTEGER NOT NULL DEFAULT 1,
        createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `
    if (client) {
      await client.execute(siteContentSql)
      await client.execute(studentSql)
      await client.execute(studentEnrollmentSql)
      await client.execute(courseContentSql)
      try {
        await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_sitecontent_key ON SiteContent(key)`)
      } catch {}
      try {
        await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_student_email ON Student(email)`)
      } catch {}
      try {
        await client.execute(`CREATE INDEX IF NOT EXISTS idx_enrollment_student ON StudentEnrollment(studentId)`)
      } catch {}
      try {
        await client.execute(`CREATE INDEX IF NOT EXISTS idx_coursecontent_course ON CourseContent(courseId)`)
      } catch {}
    } else {
      await prisma.$executeRawUnsafe(siteContentSql)
      await prisma.$executeRawUnsafe(studentSql)
      await prisma.$executeRawUnsafe(studentEnrollmentSql)
      await prisma.$executeRawUnsafe(courseContentSql)
    }
    console.log("[DB] Schema ensured: all tables ready (including Student, StudentEnrollment, CourseContent)")
  } catch (err) {
    console.error("[DB] Failed to ensure schema:", err)
  }
}
