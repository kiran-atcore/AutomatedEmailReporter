const fs = require('fs');

const files = [
    'src/app/(main)/NewJob/page.tsx',
    'src/app/(main)/EditJob/[id]/page.tsx',
    'src/app/(main)/NewSchedule/page.tsx',
    'src/app/(main)/EditSchedule/[id]/page.tsx',
    'src/app/(main)/NewTemplate/page.tsx',
    'src/app/(main)/EditTemplate/[id]/page.tsx',
];

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        // Replace `text-white-50` in <i className="..."> tags within labels.
        // Actually, just replacing ` text-white-50` in <i className="bi bi-something text-white-50">
        // It's safe to just replace any ` text-white-50"` inside `<i className="bi `
        // We will use a regex: /<i className="bi ([^"]+) text-white-50"><\/i>/g -> '<i className="bi $1"></i>'
        
        let modified = false;
        content = content.replace(/<i className="bi ([a-zA-Z0-9-]+) text-white-50"><\/i>/g, (match, p1) => {
            modified = true;
            return `<i className="bi ${p1}"></i>`;
        });

        if (modified) {
            fs.writeFileSync(f, content);
            console.log(`Updated icons in ${f}`);
        } else {
            console.log(`No icons with text-white-50 found in ${f}`);
        }
    } else {
        console.log(`File not found: ${f}`);
    }
}
