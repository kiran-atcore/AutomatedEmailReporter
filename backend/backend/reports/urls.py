from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DataSourceViewSet, ReportTemplateViewSet, ScheduleViewSet,
    JobViewSet, ExecutionLogViewSet, dashboard_metrics, mock_data_view,
    analytics_data, clear_analytics
)

router = DefaultRouter()
router.register(r'datasources', DataSourceViewSet, basename='datasource')
router.register(r'templates', ReportTemplateViewSet, basename='template')
router.register(r'schedules', ScheduleViewSet, basename='schedule')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'logs', ExecutionLogViewSet, basename='log')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_metrics, name='dashboard-metrics'),
    path('analytics/', analytics_data, name='analytics-data'),
    path('analytics/clear/', clear_analytics, name='clear-analytics'),
    path('mock-data/', mock_data_view, name='mock-data'),
]
