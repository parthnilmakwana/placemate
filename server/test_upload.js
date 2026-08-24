const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function testUpload() {
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  
  // Create a dummy PDF
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(dummyPdfPath));
  doc.fontSize(25).text('This is a test PDF for extraction!', 100, 100);
  doc.end();

  // wait for file to be written
  await new Promise(resolve => setTimeout(resolve, 500));

  const formData = new FormData();
  const fileBuffer = fs.readFileSync(dummyPdfPath);
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, 'dummy.pdf');

  try {
    const response = await fetch('http://localhost:5000/api/upload/extract-text', {
      method: 'POST',
      body: formData
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Network Error:', err);
  }
}

testUpload();
