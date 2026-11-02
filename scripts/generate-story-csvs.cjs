const fs = require('fs');
const path = require('path');

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRow(item) {
  return [
    item.category,
    escapeCsvField(item.question_hi),
    escapeCsvField(item.optionA_hi || 'रोचक तथ्य'),
    escapeCsvField(item.optionB_hi || 'ज्ञान यात्रा'),
    escapeCsvField(item.optionC_hi || 'अद्भुत दुनिया'),
    escapeCsvField(item.optionD_hi || 'जिज्ञासा'),
    item.answer_hi || 'A',
    escapeCsvField(item.explanation_hi),
    escapeCsvField(item.question_en),
    escapeCsvField(item.optionA_en || 'Amazing Fact'),
    escapeCsvField(item.optionB_en || 'Knowledge Journey'),
    escapeCsvField(item.optionC_en || 'Wonder World'),
    escapeCsvField(item.optionD_en || 'Curiosity'),
    item.answer_en || 'A',
    escapeCsvField(item.explanation_en),
    item.examTag || 'Knowledge Story'
  ].join(',');
}

const HEADER = 'category,question_hi,optionA_hi,optionB_hi,optionC_hi,optionD_hi,answer_hi,explanation_hi,question_en,optionA_en,optionB_en,optionC_en,optionD_en,answer_en,explanation_en,examTag';

console.log('Generating Curiosity Story CSVs...');

