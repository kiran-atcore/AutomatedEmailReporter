#!/bin/bash
# Apply database migrations
python manage.py migrate

# Start the background APScheduler process in the background
python manage.py run_scheduler &

# Start the Gunicorn web server in the foreground
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
