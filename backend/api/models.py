from django.db import models
from django.contrib.auth.models import User
import random

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, default='Patient')
    patient_id = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=100)
    dob = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):
        if not self.patient_id and self.role == 'Patient':
            self.patient_id = f"PT-{random.randint(10000, 99999)}"
        elif not self.patient_id and self.role == 'Doctor':
            self.patient_id = f"DR-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class DiagnosisRecord(models.Model):
    patient_name = models.CharField(max_length=100)
    symptoms = models.TextField()
    ai_prediction = models.CharField(max_length=200)
    severity = models.CharField(max_length=50, default="Low")
    status = models.CharField(max_length=50, default="Pending Doctor Review")
    created_at = models.DateTimeField(auto_now_add=True)
