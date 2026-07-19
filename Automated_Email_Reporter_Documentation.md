# Automated Email Reporter - Project Documentation

## 1. The Use of This Website
The purpose of this web application is to act as a **Reporting Automation Dashboard**. Instead of manually pulling data, writing a report, formatting it, and emailing it every day or week, users can log into this website to set up a "Job."

The website handles three core responsibilities in the background:
*   **Data Ingestion:** Connecting to external APIs, databases, or web scrapers to gather raw data.
*   **Document Generation:** Formatting that raw data into a clean, readable PDF document using templates.
*   **Automated Delivery:** Scheduling the delivery of that PDF to a specific list of email addresses at predetermined intervals.

## 2. Front-End Structure & Page Descriptions
To make this application intuitive, the front end should be divided into a few distinct pages, keeping the user experience simple and focused.

*   **Dashboard (Home Page):**
    *   *Description:* A high-level overview of the user's reporting activities.
    *   *Elements:* Metrics showing total reports sent this month, recent success/failure logs, and a list of active scheduled jobs.
*   **Data Sources Page:**
    *   *Description:* Where the user configures where the data is coming from.
    *   *Elements:* Input fields for API keys, database connection strings, or URLs to fetch data from.
*   **Report Template Builder:**
    *   *Description:* A UI to define what the PDF will look like.
    *   *Elements:* Text boxes for a report title, dropdowns to select data points to include (e.g., charts, tables), and an option to upload a company logo.
*   **Scheduler & Distribution Page:**
    *   *Description:* The control center for the automation.
    *   *Elements:* A list of recipient email addresses, and a frequency dropdown (e.g., Daily at 8:00 AM, Every Friday at 5:00 PM).
*   **Execution Logs:**
    *   *Description:* A diagnostic page for troubleshooting.
    *   *Elements:* A table showing the timestamp of every attempted email send, along with a "Success" or "Error" status code.

## 3. How to Implement for Free ($0 Tech Stack)
You can build and host this entire system without spending any money by leveraging generous free tiers from modern cloud providers.

### The Front-End (UI)
*   **Framework:** Next.js & Bootstrap (can also use Framer Motion).

### The Back-End (The Python Script Logic)
*   **Framework:** Django with Django REST Framework (DRF).
*   **PDF Generation:** Use free open-source Python libraries like ReportLab or FPDF.

### The Database & Storage
*   **Database:** Supabase (an open-source Firebase alternative).

### Email & Scheduling Automation
*   **Email Sending:** Use a service like Resend or SendGrid (which offer ~100 free emails per day).
*   **Task Scheduler:** Use Cron-job.org (a free external service). You can set it to automatically ping a specific URL on your backend (e.g., `yourapp.com/api/run-daily-reports`) at exactly 8:00 AM every day to trigger your Python script.

## 4. Use Cases with Multiple Examples
This application is highly versatile. Here are a few practical examples of how different users could utilize it:

**Example 1: E-Commerce Daily Sales Summary**
*   **Data Fetch:** The script hits the Shopify or WooCommerce API.
*   **PDF Generation:** Creates a one-page PDF showing total revenue, top 3 selling products, and total visitor count for the previous day.
*   **Email Automation:** Emails the PDF to the store owner and the marketing manager every morning at 7:00 AM so they can review yesterday's performance over breakfast.

**Example 2: IT Server Health Monitor**
*   **Data Fetch:** Pulls system logs and uptime metrics from AWS, Datadog, or a custom server script.
*   **PDF Generation:** Formats a report highlighting any downtime events, CPU usage spikes, or error codes.
*   **Email Automation:** Emails the weekly summary to the DevOps engineering team every Monday morning to help them plan maintenance tasks.

**Example 3: Personal Finance & Stock Tracker**
*   **Data Fetch:** Uses a free financial API (like Alpha Vantage or Yahoo Finance) to pull the current prices of a user's specific stock portfolio.
*   **PDF Generation:** Creates a visual report showing the week's gains, losses, and overall portfolio value.
*   **Email Automation:** Sends the report directly to the user's personal email every Friday after the stock market closes.

**Example 4: Weather & Agricultural Alert**
*   **Data Fetch:** Fetches a 7-day weather forecast and soil moisture data from a weather API for a specific farm location.
*   **PDF Generation:** Generates a report indicating high-risk days for frost or drought.
*   **Email Automation:** Sends a daily alert to the farm manager so they can schedule irrigation and staff accordingly.

## 5. The Three Primary Methods of Pulling Data
Depending on where the information lives, the script will use one of these three mechanisms to grab it:

*   **RESTful APIs (The Most Common Method):** If you are pulling data from a modern service (like Shopify, Jira, Google Analytics, or a weather service), the script acts as a digital messenger. It sends an HTTP request (usually a `GET` request) directly to the service’s server, asking for specific data. The server replies by sending the data back, typically in a clean, structured format called JSON.
*   **Direct Database Queries:** If the data lives internally within your own company (like customer records or application logs), the script connects directly to your database (e.g., PostgreSQL, MySQL, MongoDB). The script logs in using connection credentials and executes a query (like `SELECT * FROM daily_sales`), pulling the raw rows of data directly into the script's memory.
*   **Web Scraping (The Fallback Method):** If the data exists on a website but the site does not offer an API or database access, the script must "read" the website like a human would. Using Python libraries (like BeautifulSoup or Selenium), the script downloads the webpage's raw HTML code, searches for specific tags (like finding the third row of a specific table), and extracts the text.

## 6. The Step-by-Step Mechanism
Regardless of which method is used above, the actual mechanism executed by the Python script generally follows a strict, four-step pipeline:

### Step 1: The Trigger & Initialization
The script is resting on a server until a scheduler (like a Cron job or a cloud scheduler) wakes it up at the predetermined time. Once awake, the script loads its environment variables. This is crucial because it securely loads the secret API keys, database passwords, or authentication tokens required to access the data without hardcoding them into the script itself.

### Step 2: The Handshake (Authentication)
The script reaches out to the target data source. Before the source hands over any data, it checks the script's credentials.
*   **Mechanism:** The script includes a "Header" in its network request containing the secret API key or OAuth token. If the key matches, the server grants access.

### Step 3: The Request and Retrieval
The script asks for exactly what it needs to build the report.
*   **Mechanism:** Using a library like Python's `requests`, the script specifies parameters. For example, it doesn't just ask for "all sales." It asks for `?start_date=2026-07-17&end_date=2026-07-18`. The external server processes this request and transmits the raw data payload back to your server over the internet.

### Step 4: Parsing and Transformation
The data arrives, but it is raw and unformatted. The script must parse this data so it can be injected into the PDF template.
*   **Mechanism:** If the data comes back as a JSON string, the script parses it into native Python dictionaries or lists. Often, libraries like Pandas are used here to convert the raw data into a "DataFrame" (a digital spreadsheet inside the code). This allows the script to easily calculate totals, find averages, or sort the data before handing it off to the PDF generator.
