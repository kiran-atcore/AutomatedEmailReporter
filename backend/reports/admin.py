from django.contrib import admin
from .models import DataSource, ReportTemplate, Schedule, Job, ExecutionLog

@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'connection_type', 'owner')
    search_fields = ('name', 'connection_type')
    list_filter = ('connection_type',)

@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'layout', 'owner')
    search_fields = ('name',)
    list_filter = ('layout',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('name', 'frequency', 'time_of_day', 'owner')
    search_fields = ('name', 'frequency')
    list_filter = ('frequency',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('name', 'data_source', 'template', 'schedule', 'is_active', 'owner', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active', 'created_at')

@admin.register(ExecutionLog)
class ExecutionLogAdmin(admin.ModelAdmin):
    list_display = ('job', 'status', 'executed_at')
    search_fields = ('job__name', 'status')
    list_filter = ('status', 'executed_at')
