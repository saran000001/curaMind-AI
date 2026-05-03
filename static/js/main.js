document.addEventListener('DOMContentLoaded', () => {
    
    // Helper to show notifications
    const showNotification = (message, type) => {
        const notif = document.getElementById('notification');
        if (notif) {
            notif.textContent = message;
            notif.className = `notification ${type}`;
        }
    };

    // User Info Display
    const userInfoData = sessionStorage.getItem('userInfo');
    if (userInfoData) {
        const user = JSON.parse(userInfoData);
        const userInfoDiv = document.getElementById('userInfo');
        const displayName = document.getElementById('displayName');
        const displayPatientId = document.getElementById('displayPatientId');
        
        if (userInfoDiv && displayName && displayPatientId) {
            displayName.textContent = user.name;
            displayPatientId.textContent = user.patient_id;
            userInfoDiv.style.display = 'block';
        }
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    sessionStorage.setItem('userInfo', JSON.stringify(data.user));
                    showNotification('Login successful! Redirecting...', 'success');
                    setTimeout(() => window.location.href = '/symptoms', 1000);
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (err) {
                showNotification('An error occurred.', 'error');
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            const dob = document.getElementById('dob').value;
            const phone = document.getElementById('phone').value;
            
            try {
                const res = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name, dob, phone })
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    showNotification('Registration successful! Redirecting to login...', 'success');
                    setTimeout(() => window.location.href = '/', 1500);
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (err) {
                showNotification('An error occurred.', 'error');
            }
        });
    }

    // Symptoms Form Handler
    const symptomsForm = document.getElementById('symptomsForm');
    if (symptomsForm) {
        symptomsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const symptoms = document.getElementById('symptomsText').value;
            const btn = document.getElementById('analyzeBtn');
            
            btn.textContent = 'Analyzing...';
            btn.disabled = true;
            
            try {
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symptoms })
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    // Store result in sessionStorage to show on result page
                    sessionStorage.setItem('diagnosticResult', JSON.stringify(data.result));
                    window.location.href = '/result';
                } else {
                    showNotification('Analysis failed.', 'error');
                    btn.textContent = 'Analyze Symptoms';
                    btn.disabled = false;
                }
            } catch (err) {
                showNotification('An error occurred.', 'error');
                btn.textContent = 'Analyze Symptoms';
                btn.disabled = false;
            }
        });
    }

    // Result Page Rendering
    const resultCard = document.getElementById('resultCard');
    if (resultCard) {
        const storedResult = sessionStorage.getItem('diagnosticResult');
        if (storedResult) {
            const result = JSON.parse(storedResult);
            document.getElementById('resDiagnosis').textContent = result.diagnosis;
            document.getElementById('resConfidence').textContent = result.confidence;
            document.getElementById('resRecommendation').textContent = result.recommendation;
            
            resultCard.style.display = 'block';
            
            // Animate confidence bar
            setTimeout(() => {
                document.getElementById('resConfidenceBar').style.width = result.confidence;
            }, 300);
        } else {
            // No result found, redirect back
            window.location.href = '/symptoms';
        }
    }
});
