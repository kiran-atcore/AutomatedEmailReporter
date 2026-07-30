from rest_framework import serializers
from .models import DataSource, ReportTemplate, Schedule, Job, ExecutionLog

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'
        read_only_fields = ('owner',)

class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = '__all__'
        read_only_fields = ('owner',)

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'
        read_only_fields = ('owner',)

class JobSerializer(serializers.ModelSerializer):
    # For reading, we might want nested details. For writing, just IDs.
    # We'll keep it simple for now with IDs for write, but include basic info for read if needed.
    # Alternatively, DRF handles this nicely with PrimaryKeyRelatedField (default).
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['data_source_details'] = DataSourceSerializer(instance.data_source).data
        response['template_details'] = ReportTemplateSerializer(instance.template).data
        response['schedule_details'] = ScheduleSerializer(instance.schedule).data
        
        # Fetch next run time from APScheduler
        from django_apscheduler.models import DjangoJob
        job_id_str = f"job_{instance.id}"
        scheduler_job = DjangoJob.objects.filter(id=job_id_str).first()
        response['next_run_time'] = scheduler_job.next_run_time if scheduler_job else None
        
        return response

class ExecutionLogSerializer(serializers.ModelSerializer):
    job_name = serializers.SerializerMethodField()
    
    def get_job_name(self, obj):
        return obj.job.name if obj.job else obj.job_name_snapshot
    
    class Meta:
        model = ExecutionLog
        fields = '__all__'

    def to_representation(self, instance):
        response = super().to_representation(instance)
        if instance.job:
            response['job_details'] = JobSerializer(instance.job).data
        else:
            response['job_details'] = None
        return response
