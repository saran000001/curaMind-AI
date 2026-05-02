from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Patient, DiagnosisRecord
import json

@api_view(['POST'])
def register(request):
    data = request.data
    email = data.get('email', '').lower()
    password = data.get('password')
    name = data.get('name')
    dob = data.get('dob') or None
    phone = data.get('phone', '')
    role = data.get('role', 'Patient')

    if User.objects.filter(username=email).exists():
        return Response({"status": "error", "message": "User already exists"}, status=400)

    user = User.objects.create_user(username=email, email=email, password=password)
    patient = Patient.objects.create(user=user, name=name, dob=dob, phone=phone, role=role)

    return Response({
        "status": "success", 
        "message": f"Registration successful! Your Patient ID is {patient.patient_id}"
    })

@api_view(['POST'])
def login(request):
    data = request.data
    email = data.get('email', '').lower()
    password = data.get('password')

    user = authenticate(username=email, password=password)
    if user is not None:
        try:
            patient = user.patient
            user_info = {
                "name": patient.name,
                "patient_id": patient.patient_id,
                "role": patient.role
            }
            return Response({"status": "success", "message": "Login successful", "user": user_info})
        except Patient.DoesNotExist:
            return Response({"status": "error", "message": "User profile missing"}, status=400)
    else:
        return Response({"status": "error", "message": "Invalid credentials"}, status=401)

@api_view(['POST'])
def analyze_symptoms(request):
    data = request.data
    symptoms_text = data.get('symptoms', '').lower()
    checkbox_symptoms = data.get('checkbox_symptoms', [])
    age = data.get('age', 'Unknown')
    gender = data.get('gender', 'Unknown')
    
    combined_symptoms = " ".join(checkbox_symptoms).lower() + " " + symptoms_text

    # JSON Mapping Rules
    symptom_rules = [
        {"keywords": ["headache", "fever"], "disease": "Viral Infection / Flu", "confidence": "85%", "severity": "Medium", "action": "Rest, stay hydrated, monitor temperature."},
        {"keywords": ["fever", "rash"], "disease": "Possible Viral Exanthem", "confidence": "75%", "severity": "Medium", "action": "Monitor rash closely, consult doctor if breathing issue."},
        {"keywords": ["fever", "chill"], "disease": "Severe Bacterial Infection", "confidence": "70%", "severity": "High", "action": "Urgent blood tests recommended."},
        {"keywords": ["cough", "short"], "disease": "Respiratory Infection", "confidence": "78%", "severity": "High", "action": "Schedule urgent telehealth. Isolate."},
        {"keywords": ["nausea"], "disease": "Gastroenteritis", "confidence": "80%", "severity": "Medium", "action": "Maintain hydration and bland diet."},
        {"keywords": ["pain"], "disease": "Localized Inflammation", "confidence": "60%", "severity": "Low", "action": "Take anti-inflammatory medication and rest."}
    ]

    # Match logic
    diagnosis = "Unknown Condition"
    confidence = "40%"
    severity = "Low"
    action = "Please consult a doctor for a thorough evaluation."

    for rule in symptom_rules:
        if all(kw in combined_symptoms for kw in rule["keywords"]):
            diagnosis = rule["disease"]
            confidence = rule["confidence"]
            severity = rule["severity"]
            action = rule["action"]
            break

    if diagnosis == "Unknown Condition" and combined_symptoms.strip():
        diagnosis = "General Fatigue / Stress"
        confidence = "55%"
        severity = "Low"
        action = "Ensure adequate sleep, balanced diet, reduce stress."

    recommendation = f"Patient ({age}y, {gender}): {action}"

    # Save to database for Doctor Review
    patient_name = data.get('patient_name', 'Anonymous')
    DiagnosisRecord.objects.create(
        patient_name=patient_name,
        symptoms=combined_symptoms,
        ai_prediction=diagnosis,
        severity=severity
    )

    result = {
        "diagnosis": diagnosis,
        "confidence": confidence,
        "severity": severity,
        "recommendation": recommendation,
        "raw_input": combined_symptoms
    }
    return Response({"status": "success", "result": result})

@api_view(['GET'])
def get_records(request):
    records = DiagnosisRecord.objects.all().order_by('-created_at')
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "patient_name": r.patient_name,
            "symptoms": r.symptoms,
            "ai_prediction": r.ai_prediction,
            "severity": r.severity,
            "status": r.status
        })
    return Response({"status": "success", "records": data})

@api_view(['GET'])
def get_patient_records(request, patient_name):
    records = DiagnosisRecord.objects.filter(patient_name=patient_name).order_by('-created_at')
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "symptoms": r.symptoms,
            "ai_prediction": r.ai_prediction,
            "severity": r.severity,
            "status": r.status,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return Response({"status": "success", "records": data})

@api_view(['POST'])
def confirm_record(request, record_id):
    try:
        record = DiagnosisRecord.objects.get(id=record_id)
        record.status = "Confirmed by Doctor"
        record.save()
        return Response({"status": "success"})
    except DiagnosisRecord.DoesNotExist:
        return Response({"status": "error", "message": "Not found"}, status=404)

@api_view(['GET'])
def get_users(request):
    patients = Patient.objects.filter(role='Patient')
    data = []
    for p in patients:
        data.append({
            "name": p.name,
            "email": p.user.email,
            "patient_id": p.patient_id,
            "phone": p.phone,
            "dob": p.dob.strftime("%Y-%m-%d") if p.dob else "N/A"
        })
    return Response({"status": "success", "users": data})
