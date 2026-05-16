-- Turso DB Dump - Eter Somos
-- Date: 2026-04-24
-- Database: etersomos-db-gpaulero

-- Schema: ReadingBooking
CREATE TABLE ReadingBooking (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      readingType TEXT DEFAULT 'Lectura Akáshica Individual',
      preferredDate TEXT,
      preferredTime TEXT,
      message TEXT,
      status TEXT DEFAULT 'pendiente',
      confirmedAt TEXT,
      sentAt TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    , birthDate TEXT, nationality TEXT, birthCity TEXT, residenceCity TEXT, civilStatus TEXT, chronicIllness TEXT, medication TEXT, psychologicalTherapy TEXT, psychologicalDuration TEXT, psychiatricTherapy TEXT, psychiatricDuration TEXT, currentPsychiatricMedication TEXT, question1 TEXT, question2 TEXT, additionalContext TEXT, deliveryDate TEXT);

-- Records: 1
INSERT INTO ReadingBooking (id, name, email, phone, readingType, preferredDate, preferredTime, message, status, confirmedAt, sentAt, notes, createdAt, updatedAt, birthDate, nationality, birthCity, residenceCity, civilStatus, chronicIllness, medication, psychologicalTherapy, psychologicalDuration, psychiatricTherapy, psychiatricDuration, currentPsychiatricMedication, question1, question2, additionalContext, deliveryDate) VALUES ('3af423cb-3097-4494-a95c-ef633cc83ee8', 'Gonzalo', 'gpaulero@gmail.com', '1231312', 'Lectura Akáshica Individual', NULL, NULL, NULL, 'en_progreso', NULL, NULL, NULL, '2026-04-21T23:53:29.810Z', '2026-04-23T16:00:03.267Z', '1990-10-17', 'Argentino', 'Cordoba', 'Cordoba', 'Casado/a', 'NO', 'No', 'Sí', NULL, 'No', NULL, 'No', 'Hol', 'es una prueba', NULL, NULL);

-- Schema: CourseInterest
CREATE TABLE CourseInterest (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      courseName TEXT NOT NULL,
      coursePrice REAL NOT NULL,
      createdAt TEXT NOT NULL
    );

-- Records: 1
INSERT INTO CourseInterest (id, name, email, phone, courseName, coursePrice, createdAt) VALUES ('0919f169-6fcd-48ff-9a17-e2e3e5043305', 'Gonza', 'test@test.com', '5491111111111', 'Nivel Avanzado', 45000.0, '2026-04-21T20:13:33.843Z');

-- Schema: CrystalOrder
CREATE TABLE CrystalOrder (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pendiente',
      createdAt TEXT NOT NULL
    );

-- Records: 0

-- Schema: Membership
CREATE TABLE Membership (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    membershipId TEXT NOT NULL,
    membershipName TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'activa',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

-- Records: 0
