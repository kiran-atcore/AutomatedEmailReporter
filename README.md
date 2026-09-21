# 📊 Automated Email Reporter

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-6.0+-092E20?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.17-red?style=flat-square)](https://www.django-rest-framework.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20LLM-orange?style=flat-square)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Automated Email Reporter** is an end-to-end, production-ready reporting automation platform. It connects to diverse data sources, generates beautifully styled PDF reports with dynamic charts and Groq LLM executive summaries, and delivers them on recurring schedules directly to stakeholder inboxes.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment Guide](#-deployment-guide)
- [Real-World Use Cases](#-real-world-use-cases)
- [License](#-license)

---

## 🌟 Overview

Manual reporting is time-consuming, prone to human error, and repetitive. Teams spend hours every week pulling metrics from APIs, querying databases, pasting numbers into spreadsheets, drafting summaries, and sending emails.

**Automated Email Reporter** automates this entire lifecycle into a single pipeline:

1. **Ingest**: Fetches live data from REST APIs, SQL databases, Google Sheets, or Airtable.
2. **Synthesize**: Evaluates data, computes statistics, and generates concise AI summaries using Groq LLM models.
3. **Render**: Builds pixel-perfect, branded PDF documents complete with data tables, company logos, custom color schemes, and Matplotlib data visualizations (bar & pie charts).
4. **Schedule & Dispatch**: Executes recurrent jobs via background workers (APScheduler) and emails reports as multi-part HTML/PDF attachments to designated distribution lists.
5. **Monitor**: Tracks job health, execution statuses, diagnostic error traces, and report archives through an interactive web dashboard.

---

## ✨ Key Features

### 🔌 Flexible Multi-Source Data Ingestion
- **REST APIs**: Connect to any HTTP JSON endpoint with custom bearer tokens or API headers, automatic wrapper unwrapping, and pagination support.
- **Direct SQL Databases**: Query PostgreSQL, MySQL, SQLite, or SQL Server directly via SQLAlchemy connection strings.
- **Cloud Spreadsheets & Tables**: Seamless integration with Google Sheets and Airtable.
- **Field-Level Encryption**: Sensitive credentials and auth tokens are encrypted at rest using Django field encryption.

### 📄 Intelligent PDF Report Generation
- **ReportLab Engine**: Fast, programmatic PDF generation with customizable page layouts, headers, and footers.
- **Branded Styling**: Configure company branding logos, primary accent colors, and custom layout options per template.
- **Dynamic Data Visualizations**: Automatically generate and embed high-resolution Matplotlib charts (bar charts, pie charts) directly into the PDF.
- **Smart Formatting**: Automatic table formatting, currency/date parsing, and overflow handling.

### 🤖 AI-Powered Executive Summaries
- **Groq LLM Integration**: Automatically generate executive summaries and key takeaways from raw table records.
- **Custom AI Directives**: Tailor the AI tone and focus via custom prompts per report template (e.g., *"Highlight revenue anomalies and cost overruns"*).

### ⏱️ Automated Background Scheduling
- **APScheduler Engine**: Persistent job scheduling integrated directly with Django models.
- **Custom Frequencies**: Run reports hourly, daily, weekly, monthly, or with standard 5-field cron syntax.
- **Timezone Awareness**: Schedule execution based on local stakeholder timezones.
- **Multi-Recipient Delivery**: Distribute reports to single users or multi-stakeholder email lists.

### 📊 Modern Dashboard & Operational Analytics
- **Interactive UI**: Built with Next.js 16 (App Router), React 19, TypeScript, and Bootstrap 5.
- **Execution Diagnostics**: Comprehensive run logs with status indicators (`success` / `failed`), error logs, and one-click failure resolution.
- **Report Archives**: Download and review historical PDF outputs directly from the browser.
- **Visual Metrics**: Monitor email dispatch volumes, failure rates, and active jobs via Recharts.

### 🔐 Authentication & Security
- **JWT Authentication**: Secure stateless authentication using `djangorestframework-simplejwt`.
- **Google OAuth 2.0**: Single-click sign-in via Google accounts.
- **Owner-Isolated Resources**: Strict tenancy checks ensuring users only access their own data sources, templates, and jobs.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |   Next.js Frontend    |
                                  | (React 19 / Bootstrap)|
                                  +-----------+-----------+
                                              |
                                     REST API / JWT Auth
                                              |
                                              v
                                  +-----------------------+
                                  |     Django 6 API      |
                                  |   (Django REST / DRF) |
                                  +-----------+-----------+
                                              |
                       +----------------------+----------------------+
                       |                      |                      |
                       v                      v                      v
             +------------------+   +------------------+   +------------------+
             |   Data Sources   |   |   Report Engine  |   |   APScheduler    |
             |------------------|   |------------------|   |------------------|
             | • REST Endpoints |   | • ReportLab PDF  |   | • Cron schedules |
             | • SQL Databases  |   | • Matplotlib     |   | • Interval runs  |
             | • Google Sheets  |   | • Groq LLM AI    |   | • Event triggers |
             | • Airtable       |   +--------+---------+   +--------+---------+
             +------------------+            |                      |
                                             v                      v
                                    +------------------+   +------------------+
                                    |  Email Delivery  |   | Database Storage |
                                    |------------------|   |------------------|
                                    | • Brevo Anymail  |   | • Supabase / PG  |
                                    | • SMTP Fallback  |   | • Execution Logs |
                                    +------------------+   +------------------+
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Bootstrap 5.3](https://getbootstrap.com/), [Bootstrap Icons](https://icons.getbootstrap.com/), Custom CSS modules
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Yup](https://github.com/jquense/yup)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Authentication**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google), [jwt-decode](https://github.com/auth0/jwt-decode)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [Django 6.0+](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- **Authentication**: `djangorestframework-simplejwt`, Google Auth
- **Scheduling**: [APScheduler](https://apscheduler.readthedocs.io/) & [django-apscheduler](https://github.com/jcass77/django-apscheduler)
- **Document & Graphic Generation**: [ReportLab](https://www.reportlab.com/), [Matplotlib](https://matplotlib.org/), [Pillow](https://python-pillow.org/)
- **AI Synthesis**: [Groq Python SDK](https://github.com/groq/groq-python)
- **Database ORM & Querying**: Django ORM, [SQLAlchemy](https://www.sqlalchemy.org/)
- **Email Delivery**: [django-anymail](https://anymail.dev/) (Brevo / Sendinblue), standard SMTP
- **Production Server**: [Gunicorn](https://gunicorn.org/), [WhiteNoise](https://whitenoise.readthedocs.io/)

### Infrastructure & Storage
- **Database**: [PostgreSQL](https://www.postgresql.org/) / [Supabase](https://supabase.com/)
- **Object Storage**: Supabase Storage / Local File Storage
- **Hosting**: [Render](https://render.com/) (Web Service + Background Scheduler) & [Vercel](https://vercel.com/)

---

## 📁 Project Directory Structure

```text
AutomatedEmailReporter/
├── backend/                        # Django backend application
│   ├── api/                        # Shared API views, router, and utilities
│   ├── config/                     # Django core settings, WSGI, storage backends
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── reports/                    # Core reporting engine & business logic
│   │   ├── engine.py               # Data ingestion, PDF generation, AI & email logic
│   │   ├── models.py               # DataSource, ReportTemplate, Schedule, Job, ExecutionLog
│   │   ├── serializers.py          # DRF serializers
│   │   ├── views.py                # REST endpoints and manual triggers
│   │   └── management/commands/    # Custom CLI commands (e.g. run_scheduler)
│   ├── users/                      # Custom user model & JWT/Google authentication
│   ├── generate_dummy_db.py        # Seed script for mock local testing data
│   ├── manage.py                   # Django management utility
│   ├── requirements.txt            # Python dependencies
│   └── start.sh                    # Production launch script
├── frontend/                       # Next.js frontend application
│   ├── public/                     # Static assets and icons
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/             # Login & Registration pages
│   │   │   ├── (main)/             # Protected dashboard & management pages
│   │   │   │   ├── Dashboard/      # Main stats and active jobs overview
│   │   │   │   ├── DataSources/    # Connected data sources listing & config
│   │   │   │   ├── Templates/      # PDF template builder & styling
│   │   │   │   ├── Scheduler/      # Cron & interval schedule manager
│   │   │   │   ├── Analytics/      # Performance metrics & logs
│   │   │   │   └── ...             # Detail & edit views
│   │   │   ├── globals.css         # Global design tokens and utilities
│   │   │   └── layout.tsx          # Root layout and theme providers
│   │   └── components/             # Reusable UI components & navigation
│   ├── package.json                # Frontend dependencies and scripts
│   └── tsconfig.json               # TypeScript configuration
├── build.sh                        # Render deployment build script
├── render.yaml                     # Render infrastructure blueprint
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: `3.11` or `3.12`
- **Node.js**: `18.x` or `20.x`
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Database**: PostgreSQL (or default SQLite for local development)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the `backend/` directory (see [Environment Variables](#backend-environment-variables) below).

5. **Apply database migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**:
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the background scheduler (Terminal 1)**:
   ```bash
   python manage.py run_scheduler
   ```

8. **Start the Django development server (Terminal 2)**:
   ```bash
   python manage.py runserver 8000
   ```
   The backend API will be live at `http://127.0.0.1:8000/`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```

4. **Run the Next.js development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable | Required | Description | Example / Default |
|:---|:---:|:---|:---|
| `SECRET_KEY` | Yes | Django cryptographic signing secret | `django-insecure-...` |
| `DEBUG` | No | Enables debug mode (`True` / `False`) | `True` |
| `ALLOWED_HOSTS` | No | Comma-separated allowed hostnames | `localhost,127.0.0.1,.onrender.com` |
| `DATABASE_URL` | No | PostgreSQL database connection string | `postgresql://user:pass@host:5432/db` (defaults to SQLite) |
| `GROQ_API_KEY` | Optional | API key for Groq LLM executive summaries | `gsk_...` |
| `BREVO_API_KEY` | Optional | API key for Brevo transactional email | `xkeysib-...` |
| `DEFAULT_FROM_EMAIL` | Optional | Verified sender email address | `reports@yourdomain.com` |
| `EMAIL_HOST` | Optional | SMTP Host (if not using Brevo) | `smtp.gmail.com` |
| `EMAIL_PORT` | Optional | SMTP Port | `587` |
| `EMAIL_USE_TLS` | Optional | Enable TLS for SMTP | `True` |
| `EMAIL_HOST_USER` | Optional | SMTP sender address | `user@gmail.com` |
| `EMAIL_HOST_PASSWORD`| Optional | SMTP app password | `xxxx-xxxx-xxxx-xxxx` |
| `SUPABASE_URL` | Optional | Supabase project URL for cloud file storage | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Optional | Supabase service key for cloud storage | `eyJhbGciOi...` |

### Frontend Environment Variables (`frontend/.env.local`)

| Variable | Required | Description | Example / Default |
|:---|:---:|:---|:---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for the Django REST API | `http://127.0.0.1:8000/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Web Client ID | `xxxx.apps.googleusercontent.com` |

---

## 📡 API Reference

All protected endpoints require a valid JWT token in the `Authorization` header:  
`Authorization: Bearer <access_token>`

### Authentication
- `POST /api/users/register/` - Create a new user account
- `POST /api/users/login/` - Obtain JWT access and refresh tokens
- `POST /api/users/token/refresh/` - Refresh an expired access token
- `POST /api/users/google-login/` - Authenticate using Google OAuth token

### Data Sources
- `GET /api/reports/sources/` - List user's connected data sources
- `POST /api/reports/sources/` - Register a new data source (REST API, SQL, Sheets, Airtable)
- `GET /api/reports/sources/<id>/` - Retrieve data source details
- `PUT /api/reports/sources/<id>/` - Update data source credentials or endpoint
- `DELETE /api/reports/sources/<id>/` - Delete data source

### Templates
- `GET /api/reports/templates/` - List report templates
- `POST /api/reports/templates/` - Create a template (layout, branding logo, colors, chart type, AI prompt)
- `GET /api/reports/templates/<id>/` - Retrieve template configuration
- `PUT /api/reports/templates/<id>/` - Update template configuration
- `DELETE /api/reports/templates/<id>/` - Delete template

### Schedules
- `GET /api/reports/schedules/` - List configured schedules
- `POST /api/reports/schedules/` - Create new schedule (frequency, cron expression, timezone, recipients)
- `PUT /api/reports/schedules/<id>/` - Update schedule frequency or recipients
- `DELETE /api/reports/schedules/<id>/` - Delete schedule

### Jobs & Execution
- `GET /api/reports/jobs/` - List all configured jobs
- `POST /api/reports/jobs/` - Link a data source, template, and schedule into an active job
- `POST /api/reports/jobs/<id>/run/` - Manually trigger immediate job execution
- `PATCH /api/reports/jobs/<id>/toggle/` - Enable or disable an automated job
- `GET /api/reports/logs/` - Retrieve execution logs and error diagnostics
- `POST /api/reports/logs/<id>/resolve/` - Mark a failed run as resolved

---

## 🚢 Deployment Guide

### Deploying the Backend on Render
The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint and [`build.sh`](./build.sh):

1. Connect your repository to **Render**.
2. Deploy as a **Web Service** using the blueprint or with the following parameters:
   - **Build Command**: `./build.sh`
   - **Start Command**:
     ```bash
     cd backend && python manage.py run_scheduler & gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
     ```
3. Configure your production environment variables (`DATABASE_URL`, `SECRET_KEY`, `GROQ_API_KEY`, etc.) in the Render dashboard.

### Deploying the Frontend on Vercel
1. Import the repository into **Vercel**.
2. Set the **Root Directory** to `frontend`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
4. Deploy!

---

## 💡 Real-World Use Cases

| Scenario | Data Source | Output & Visuals | Delivery Schedule |
|:---|:---|:---|:---|
| **E-Commerce Daily Brief** | Shopify / WooCommerce API | Revenue total, top 3 selling SKUs, conversion rates with Bar Chart | Every morning at 7:00 AM |
| **DevOps Infrastructure Health** | Datadog / AWS CloudWatch | CPU spikes, downtime incidents, memory limits, and error table | Every Monday at 8:00 AM |
| **Executive Financial Summary** | Internal PostgreSQL Database | Net margin, department expenses, Pie Chart breakdown, and Groq AI summary | Last Friday of every month |
| **Client Marketing Report** | Google Sheets / Airtable | Ad spend, impressions, CTR, and branded agency logo with custom palette | Weekly on Fridays at 5:00 PM |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it in commercial and open-source projects.
