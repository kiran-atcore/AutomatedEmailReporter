import logging
from django.conf import settings
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management.base import BaseCommand
from django_apscheduler.jobstores import DjangoJobStore
import django
from reports.models import Job
from reports.engine import execute_job

logger = logging.getLogger(__name__)

# Must be module-level so APScheduler can serialize it
def sync_db_jobs(scheduler):
    register_jobs(scheduler)

def register_jobs(scheduler):
    # Fetch active jobs
    active_jobs = Job.objects.filter(is_active=True)
    
    # First, get all current job IDs from DB
    from django_apscheduler.models import DjangoJob
    
    for job in active_jobs:
        schedule_rule = job.schedule
        tz = schedule_rule.timezone if hasattr(schedule_rule, 'timezone') and schedule_rule.timezone else settings.TIME_ZONE
        
        if schedule_rule.frequency == 'cron':
            if not schedule_rule.cron_expression:
                print(f"Skipping Job {job.name}: Missing cron_expression")
                continue
            trigger = CronTrigger.from_crontab(schedule_rule.cron_expression, timezone=tz)
            print(f"Registered Job: {job.name} -> {schedule_rule.frequency} '{schedule_rule.cron_expression}'")
        else:
            if not schedule_rule.time_of_day:
                print(f"Skipping Job {job.name}: Missing time_of_day")
                continue
            hour = schedule_rule.time_of_day.hour
            minute = schedule_rule.time_of_day.minute
            
            if schedule_rule.frequency == 'hourly':
                trigger = CronTrigger(minute=minute, timezone=tz)
            elif schedule_rule.frequency == 'daily':
                trigger = CronTrigger(hour=hour, minute=minute, timezone=tz)
            elif schedule_rule.frequency == 'weekly':
                trigger = CronTrigger(day_of_week='mon', hour=hour, minute=minute, timezone=tz)
            else:
                trigger = CronTrigger(hour=hour, minute=minute, timezone=tz)
            print(f"Registered Job: {job.name} -> {schedule_rule.frequency} at {hour}:{minute}")

        job_id = f"job_{job.id}"
        
        scheduler.add_job(
            execute_job,
            trigger=trigger,
            id=job_id,
            max_instances=1,
            replace_existing=True,
            args=[job.id],
        )

class Command(BaseCommand):
    help = "Runs APScheduler."

    def handle(self, *args, **options):
        scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Clear existing jobs to ensure clean state on startup
        from django_apscheduler.models import DjangoJob
        DjangoJob.objects.all().delete()

        # Register jobs initially
        register_jobs(scheduler)
        
        # Add an internal polling job using a MemoryJobStore to auto-sync DB jobs every 30 seconds.
        # This allows jobs created in the web UI to be automatically picked up by this worker!
        from apscheduler.jobstores.memory import MemoryJobStore
        scheduler.add_jobstore(MemoryJobStore(), "memory")
        scheduler.add_job(
            sync_db_jobs,
            'interval',
            seconds=30,
            args=[scheduler],
            id='internal_db_sync',
            jobstore='memory',
            replace_existing=True
        )

        try:
            self.stdout.write(self.style.SUCCESS("Starting scheduler... Press Ctrl+C to exit"))
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            pass
        finally:
            self.stdout.write(self.style.WARNING("Stopping scheduler..."))
            try:
                scheduler.shutdown(wait=False)
            except Exception:
                pass
            self.stdout.write(self.style.SUCCESS("Scheduler shut down successfully!"))
            import sys
            sys.exit(0)
            import sys
            sys.exit(0)
