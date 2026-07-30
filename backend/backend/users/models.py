from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string

class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class OTP(models.Model):
    PURPOSE_CHOICES = (
        ('registration', 'Registration'),
        ('reset_password', 'Reset Password'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps', null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    registration_data = models.JSONField(null=True, blank=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return timezone.now() < self.expires_at

    @classmethod
    def generate_code(cls):
        return ''.join(random.choices(string.digits, k=6))
