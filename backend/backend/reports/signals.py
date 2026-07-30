from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from .models import ReportTemplate, ExecutionLog

@receiver(pre_delete, sender=ReportTemplate)
def delete_template_logo(sender, instance, **kwargs):
    if instance.branding_logo:
        instance.branding_logo.delete(save=False)

@receiver(pre_delete, sender=ExecutionLog)
def delete_execution_report(sender, instance, **kwargs):
    if instance.generated_report:
        instance.generated_report.delete(save=False)

@receiver(pre_save, sender=ReportTemplate)
def delete_old_logo_on_update(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = ReportTemplate.objects.get(pk=instance.pk)
        old_file = old_instance.branding_logo
    except ReportTemplate.DoesNotExist:
        return
    
    new_file = instance.branding_logo
    if not old_file == new_file:
        if old_file:
            old_file.delete(save=False)
