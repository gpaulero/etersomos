/**
 * Student authentication system for Aula Virtual.
 * Uses JWT (jose) + httpOnly cookies + bcryptjs for password hashing.
 */
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { randomBytes } from 'crypto'
import { db, ensureSchema } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.STUDENT_JWT_SECRET || 'etersomos_student_secret_key_2024'
)

const COOKIE_NAME = 'student_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface StudentPayload {
  id: string
  email: string
  nombre: string
}

/* ── Password helpers ── */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/* ── JWT helpers ── */

export async function createStudentToken(student: StudentPayload): Promise<string> {
  return new SignJWT({ id: student.id, email: student.email, nombre: student.nombre })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyStudentToken(token: string): Promise<StudentPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.id as string,
      email: payload.email as string,
      nombre: payload.nombre as string,
    }
  } catch {
    return null
  }
}

/* ── Cookie helpers (for API routes) ── */

export function getStudentCookieOptions() {
  return {
    name: COOKIE_NAME,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}

export function getStudentLogoutCookieOptions() {
  return {
    name: COOKIE_NAME,
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}

export { COOKIE_NAME }

/* ── Student CRUD ── */

export async function findStudentByEmail(email: string) {
  await ensureSchema()
  return (db as any).student.findUnique({ where: { email } })
}

export async function findStudentById(id: string) {
  await ensureSchema()
  return (db as any).student.findUnique({ where: { id } })
}

export async function createStudent(data: { email: string; password: string; nombre: string; phone?: string }) {
  await ensureSchema()
  const id = `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const passwordHash = await hashPassword(data.password)
  const now = new Date()
  return (db as any).student.create({
    data: {
      id,
      email: data.email,
      passwordHash,
      nombre: data.nombre,
      phone: data.phone || '',
      createdAt: now,
      updatedAt: now,
    }
  })
}

export async function getStudentEnrollments(studentId: string) {
  await ensureSchema()
  const enrollments = await (db as any).studentEnrollment.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch attachments for all enrollments
  const enrollmentsWithAttachments = await Promise.all(
    enrollments.map(async (enrollment: any) => {
      try {
        const attachments = await (db as any).enrollmentAttachment.findMany({
          where: { enrollmentId: enrollment.id },
          orderBy: { sortOrder: 'asc' },
        })
        return { ...enrollment, attachments }
      } catch {
        // Table might not exist yet during migration
        return { ...enrollment, attachments: [] }
      }
    })
  )

  return enrollmentsWithAttachments
}

export async function createEnrollment(data: {
  studentId: string
  type: 'curso' | 'lectura' | 'mentoria'
  referenceId?: string
  title: string
  status?: string
  assignedBy?: string
  notes?: string
  r2Key?: string
  fileName?: string
  expiresAt?: string | null
}) {
  await ensureSchema()
  const id = `enr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date()
  return (db as any).studentEnrollment.create({
    data: {
      id,
      studentId: data.studentId,
      type: data.type,
      referenceId: data.referenceId || '',
      title: data.title,
      status: data.status || 'activa',
      assignedBy: data.assignedBy || null,
      notes: data.notes || null,
      r2Key: data.r2Key || '',
      fileName: data.fileName || '',
      expiresAt: data.expiresAt || null,
      createdAt: now,
      updatedAt: now,
    }
  })
}

/* ── Auto-create student + enrollment on purchase ── */

function generateRandomPassword(length = 10): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export interface AutoEnrollResult {
  studentId: string
  isNewStudent: boolean
  generatedPassword: string | null
  enrollmentId: string
  isNewEnrollment: boolean
}

/**
 * Ensures a Student exists (creates if not) and creates a StudentEnrollment.
 * Called automatically when someone pays for a course, reading, or mentoría.
 * Returns the student ID, whether it's newly created, and the generated password.
 * For existing students, the password is regenerated so they always receive credentials.
 */
export async function ensureStudentWithEnrollment(params: {
  name: string
  email: string
  phone?: string
  enrollmentType: 'curso' | 'lectura' | 'mentoria'
  enrollmentTitle: string
  referenceId?: string
  notes?: string
  assignedBy?: string
}): Promise<AutoEnrollResult> {
  await ensureSchema()

  const normalizedEmail = params.email.trim().toLowerCase()

  // 1. Check if student already exists
  let student = await findStudentByEmail(normalizedEmail)
  let isNewStudent = false
  let generatedPassword: string | null = null

  if (!student) {
    // 2. Create new student with auto-generated password
    const rawPassword = generateRandomPassword(10)
    student = await createStudent({
      email: normalizedEmail,
      password: rawPassword,
      nombre: params.name.trim(),
      phone: params.phone?.trim() || '',
    })
    isNewStudent = true
    generatedPassword = rawPassword
    console.log(`[AutoEnroll] Created new student: ${student.id} (${normalizedEmail})`)
  } else {
    // Existing student — update name/phone but do NOT regenerate password
    // They already have credentials; they'll use their existing password
    await (db as any).student.update({
      where: { id: student.id },
      data: {
        nombre: params.name.trim() || student.nombre,
        phone: params.phone?.trim() || student.phone,
        updatedAt: new Date(),
      },
    })
    generatedPassword = null // No new password for existing students
    console.log(`[AutoEnroll] Existing student found: ${student.id} (${normalizedEmail}) — no password change`)
  }

  // 3. Check if enrollment already exists for this student + type + referenceId
  const existingEnrollments: Array<{ id: string; type: string; referenceId: string; title: string }> =
    await (db as any).studentEnrollment.findMany({
      where: { studentId: student.id },
    })

  const duplicate = existingEnrollments.find(
    (e) =>
      e.type === params.enrollmentType &&
      e.referenceId === (params.referenceId || '') &&
      e.title === params.enrollmentTitle
  )

  if (duplicate) {
    console.log(`[AutoEnroll] Enrollment already exists: ${duplicate.id} — skipping creation`)
    return {
      studentId: student.id,
      isNewStudent,
      generatedPassword,
      enrollmentId: duplicate.id,
      isNewEnrollment: false,
    }
  }

  // 4. Create enrollment
  const enrollment = await createEnrollment({
    studentId: student.id,
    type: params.enrollmentType,
    referenceId: params.referenceId,
    title: params.enrollmentTitle,
    status: 'activa',
    assignedBy: params.assignedBy || 'auto-purchase',
    notes: params.notes || undefined,
  })

  console.log(`[AutoEnroll] Created enrollment: ${enrollment.id} (${params.enrollmentType}: ${params.enrollmentTitle})`)

  return {
    studentId: student.id,
    isNewStudent,
    generatedPassword,
    enrollmentId: enrollment.id,
    isNewEnrollment: true,
  }
}

/* ── Password recovery (S36) ── */

export async function createPasswordResetToken(email: string): Promise<{ studentId: string; token: string } | null> {
  await ensureSchema()
  let student = await (db as any).student.findUnique({ where: { email } })
  if (!student) {
    const all = await (db as any).student.findMany({})
    student = all.find((s: any) => String(s.email).toLowerCase() === email.toLowerCase()) || null
  }
  if (!student) return null
  const token = randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  await (db as any).student.update({
    where: { id: student.id },
    data: { resetToken: token, resetExpiry: expiry, updatedAt: new Date() },
  })
  return { studentId: student.id, token }
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  await ensureSchema()
  if (!token) return false
  const student = await (db as any).student.findFirst({ where: { resetToken: token } })
  if (!student || !student.resetExpiry) return false
  if (new Date(student.resetExpiry).getTime() < Date.now()) return false
  const passwordHash = await hashPassword(newPassword)
  await (db as any).student.update({
    where: { id: student.id },
    data: { passwordHash, resetToken: null, resetExpiry: null, updatedAt: new Date() },
  })
  return true
}
