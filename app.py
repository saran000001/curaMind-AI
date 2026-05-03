from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)

# In-memory storage for MVP
users = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if email in users and users[email]['password'] == password:
        user_info = {
            "name": users[email]['name'],
            "patient_id": users[email]['patient_id']
        }
        return jsonify({"status": "success", "message": "Login successful", "user": user_info})
    else:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
        
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        dob = data.get('dob')
        phone = data.get('phone')
        
        if email in users:
            return jsonify({"status": "error", "message": "User already exists"}), 400
            
        import random
        patient_id = f"PT-{random.randint(10000, 99999)}"
            
        users[email] = {
            "password": password,
            "patient_id": patient_id,
            "name": name,
            "dob": dob,
            "phone": phone
        }
        return jsonify({
            "status": "success", 
            "message": f"Registration successful! Your Patient ID is {patient_id}"
        })

@app.route('/symptoms')
def symptoms():
    return render_template('symptoms.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_symptoms():
    data = request.json
    symptoms_text = data.get('symptoms', '').lower()
    
    # Mock AI Diagnostic logic
    diagnosis = "Unknown"
    confidence = "0%"
    recommendation = "Please consult a doctor for a thorough evaluation."
    
    if 'headache' in symptoms_text and 'fever' in symptoms_text:
        diagnosis = "Viral Infection / Flu"
        confidence = "85%"
        recommendation = "Rest, stay hydrated, and monitor temperature. If fever exceeds 103F, seek immediate medical attention."
    elif 'cough' in symptoms_text and 'short' in symptoms_text:
        diagnosis = "Respiratory Infection"
        confidence = "78%"
        recommendation = "Schedule an urgent telehealth consultation. Isolate and monitor oxygen levels."
    elif 'pain' in symptoms_text:
        diagnosis = "Localized Inflammation"
        confidence = "60%"
        recommendation = "Take over-the-counter anti-inflammatory medication and rest the affected area."
    elif symptoms_text.strip() != "":
        diagnosis = "General Fatigue / Stress"
        confidence = "55%"
        recommendation = "Ensure adequate sleep (7-9 hours), maintain a balanced diet, and reduce stress. If symptoms persist, consult a doctor."

    result = {
        "diagnosis": diagnosis,
        "confidence": confidence,
        "recommendation": recommendation,
        "raw_input": symptoms_text
    }
    return jsonify({"status": "success", "result": result})

@app.route('/result')
def result():
    return render_template('result.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
