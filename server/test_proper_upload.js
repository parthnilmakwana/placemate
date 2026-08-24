const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function testUpload() {
  const dummyPdfPath = path.join(__dirname, 'test_proper.pdf');
  
  // Create a dummy PDF
  await new Promise((resolve) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(dummyPdfPath);
    doc.pipe(stream);
    doc.fontSize(25).text('This is a test PDF for extraction!', 100, 100);
    doc.end();
    stream.on('finish', resolve);
  });

  const pdfParse = require('pdf-parse');
  const fileBuffer = fs.readFileSync(dummyPdfPath);
  
  try {
    const localData = await pdfParse(fileBuffer);
    console.log("Local Parse Success:", localData.text.trim());
  } catch(e) {
    console.log("Local Parse Failed:", e.message);
  }

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, 'test_proper.pdf');

  try {
    const response = await fetch('http://localhost:5000/api/upload/extract-text', {
      method: 'POST',
      body: formData
    });
    
    const text = await response.text();
    console.log('Server Status:', response.status);
    console.log('Server Response:', text);
  } catch (err) {
    console.error('Network Error:', err);
  }
}

testUpload();
