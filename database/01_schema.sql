-- ============================================================
--  CuraMind AI — HIPAA-Compliant Telehealth & Diagnostics
--  Supabase PostgreSQL Schema
-- ============================================================

-- STEP 1: ENUM TYPES (PostgreSQL uses custom types for ENUMs)
CREATE TYPE user_role     AS ENUM ('patient', 'doctor');
CREATE TYPE gender_type   AS ENUM ('male', 'female', 'other');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
--  TABLE 1: LOGIN
-- ============================================================
CREATE TABLE login (
  user_id       SERIAL          PRIMARY KEY,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          user_role       NOT NULL,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE 2: PATIENT
-- ============================================================
CREATE TABLE patient (
  patient_id    SERIAL          PRIMARY KEY,
  name          VARCHAR(150)    NOT NULL,
  age           SMALLINT        NOT NULL CHECK (age >= 0 AND age <= 150),
  gender        gender_type     NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  phone         VARCHAR(20),
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE 3: DOCTOR
-- ============================================================
CREATE TABLE doctor (
  doctor_id       SERIAL        PRIMARY KEY,
  name            VARCHAR(150)  NOT NULL,
  specialization  VARCHAR(150)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE 4: SYMPTOMS
-- ============================================================
CREATE TABLE symptoms (
  record_id    SERIAL        PRIMARY KEY,
  patient_id   INT           NOT NULL REFERENCES patient(patient_id)
                             ON DELETE CASCADE ON UPDATE CASCADE,
  fever        BOOLEAN       NOT NULL DEFAULT FALSE,
  cough        BOOLEAN       NOT NULL DEFAULT FALSE,
  headache     BOOLEAN       NOT NULL DEFAULT FALSE,
  fatigue      BOOLEAN       NOT NULL DEFAULT FALSE,
  chest_pain   BOOLEAN       NOT NULL DEFAULT FALSE,
  date         DATE          NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptoms_patient ON symptoms(patient_id);
CREATE INDEX idx_symptoms_date    ON symptoms(date);

-- ============================================================
--  TABLE 5: DIAGNOSIS
-- ============================================================
CREATE TABLE diagnosis (
  diagnosis_id      SERIAL          PRIMARY KEY,
  patient_id        INT             NOT NULL REFERENCES patient(patient_id)
                                    ON DELETE CASCADE ON UPDATE CASCADE,
  doctor_id         INT             REFERENCES doctor(doctor_id)
                                    ON DELETE SET NULL,
  predicted_disease VARCHAR(255)    NOT NULL,
  confidence        DECIMAL(5,2)    CHECK (confidence >= 0 AND confidence <= 100),
  doctor_review     review_status   NOT NULL DEFAULT 'pending',
  date              DATE            NOT NULL,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnosis_patient ON diagnosis(patient_id);
CREATE INDEX idx_diagnosis_doctor  ON diagnosis(doctor_id);
CREATE INDEX idx_diagnosis_review  ON diagnosis(doctor_review);

-- ============================================================
--  AUTO UPDATE: updated_at trigger for diagnosis & login
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_diagnosis_updated
  BEFORE UPDATE ON diagnosis
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_login_updated
  BEFORE UPDATE ON login
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
--  SAMPLE DATA (for testing — delete before production)
-- ============================================================

INSERT INTO doctor (name, specialization, email, password_hash)
VALUES ('Dr. Aisha Mehta', 'General Medicine',
        'aisha.mehta@curamind.ai',
        '$2b$12$samplehashedpasswordhere');

INSERT INTO patient (name, age, gender, email, password_hash, phone)
VALUES ('Rahul Sharma', 28, 'male',
        'rahul.sharma@gmail.com',
        '$2b$12$samplehashedpasswordhere',
        '+91 98765 43210');

INSERT INTO login (email, password_hash, role)
VALUES ('rahul.sharma@gmail.com',
        '$2b$12$samplehashedpasswordhere',
        'patient');

INSERT INTO symptoms (patient_id, fever, cough, headache, fatigue, chest_pain, date)
VALUES (1, TRUE, TRUE, FALSE, TRUE, FALSE, CURRENT_DATE);

INSERT INTO diagnosis (patient_id, doctor_id, predicted_disease, confidence, doctor_review, date)
VALUES (1, 1, 'Viral Upper Respiratory Infection', 87.50, 'pending', CURRENT_DATE);

-- ============================================================
--  CuraMind AI — Critical Database Enhancements
-- ============================================================

-- ============================================================
--  CHANGE 1: Add More Symptoms Columns
-- ============================================================
ALTER TABLE symptoms
ADD COLUMN shortness_of_breath  BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN sore_throat          BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN nausea               BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN vomiting             BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN body_ache            BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN loss_of_smell        BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN loss_of_taste        BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
--  CHANGE 2: Audit Log Table
-- ============================================================
CREATE TABLE audit_log (
  log_id        SERIAL        PRIMARY KEY,
  table_name    VARCHAR(100)  NOT NULL,
  action        VARCHAR(10)   NOT NULL,
  performed_by  VARCHAR(255)  NOT NULL,
  old_data      JSONB,
  new_data      JSONB,
  performed_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only doctors can view audit log
CREATE POLICY "Doctor can view audit log"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor
      WHERE doctor.email = auth.email()
    )
  );

-- Only service role can insert into audit log
CREATE POLICY "Service role can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
--  CHANGE 3: Views for Easy Data Reading
-- ============================================================

-- Patient diagnosis view
CREATE VIEW patient_diagnosis_view AS
SELECT
  p.name              AS patient_name,
  p.age,
  p.gender,
  d.predicted_disease,
  d.confidence,
  d.doctor_review,
  d.date
FROM patient p
JOIN diagnosis d ON p.patient_id = d.patient_id;

-- Patient symptoms view
CREATE VIEW patient_symptoms_view AS
SELECT
  p.name                    AS patient_name,
  s.fever,
  s.cough,
  s.headache,
  s.fatigue,
  s.chest_pain,
  s.shortness_of_breath,
  s.sore_throat,
  s.nausea,
  s.vomiting,
  s.body_ache,
  s.loss_of_smell,
  s.loss_of_taste,
  s.date
FROM patient p
JOIN symptoms s ON p.patient_id = s.patient_id;