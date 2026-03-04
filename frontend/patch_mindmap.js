const fs = require('fs');
const file = 'frontend/src/app/dashboard/mindmap/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/results\.concepts\.map/g, '(results?.concepts || []).map');
content = content.replace(/results \? results\.filename/g, '(results && results.filename) ? results.filename');
content = content.replace(/const data = await res\.json\(\);/g, `
            if (!res.ok) {
                setProcessing(false);
                alert("Server error uploading PDF. Please check backend requirements.");
                return;
            }
            const data = await res.json();
`);
fs.writeFileSync(file, content);
