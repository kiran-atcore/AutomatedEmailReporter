import io
import requests
import json
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template import Template, Context
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from .models import ExecutionLog
import matplotlib
matplotlib.use('Agg') # Headless backend
import matplotlib.pyplot as plt
import os
import csv
import re
from io import StringIO
from groq import Groq
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

def fetch_data(data_source):
    """
    Fetches live data from the data source endpoint via HTTP GET.
    Returns a 2D array representing the data table.
    """
    endpoint = data_source.endpoint
    conn_type = data_source.connection_type.lower()
    
    if conn_type == 'sql':
        return fetch_data_sql(data_source)
    elif conn_type == 'google_sheets':
        return fetch_data_sheets(data_source)
    elif conn_type == 'airtable':
        return fetch_data_airtable(data_source)
        
    try:
        # We will use headers if auth_token is provided
        headers = {}
        if data_source.auth_token:
            headers['Authorization'] = f"Bearer {data_source.auth_token}"
            
        # Send a live HTTP request!
        response = requests.get(endpoint, headers=headers, timeout=10)
        response.raise_for_status() # Raise error for bad HTTP status
        
        json_data = response.json()
        
        # If json_data is a dictionary, try to find a list of objects inside it (unwrap pagination or data wrappers)
        if isinstance(json_data, dict):
            for key, value in json_data.items():
                if isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                    json_data = value
                    break
        
        # If the API returned (or contained) a list of dictionaries, dynamically build a table.
        if isinstance(json_data, list) and len(json_data) > 0 and isinstance(json_data[0], dict):
            headers = list(json_data[0].keys())
            table_data = [headers]
            for row in json_data:
                table_data.append([str(row.get(h, '')) for h in headers])
            return table_data
            
        elif isinstance(json_data, list) and len(json_data) == 0:
            raise ValueError("API returned an empty list.")
        else:
            # Fallback for unexpected formats
            raise ValueError("API did not return a list of objects.")
            
    except requests.exceptions.RequestException as e:
        # Catch network/HTTP errors
        raise ValueError(f"HTTP Request Failed: {str(e)}")
    except json.JSONDecodeError:
        raise ValueError("API did not return valid JSON.")
    except Exception as e:
        raise ValueError(f"Data processing failed: {str(e)}")

def fetch_data_sql(data_source):
    """
    Fetches data from a SQL database using SQLAlchemy.
    """
    try:
        engine = create_engine(data_source.endpoint)
        query = data_source.config.get('query') if data_source.config else None
        
        if not query:
            raise ValueError("SQL Query is required for database connections.")
            
        with engine.connect() as connection:
            result = connection.execute(text(query))
            
            headers = list(result.keys())
            table_data = [headers]
            
            for row in result:
                table_data.append([str(col) for col in row])
                
            if len(table_data) <= 1:
                raise ValueError("Query returned no results.")
                
            return table_data
    except SQLAlchemyError as e:
        raise ValueError(f"Database Connection Failed: {str(e)}")
    except Exception as e:
        raise ValueError(f"SQL Execution Failed: {str(e)}")

def fetch_data_sheets(data_source):
    """
    Fetches data from a public Google Sheet via CSV export.
    """
    url = data_source.endpoint
    # Extract sheet ID
    match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if not match:
        raise ValueError("Invalid Google Sheets URL.")
    sheet_id = match.group(1)
    
    # Extract gid if present
    gid = "0"
    gid_match = re.search(r'gid=([0-9]+)', url)
    if gid_match:
        gid = gid_match.group(1)
        
    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
    
    response = requests.get(csv_url)
    if response.status_code != 200:
        raise ValueError(f"Failed to fetch Google Sheet. Is it public? (HTTP {response.status_code})")
        
    reader = csv.reader(StringIO(response.text))
    table_data = list(reader)
    if len(table_data) <= 1:
         raise ValueError("Google Sheet is empty or invalid.")
         
    return table_data

