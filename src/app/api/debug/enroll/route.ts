import { NextRequest, NextResponse } from "next/server";
import { ensureStudentWithEnrollment } from "@/lib/student-auth";
import { sendAulaWelcomeEmail } from "@/lib/email";

/**
 * DEBUG ENDPOINT — tests auto-enroll + credentials email flow.
 * DELETE THIS FILE AFTER DEBUGGING.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || "test@debug.com").trim().toLowerCase();
    const name = body.name || "Test Debug";

    console.log(`[DebugEnroll] Starting test for email=${email}, name=${name}`);

    // Step 1: Ensure student + enrollment
    console.log("[DebugEnroll] Step 1: Calling ensureStudentWithEnrollment...");
    const enrollResult = await ensureStudentWithEnrollment({
      name,
      email,
      phone: "",
      enrollmentType: 'lectura',
      enrollmentTitle: 'Lectura Akáshica Individual (Debug Test)',
      notes: 'Debug test enrollment',
      assignedBy: 'debug-endpoint',
    });
    console.log(`[DebugEnroll] Step 1 result: isNew=${enrollResult.isNewStudent}, hasPassword=${!!enrollResult.generatedPassword}, enrollmentId=${enrollResult.enrollmentId}`);

    // Step 2: Send credentials email
    let emailResult = "NOT_SENT";
    if (enrollResult.generatedPassword) {
      console.log("[DebugEnroll] Step 2: Sending welcome email with credentials...");
      try {
        await sendAulaWelcomeEmail({
          customerName: name,
          customerEmail: email,
          password: enrollResult.generatedPassword,
          enrollmentType: 'lectura',
          enrollmentTitle: 'Lectura Akáshica Individual (Debug Test)',
        });
        emailResult = "SENT_SUCCESSFULLY";
        console.log("[DebugEnroll] Step 2: Email sent successfully!");
      } catch (emailErr: any) {
        emailResult = `FAILED: ${emailErr.message}`;
        console.error("[DebugEnroll] Step 2 FAILED:", emailErr.message);
      }
    } else {
      emailResult = "NO_PASSWORD_GENERATED";
      console.warn("[DebugEnroll] Step 2: No password generated, cannot send email");
    }

    return NextResponse.json({
      success: true,
      debug: {
        email,
        name,
        isNewStudent: enrollResult.isNewStudent,
        hasPassword: !!enrollResult.generatedPassword,
        enrollmentId: enrollResult.enrollmentId,
        emailResult,
        timestamp: new Date().toISOString(),
        smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_APP_PASSWORD),
        smtpUser: process.env.SMTP_USER || "NOT_SET",
      },
    });
  } catch (error: any) {
    console.error("[DebugEnroll] CRITICAL ERROR:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
