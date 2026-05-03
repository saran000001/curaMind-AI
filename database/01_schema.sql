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
--  SAMPLE DATA 
-- ============================================================

INSERT INTO doctor (name, specialization, email, password_hash)
VALUES ('Dr. Sarvesh', 'General Medicine',
        'aisha.mehta@curamind.ai',
        '$2b$12$samplehashedpasswordhere');

INSERT INTO patient (name, age, gender, email, password_hash, phone)
VALUES ('Saran', 20, 'male',
        'saran9@gmail.com',
        '$2b$12$samplehashedpasswordhere',
        '+91 98765 43210');

INSERT INTO login (email, password_hash, role)
VALUES ('saran9@gmail.com',
        '$2b$12$samplehashedpasswordhere',
        'patient');

INSERT INTO symptoms (patient_id, fever, cough, headache, fatigue, chest_pain, date)
VALUES (1, TRUE, TRUE, FALSE, TRUE, FALSE, CURRENT_DATE);

INSERT INTO diagnosis (patient_id, doctor_id, predicted_disease, confidence, doctor_review, date)
VALUES (1, 1, 'Viral Upper Respiratory Infection', 87.50, 'pending', CURRENT_DATE);
