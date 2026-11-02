const { execSync } = require('child_process');
const fs = require('fs');

function parseCsv(text) {
  const lines = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
          i++;
        }
        row.push(field);
        field = '';
        if (row.some(x => x.trim())) {
          lines.push(row);
        }
        row = [];
      } else {
        field += c;
      }
    }
  }
  if (row.length > 0) {
    row.push(field);
    if (row.some(x => x.trim())) lines.push(row);
  }
  return lines;
}

const files = [
  'public/World_Facts_Wonders_1500_Questions.csv',
  'public/World_Space_Astronomy_1500_Questions.csv',
  'public/World_Psychology_Mind_1500_Questions.csv',
  'public/World_Philosophy_Ideas_1500_Questions.csv'
];

files.forEach(f => {
  const out = execSync('git show HEAD:' + f, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const rows = parseCsv(out);
  console.log('=== ' + f + ' ===');
  console.log('Total rows:', rows.length);
  console.log('Row 1 Q_hi:', rows[1][1]);
  console.log('Row 1 Ans_hi:', rows[1][6]);
  console.log('Row 1 Exp_hi:', rows[1][7]);
  console.log('Row 1 Q_en:', rows[1][8]);
  console.log('Row 1 Exp_en:', rows[1][14]);
});