def fetch_data_airtable(data_source):
    """
    Fetches data from an Airtable Base.
    endpoint: Base ID (e.g. app123456789)
    config.table_name: Table Name
    auth_token: Personal Access Token
    """
    import re
    match = re.search(r'(app[a-zA-Z0-9]+)', data_source.endpoint)
    base_id = match.group(1) if match else data_source.endpoint
    
    table_name = data_source.config.get('table_name') if data_source.config else None
    
    if not table_name:
        raise ValueError("Airtable Table Name is required in config.")
        
    url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
    headers = {
        "Authorization": f"Bearer {data_source.auth_token}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise ValueError(f"Airtable API Failed: {response.text}")
        
    data = response.json()
    records = data.get('records', [])
    if not records:
        raise ValueError("No records found in Airtable.")
        
    # Extract all possible field names from all records
    field_names = set()
    for record in records:
        field_names.update(record.get('fields', {}).keys())
    
    headers = sorted(list(field_names))
    table_data = [headers]
    
    for record in records:
        fields = record.get('fields', {})
        # Convert all to strings, handle lists or dicts in airtable fields
        row = [str(fields.get(h, '')) for h in headers]
        table_data.append(row)
        
    return table_data

def generate_chart(data, chart_type):
    """
    Extracts the first string column as labels, and first numeric column as values.
    Returns a BytesIO buffer containing a PNG of the chart.
    """
    if len(data) < 2:
        return None
        
    headers = data[0]
    rows = data[1:]
    
    labels = []
    values = []
    
    # Simple heuristic: col 0 is labels, try to find a numeric column for values
    label_idx = 0
    val_idx = -1
    
    for i in range(1, len(headers)):
        try:
            # Try parsing the first row's value
            val = str(rows[0][i]).replace('$', '').replace('%', '').replace(',', '').strip()
            float(val)
            val_idx = i
            break
        except ValueError:
            continue
            
    if val_idx == -1:
        return None # Could not find numeric data
        
    for row in rows:
        labels.append(str(row[label_idx]))
        try:
            val = str(row[val_idx]).replace('$', '').replace('%', '').replace(',', '').strip()
            values.append(float(val))
        except ValueError:
            values.append(0.0)
            
    fig, ax = plt.subplots(figsize=(6, 4))
    
    if chart_type == 'pie':
        ax.pie(values, labels=labels, autopct='%1.1f%%', startangle=90, colors=plt.cm.Paired.colors)
        ax.axis('equal')
    else:
        # Default to bar
        ax.bar(labels, values, color='#4facfe')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150)
    plt.close(fig)
    buf.seek(0)
    return buf

