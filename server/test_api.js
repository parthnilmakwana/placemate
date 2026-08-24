const fs = require('fs');
const path = require('path');

async function testUpload() {
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  
  if (!fs.existsSync(dummyPdfPath)) {
    console.log("No dummy.pdf found");
    return;
  }

  const formData = new FormData();
  const fileBuffer = fs.readFileSync(dummyPdfPath);
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', blob, 'dummy.pdf');

  try {
    const response = await fetch('http://localhost:5000/api/upload/extract-text', {
      method: 'POST',
      body: formData
    });
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    console.log('Server Status:', response.status);
    console.log('Server Content-Type:', contentType);
    console.log('Server Response:', text);
  } catch (err) {
    console.error('Network Error:', err);
  }
}

testUpload();
