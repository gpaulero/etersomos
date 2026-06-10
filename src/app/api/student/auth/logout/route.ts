import { NextResponse } from 'next/server'
import { getStudentLogoutCookieOptions } from '@/lib/student-auth'

export async function POST() {
  const cookieOpts = getStudentLogoutCookieOptions()
  const response = NextResponse.json({ success: true })
  response.cookies.set(cookieOpts.name, '', cookieOpts)
  return response
}
