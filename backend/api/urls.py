from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('api/analyze/', views.analyze_symptoms),
    path('api/records/', views.get_records),
    path('api/records/patient/<str:patient_name>/', views.get_patient_records),
    path('api/records/<int:record_id>/confirm/', views.confirm_record),
    path('api/users/', views.get_users),
]