def generate_ai_summary(data, custom_prompt):
    """
    Calls the Groq API to generate an executive summary based on the data.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return "AI Summary is enabled, but GROQ_API_KEY is not configured in the environment."
        
    try:
        client = Groq(api_key=api_key)
        
        # Convert data (2D array) into a readable JSON string
        headers = data[0]
        rows = [dict(zip(headers, row)) for row in data[1:]]
        data_json = json.dumps(rows, indent=2)
        
        # Default prompt if none provided
        system_prompt = (
            "You are an expert data analyst. Summarize the following data concisely, highlighting key trends or anomalies. "
            "Do not include introductory/outro phrases, just the summary paragraph. "
            "VERY IMPORTANT: Format your response using basic HTML tags (<b>, <i>, <br/>) instead of Markdown. Do NOT use asterisks for bolding."
        )
        if custom_prompt:
            system_prompt += f"\n\nAdditional Instructions from user: {custom_prompt}"
            
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the raw data:\n\n{data_json}"}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=256
        )
        summary_text = chat_completion.choices[0].message.content
        
        # Cleanup: convert any accidental markdown to reportlab-compatible HTML
        import re
        summary_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', summary_text)
        summary_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', summary_text)
        summary_text = summary_text.replace('\n', '<br/>')
        
        return summary_text
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return f"AI Summary failed to generate: {str(e)}"

def generate_pdf(job, data):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    normal_style = styles['Normal']
    
    layout_type = job.template.layout
    branding_color = job.template.branding_color or '#1e3c72'
    
    # Custom Document layout style
    if layout_type == 'Document':
        title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], alignment=0, textColor=colors.HexColor(branding_color))
        normal_style = ParagraphStyle('DocNormal', parent=styles['Normal'], alignment=0, spaceBefore=6, spaceAfter=6, fontSize=11, leading=16)
    else:
        title_style = ParagraphStyle('GridTitle', parent=styles['Heading1'], alignment=1, textColor=colors.HexColor(branding_color))
        normal_style = ParagraphStyle('GridNormal', parent=styles['Normal'], alignment=1)

    # Branding Logo
    if job.template.branding_logo:
        try:
            logo_img = Image(job.template.branding_logo.path, width=150, height=50, kind='proportional')
            if layout_type == 'Grid':
                logo_img.hAlign = 'CENTER'
            else:
                logo_img.hAlign = 'LEFT'
            elements.append(logo_img)
            elements.append(Spacer(1, 12))
        except Exception as e:
            pass # Ignore if file missing or corrupt

    # Header
    header_text = job.template.header_text or f"Report: {job.name}"
    elements.append(Paragraph(header_text, title_style))
    elements.append(Spacer(1, 12))
    
    # Timestamp
    elements.append(Paragraph(f"Generated on: {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}", normal_style))
    elements.append(Spacer(1, 24))
    
    # AI Summary Injection
    if getattr(job.template, 'enable_ai_summary', False):
        ai_style = ParagraphStyle('AISummary', parent=styles['Normal'], alignment=0, spaceBefore=12, spaceAfter=24, fontSize=11, leading=16, textColor=colors.HexColor('#1f2937'), backColor=colors.HexColor('#f8f9fa'), borderPadding=10, borderRadius=4)
        ai_header = ParagraphStyle('AIHeader', parent=styles['Heading3'], textColor=colors.HexColor('#8b5cf6'))
        
        elements.append(Paragraph("✨ AI Executive Summary", ai_header))
        summary_text = generate_ai_summary(data, job.template.ai_prompt)
        elements.append(Paragraph(summary_text, ai_style))
    
    # Chart Generation
    if getattr(job.template, 'has_chart', False):
        chart_buf = generate_chart(data, job.template.chart_type)
        if chart_buf:
            # Add to PDF
            img = Image(chart_buf, width=400, height=266)
            elements.append(img)
            elements.append(Spacer(1, 24))
    
    # Data Table
    if layout_type == 'Document':
        # Document table styling (minimalist)
        table_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.whitesmoke),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,0), 2, colors.black),
            ('LINEBELOW', (0,1), (-1,-1), 0.5, colors.lightgrey),
        ])
        
        # In document mode, add introductory paragraph
        intro_text = "This report contains the latest data extraction corresponding to the requested parameters. The detailed tabular breakdown is provided below for your review."
        elements.append(Paragraph(intro_text, normal_style))
        elements.append(Spacer(1, 12))
        
    else:
        # Grid table styling (bold and colorful)
        table_style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor(branding_color)),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
            ('ALIGN', (0,1), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,1), (-1,-1), 6),
            ('BOTTOMPADDING', (0,1), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dddddd'))
        ])
        
    # Prevent horizontal overflow by wrapping cells in Paragraphs and setting colWidths
    from reportlab.lib.styles import ParagraphStyle
    num_cols = len(data[0]) if data else 1
    avail_width = 552.0 # 612 (letter width) - 30 (leftMargin) - 30 (rightMargin)
    col_widths = [avail_width / num_cols] * num_cols

    wrapped_data = []
    for r_idx, row in enumerate(data):
        wrapped_row = []
        for c_idx, cell in enumerate(row):
            # Escape HTML characters so ReportLab Paragraph doesn't crash on < or &
            cell_str = str(cell).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            
            # Match Paragraph styling to the TableStyle
            style_kwargs = {
                'name': f'Cell_{r_idx}_{c_idx}',
                'parent': normal_style,
                'fontSize': 10,
                'wordWrap': 'CJK', # allows wrapping on any character for long strings
            }
            if layout_type == 'Document':
                style_kwargs['alignment'] = 0 # LEFT
                if r_idx == 0:
                    style_kwargs.update({'fontName': 'Helvetica-Bold', 'textColor': colors.black})
            else: # Grid
                style_kwargs['alignment'] = 1 # CENTER
                if r_idx == 0:
                    style_kwargs.update({'fontName': 'Helvetica-Bold', 'textColor': colors.whitesmoke, 'fontSize': 12})
            
            p_style = ParagraphStyle(**style_kwargs)
            wrapped_row.append(Paragraph(cell_str, p_style))
        wrapped_data.append(wrapped_row)
        
    table = Table(wrapped_data, colWidths=col_widths)
    table.setStyle(table_style)
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def send_report_email(job, pdf_content):
    # Context for rendering templates
    context = Context({
        'job_name': job.name,
        'date': timezone.now().strftime('%Y-%m-%d'),
        'time': timezone.now().strftime('%H:%M:%S UTC'),
        'frequency': job.schedule.frequency
    })
    
    # Render Subject
    raw_subject = job.template.email_subject or f"Automated Report: {job.name}"
    subject = Template(raw_subject).render(context)
    
    # Render Body (Text Fallback & HTML)
    raw_html = job.template.email_body_html or f"<p>Hello,</p><p>Please find attached the latest automated report for <strong>{job.name}</strong>.</p><p>Generated by AutoReporter.</p>"
    html_body = Template(raw_html).render(context)
    
    # Simple plain text fallback stripped of HTML
    text_body = f"Hello,\n\nPlease find attached the latest automated report for '{job.name}'.\n\nGenerated by AutoReporter."
    
    # Recipients is a comma-separated string
    recipient_list = [email.strip() for email in job.schedule.recipients.split(',') if email.strip()]
    
    if not recipient_list:
        raise ValueError("No valid recipients found.")
        
    branding_color = job.template.branding_color or '#1e3c72'
    logo_html = ""
    if job.template.branding_logo:
        # Link directly to the cloud URL! Brevo supports this beautifully.
        logo_html = f'<img src="{job.template.branding_logo.url}" style="max-height: 60px; margin-bottom: 10px;" /><br/>'
        
    css_styles = f"<style>\n{job.template.css_overrides}\n</style>" if getattr(job.template, 'css_overrides', None) else ""
    
    branded_html = f"""
    <html>
    <head>
        {css_styles}
    </head>
    <body>
        <div class="report-wrapper" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div class="report-header" style="background-color: {branding_color}; padding: 24px; color: #ffffff; text-align: center;">
                {logo_html}
                <h2 style="margin: 0; font-size: 24px;">{job.name}</h2>
            </div>
            <div class="report-body" style="padding: 24px; color: #374151; line-height: 1.6; background-color: #ffffff;">
                {html_body}
            </div>
            <div class="report-footer" style="background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
                Powered by AutoReporter
            </div>
        </div>
    </body>
    </html>
    """
        
    from django.conf import settings
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipient_list
    )
    email.attach_alternative(branded_html, "text/html")
    email.attach(f"{job.name.replace(' ', '_')}_{timezone.now().strftime('%Y%m%d')}.pdf", pdf_content, 'application/pdf')
    
    # Brevo API does not support inline attachments (Anymail raises AnymailUnsupportedFeature).
    # Since the logo is already beautifully embedded at the top of the PDF itself,
    # we can safely skip the inline email body attachment.
            
    email.send()

def execute_job(job_id):
    from .models import Job
    try:
        job = Job.objects.get(id=job_id)
        if not job.is_active:
            return
            
        print(f"Executing Job: {job.name}")
        
        # 1. Fetch Data via HTTP
        data = fetch_data(job.data_source)
        
        # 2. Generate PDF
        pdf_content = generate_pdf(job, data)
        
        # 3. Send Email
        send_report_email(job, pdf_content)
        
        # 4. Log Success and Save PDF
        from django.core.files.base import ContentFile
        log = ExecutionLog.objects.create(
            job=job,
            job_name_snapshot=job.name,
            status='success'
        )
        file_name = f"{job.name.replace(' ', '_')}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        log.report_file.save(file_name, ContentFile(pdf_content))
        
        # Mark previous failures as resolved (hide them from list views, but keep them on dashboard until manually cleared)
        ExecutionLog.objects.filter(job=job, status='failed', is_resolved_failure=False).update(is_resolved_failure=True)
        
        print(f"Job {job.name} completed successfully.")
        
    except Exception as e:
        print(f"Job failed: {str(e)}")
        # Log Failure with the exact error message
        try:
            job = Job.objects.get(id=job_id)
            ExecutionLog.objects.create(
                job=job,
                job_name_snapshot=job.name,
                status='failed',
                error_message=str(e)[:500]
            )
        except:
            pass
