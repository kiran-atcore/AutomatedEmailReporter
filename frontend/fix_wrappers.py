import os
import re

files_to_fix = [
    "(list)/FailedJobsList", "(list)/TotalJobsList", "(list)/TotalReportsList", 
    "JobView/[id]", "LogDetailView/[id]"
]

base_dir = r"c:\Users\kiran\OneDrive\Desktop\projects\AutomatedEmailReporter\frontend\src\app"

for f in files_to_fix:
    path = os.path.normpath(os.path.join(base_dir, f, "page.tsx"))
    if not os.path.exists(path):
        print(f"Missing {path}")
        continue
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    
    start_pattern = re.compile(r'return\s*\(\s*<div[^>]*style={{[^}]*}}[^>]*>.*?<nav[^>]*>.*?</nav>\s*<div className="container py-5">', re.DOTALL)
    new_content = start_pattern.sub('return (\n    <div className="container py-5">', content)
    
    end_pattern = re.compile(r'</div>\s*</div>\s*\);\s*}\s*$', re.DOTALL)
    new_content = end_pattern.sub('</div>\n  );\n}\n', new_content)
    
    with open(path, "w", encoding="utf-8") as file:
        file.write(new_content)
    print(f"Fixed {f}")
