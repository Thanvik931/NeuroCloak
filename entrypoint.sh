#!/bin/bash

set -e

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until nc -z mongodb 27017; do
    echo "MongoDB is unavailable - sleeping"
    sleep 2
done
echo "MongoDB is up - continuing..."

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until nc -z redis 6379; do
    echo "Redis is unavailable - sleeping"
    sleep 2
done
echo "Redis is up - continuing..."

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if not exists
echo "Creating superuser if not exists..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@neurocloak.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print("Superuser created successfully")
else:
    print("Superuser already exists")
EOF

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn neurocloak.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class sync \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --keep-alive 2 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
