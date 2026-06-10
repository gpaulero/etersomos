/**
 * Student authentication system for Aula Virtual.
 * Uses JWT (jose) + httpOnly cookies + bcryptjs for password hashing.
 */
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
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
  return (db as any).student.create({
    data: {
      id,
      email: data.email,
      passwordHash,
      nombre: data.nombre,
      phone: data.phone || '',
    }
  })
}

export async function getStudentEnrollments(studentId: string) {
  await ensureSchema()
  return (db as any).studentEnrollment.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createEnrollment(data: {
  studentId: string
  type: 'curso' | 'lectura' | 'mentoria'
  referenceId?: string
  title: string
  status?: string
  assignedBy?: string
  notes?: string
}) {
  await ensureSchema()
  const id = `enr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
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
    }
  })
}
