from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import DataSource, ReportTemplate, Schedule, Job, ExecutionLog
from .serializers import (
    DataSourceSerializer, ReportTemplateSerializer, ScheduleSerializer,
    JobSerializer, ExecutionLogSerializer
)

class DataSourceViewSet(viewsets.ModelViewSet):
    serializer_class = DataSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DataSource.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        endpoint = request.data.get('endpoint')
        auth_token = request.data.get('auth_token')
        connection_type = request.data.get('connection_type', 'api')
        config = request.data.get('config', {})
        
        class MockDataSource:
            pass
            
        ds = MockDataSource()
        ds.endpoint = endpoint
        ds.auth_token = auth_token
        ds.connection_type = connection_type
        ds.config = config
        
        from .engine import fetch_data
        try:
            fetch_data(ds)
            return Response({"status": "success", "message": "Connection successful!"})
        except Exception as e:
            return Response({"status": "failed", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def generate_sql(self, request):
        endpoint = request.data.get('endpoint')
        prompt = request.data.get('prompt')
        
        if not endpoint or not prompt:
            return Response({"status": "failed", "message": "Endpoint and prompt are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        import os
        from groq import Groq
        from sqlalchemy import create_engine, inspect
        from sqlalchemy.exc import SQLAlchemyError
        
        try:
            # 1. Connect and inspect schema
            engine = create_engine(endpoint)
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            schema_info = []
            for table in tables:
                columns = inspector.get_columns(table)
                col_names = [col['name'] for col in columns]
                schema_info.append(f"Table '{table}' with columns: {', '.join(col_names)}")
                
            schema_text = "\n".join(schema_info)
            if not schema_text:
                schema_text = "No tables found in database."
                
            # 2. Call Groq
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                return Response({"status": "failed", "message": "GROQ_API_KEY is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            client = Groq(api_key=api_key)
            system_prompt = (
                "You are an expert SQL developer. "
                "Given a natural language request and a database schema, write the exact SQL query to satisfy the request. "
                "Return ONLY the raw SQL query. Do not wrap it in markdown blockquotes (e.g., no ```sql). "
                "Do not include any explanations."
            )
            
            user_message = f"Schema:\n{schema_text}\n\nRequest: {prompt}\n\nSQL Query:"
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=500
            )
            
            sql_query = chat_completion.choices[0].message.content.strip()
            # Clean up markdown if AI ignored instructions
            if sql_query.startswith("```sql"):
                sql_query = sql_query[6:]
            if sql_query.startswith("```"):
                sql_query = sql_query[3:]
            if sql_query.endswith("```"):
                sql_query = sql_query[:-3]
                
            return Response({"status": "success", "query": sql_query.strip()})
            
        except SQLAlchemyError as e:
            return Response({"status": "failed", "message": f"Could not connect to database to read schema: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"status": "failed", "message": f"AI Generation Failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = ReportTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReportTemplate.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Schedule.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['post'])
    def generate_cron(self, request):
        prompt = request.data.get('prompt')
        
        if not prompt:
            return Response({"status": "failed", "message": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        import os
        from groq import Groq
        
        try:
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                return Response({"status": "failed", "message": "GROQ_API_KEY is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            client = Groq(api_key=api_key)
            system_prompt = (
                "You are an expert cron string generator. "
                "Given a natural language request for a schedule, output ONLY the 5-part cron expression (e.g., '0 9 * * 1-5'). "
                "Do not include any explanations, backticks, or extra text."
            )
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=20
            )
            
            cron_expression = chat_completion.choices[0].message.content.strip()
            # Clean up just in case
            cron_expression = cron_expression.replace("`", "")
            
            return Response({"cron": cron_expression})
        except Exception as e:
            return Response({"status": "failed", "message": f"Failed to generate cron: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        job = self.get_object()
        from .engine import execute_job
        import threading
        
        if request.query_params.get('sync') == 'true':
            try:
                execute_job(job.id)
                return Response({"message": f"Job {job.name} triggered and finished successfully."})
            except Exception as e:
                return Response({"message": f"Job execution failed: {str(e)}"}, status=400)
                
        # Run it in a background thread so the API returns instantly
        thread = threading.Thread(target=execute_job, args=(job.id,))
        thread.start()
        
        return Response({"message": f"Job {job.name} triggered successfully."})

class ExecutionLogViewSet(viewsets.ModelViewSet):
    serializer_class = ExecutionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ExecutionLog.objects.filter(job__owner=self.request.user)
        if self.request.query_params.get('include_deleted_from_reports') != 'true':
            qs = qs.filter(is_deleted_from_reports=False)
        if self.request.query_params.get('include_archived') != 'true':
            qs = qs.filter(is_archived=False)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(job_name_snapshot__icontains=search) | Q(job__name__icontains=search) | Q(status__icontains=search))

        ordering = self.request.query_params.get('ordering', '-executed_at')
        if ordering:
            qs = qs.order_by(ordering)
            
        return qs

    def destroy(self, request, *args, **kwargs):
        try:
            instance = ExecutionLog.objects.get(id=kwargs['pk'], job__owner=self.request.user)
        except ExecutionLog.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        if request.query_params.get('permanent') == 'true':
            instance.is_deleted_from_reports = True
            instance.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            instance.is_archived = True
            instance.save()
            return Response({"message": "Log archived successfully."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        base_qs = ExecutionLog.objects.filter(job__owner=request.user)
        if request.query_params.get('permanent') == 'true':
            base_qs.update(is_deleted_from_reports=True)
            return Response({"message": "Logs permanently removed from reports list."})
        else:
            base_qs.update(is_archived=True)
            return Response({"message": "All logs cleared from dashboard successfully."})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_metrics(request):
    user = request.user
    
    # Calculate metrics
    # Total reports sent counts un-deleted reports (matches Total Reports List)
    total_reports_sent = ExecutionLog.objects.filter(job__owner=user, status='success', is_deleted_from_reports=False).count()
    active_jobs = Job.objects.filter(owner=user, is_active=True).count()
    inactive_jobs = Job.objects.filter(owner=user, is_active=False).count()
    
    # Failed jobs on dashboard counts unarchived, unresolved failures
    failed_jobs = ExecutionLog.objects.filter(
        job__owner=user, 
        status='failed', 
        is_archived=False, 
        is_resolved_failure=False
    ).count()
    
    # Get recent logs (unarchived)
    recent_logs = ExecutionLog.objects.filter(job__owner=user, is_archived=False).order_by('-executed_at')[:5]
    recent_logs_data = ExecutionLogSerializer(recent_logs, many=True).data

    return Response({
        'total_reports_sent': total_reports_sent,
        'total_jobs': active_jobs + inactive_jobs,
        'active_jobs': active_jobs,
        'inactive_jobs': inactive_jobs,
        'failed_jobs': failed_jobs,
        'recent_logs': recent_logs_data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_data(request):
    from django.utils import timezone
    from datetime import timedelta
    from django.db.models import Count
    from django.db.models.functions import TruncDate
    
    user = request.user
    
    # Base queryset for analytics
    analytics_qs = ExecutionLog.objects.filter(job__owner=user, is_deleted_from_analytics=False)
    
    # 1. Success vs Failure Rate (Pie Chart)
    success_count = analytics_qs.filter(status='success').count()
    failed_count = analytics_qs.filter(status='failed').count()
    pie_data = [
        {"name": "Success", "value": success_count},
        {"name": "Failed", "value": failed_count},
    ]
    
    # 2. Jobs run per day over last 7 days (Line Chart)
    seven_days_ago = timezone.now() - timedelta(days=7)
    logs_last_7_days = analytics_qs.filter(executed_at__gte=seven_days_ago)
    
    # Group by date
    daily_counts = logs_last_7_days.annotate(date=TruncDate('executed_at')).values('date').annotate(count=Count('id')).order_by('date')
    
    # Ensure all 7 days have a record even if 0
    line_data = []
    for i in range(7):
        d = (timezone.now() - timedelta(days=6-i)).date()
        date_str = d.strftime('%Y-%m-%d')
        # Find if we have a count for this date
        count = next((item['count'] for item in daily_counts if item['date'] == d), 0)
        line_data.append({"date": date_str, "jobs": count})
        
    # 3. Active Data Sources by Reports Sent (Bar Chart)
    sources = DataSource.objects.filter(owner=user)
    bar_data = []
    for source in sources:
        report_count = analytics_qs.filter(job__data_source=source).count()
        bar_data.append({"name": source.name, "reports": report_count})
        
    # Sort descending by report count and keep top 5
    bar_data = sorted(bar_data, key=lambda x: x['reports'], reverse=True)[:5]
        
    return Response({
        "pieData": pie_data,
        "lineData": line_data,
        "barData": bar_data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_analytics(request):
    ExecutionLog.objects.filter(job__owner=request.user).update(is_deleted_from_analytics=True)
    return Response({"message": "Analytics data cleared successfully."})

@api_view(['GET'])
def mock_data_view(request):
    """
    A mock API endpoint to generate realistic JSON data for the PDF engine.
    """
    import random
    from django.utils import timezone
    
    # Generate some slightly random data for realism
    revenue = f"${random.randint(4000, 15000):,}"
    users = random.randint(50, 300)
    uptime = f"{random.uniform(99.0, 99.99):.2f}%"
    tickets = random.randint(10, 100)
    
    return Response([
        {"Metric": "Sales Revenue", "Value": revenue, "Status": "Good"},
        {"Metric": "New Signups", "Value": str(users), "Status": "Good"},
        {"Metric": "Server Uptime", "Value": uptime, "Status": "Healthy"},
        {"Metric": "Open Support Tickets", "Value": str(tickets), "Status": "Warning" if tickets > 50 else "Good"},
    ])
