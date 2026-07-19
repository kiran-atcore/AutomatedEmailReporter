from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from reports.models import DataSource, ReportTemplate, Schedule, Job, ExecutionLog
from django.utils import timezone
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with dummy Data Sources, Templates, Schedules, and Jobs'

    def handle(self, *args, **kwargs):
        # We need a user to own these items
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR('No users found! Please create a user first (e.g. runserver and register via UI).'))
            return

        self.stdout.write(self.style.SUCCESS(f'Seeding data for user: {user.email}'))

        # Seed Data Sources
        ds1, _ = DataSource.objects.get_or_create(
            name="Shopify API", connection_type="rest", endpoint="https://api.shopify.com/v1/", owner=user
        )
        ds2, _ = DataSource.objects.get_or_create(
            name="Yahoo Finance", connection_type="rest", endpoint="https://api.yahoofinance.com/", owner=user
        )
        ds3, _ = DataSource.objects.get_or_create(
            name="Production PostgreSQL", connection_type="sql", endpoint="postgres://db.example.com", owner=user
        )

        # Seed Templates
        t1, _ = ReportTemplate.objects.get_or_create(
            name="Daily E-Commerce Summary", layout="Grid", owner=user
        )
        t2, _ = ReportTemplate.objects.get_or_create(
            name="Weekly IT Health Report", layout="Document", owner=user
        )

        # Seed Schedules
        s1, _ = Schedule.objects.get_or_create(
            name="Morning Sales Brief", frequency="daily", time_of_day=datetime.time(7, 0), recipients="team@example.com", owner=user
        )
        s2, _ = Schedule.objects.get_or_create(
            name="Weekly Executive Summary", frequency="weekly", time_of_day=datetime.time(9, 0), recipients="ceo@example.com", owner=user
        )

        # Seed Jobs
        job1, _ = Job.objects.get_or_create(
            name="Morning E-Commerce Brief", data_source=ds1, template=t1, schedule=s1, owner=user, is_active=True
        )
        job2, _ = Job.objects.get_or_create(
            name="Executive Server Report", data_source=ds3, template=t2, schedule=s2, owner=user, is_active=False
        )

        # Seed Execution Logs
        ExecutionLog.objects.get_or_create(
            job=job1, status='success', executed_at=timezone.now() - datetime.timedelta(days=1)
        )
        ExecutionLog.objects.get_or_create(
            job=job1, status='success', executed_at=timezone.now() - datetime.timedelta(days=2)
        )
        ExecutionLog.objects.get_or_create(
            job=job2, status='failed', error_message="Database timeout", executed_at=timezone.now() - datetime.timedelta(days=3)
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded dummy data!'))
