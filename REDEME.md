# CuraMind AI
### HIPAA-Compliant Telehealth & Diagnostics Platform

## Database Setup
1. Create a Supabase project
2. Go to SQL Editor → New Query
3. Run `database/01_schema.sql` first
4. Run `database/02_rls.sql` second

## Tables
| Table | Purpose |
|-------|---------|
| login | Authentication for all users |
| patient | Patient registration & profile |
| doctor | Doctor registration & profile |
| symptoms | Patient symptom check-ins |
| diagnosis | AI predicted results & doctor review |

## Security
- Row Level Security (RLS) enabled on all tables
- Patients can only access their own data
- Doctors can view all patient data
- AI backend uses service role key only

## Tech Stack
- Database: Supabase (PostgreSQL)
- Security: HIPAA-compliant RLS policies
- AI Engine: CuraMind AI Diagnosticss