from django.db import models
from django.conf import settings
from .fields import EncryptedCharField

class DataSource(models.Model):
    name = models.CharField(max_length=255)
    connection_type = models.CharField(max_length=50)
    endpoint = models.CharField(max_length=500)
    auth_token = EncryptedCharField(max_length=255, blank=True, null=True)
    config = models.JSONField(default=dict, blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class ReportTemplate(models.Model):
    name = models.CharField(max_length=255)
    layout = models.CharField(max_length=50)
    header_text = models.CharField(max_length=255, blank=True, null=True)
    css_overrides = models.TextField(blank=True, null=True)
    has_chart = models.BooleanField(default=False)
    chart_type = models.CharField(max_length=50, blank=True, null=True, choices=[('bar', 'Bar Chart'), ('pie', 'Pie Chart')])
    email_subject = models.CharField(max_length=255, blank=True, null=True)
    email_body_html = models.TextField(blank=True, null=True)
    enable_ai_summary = models.BooleanField(default=False)
    ai_prompt = models.TextField(blank=True, null=True, help_text="Custom instructions for the AI")
    branding_logo = models.ImageField(upload_to='branding_logos/', blank=True, null=True)
    branding_color = models.CharField(max_length=7, default='#1e3c72')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Schedule(models.Model):
    name = models.CharField(max_length=255)
    frequency = models.CharField(max_length=50)
    time_of_day = models.TimeField(null=True, blank=True)
    cron_expression = models.CharField(max_length=100, null=True, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    recipients = models.TextField(help_text="Comma separated email addresses")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Job(models.Model):
    name = models.CharField(max_length=255)
    data_source = models.ForeignKey(DataSource, on_delete=models.CASCADE)
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ExecutionLog(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True, related_name='execution_logs')
    job_name_snapshot = models.CharField(max_length=255, blank=True, null=True, help_text="Preserves the job name if the job is deleted")
    status = models.CharField(max_length=20, choices=(('success', 'Success'), ('failed', 'Failed')))
    error_message = models.TextField(blank=True, null=True)
    is_archived = models.BooleanField(default=False)
    is_deleted_from_reports = models.BooleanField(default=False)
    is_deleted_from_analytics = models.BooleanField(default=False)
    is_resolved_failure = models.BooleanField(default=False)
    report_file = models.FileField(upload_to='reports/', null=True, blank=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job.name if self.job else self.job_name_snapshot} - {self.status} at {self.executed_at}"

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=Job)
def delete_apscheduler_job(sender, instance, **kwargs):
    try:
        from django_apscheduler.models import DjangoJob
        job_id_str = f"job_{instance.id}"
        DjangoJob.objects.filter(id=job_id_str).delete()
    except Exception:
        pass
