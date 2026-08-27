const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

/**
 * @desc    Extract text from uploaded file (PDF, DOCX, PNG, JPG)
 * @route   POST /api/upload/extract-text
 * @access  Public
 */
exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { buffer, mimetype, originalname } = req.file;
    let extractedText = '';

    console.log(`Extracting text from: ${originalname} (${mimetype})`);

    // 1. Handle PDF
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } 
    // 2. Handle DOCX
    else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
    // 3. Handle Images (PNG, JPG, JPEG)
    else if (mimetype.startsWith('image/')) {
      const result = await Tesseract.recognize(buffer, 'eng');
      extractedText = result.data.text;
    }
    // 4. Handle plain text
    else if (mimetype === 'text/plain') {
      extractedText = buffer.toString('utf8');
    }
    // Unsupported format
    else {
      return res.status(415).json({ 
        success: false, 
        error: 'Unsupported file format. Please upload PDF, DOCX, TXT, or Image files.' 
      });
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not extract any readable text from the file.' 
      });
    }

    res.status(200).json({
      success: true,
      text: extractedText
    });

  } catch (error) {
    console.error('Error extracting text:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to extract text from the file.',
      details: error.message 
    });
  }
};

const { parseResumeTextToProfile } = require('../utils/aiMatcher');

/**
 * @desc    Extract text from uploaded file and map it to a structured Profile
 * @route   POST /api/upload/parse-to-profile
 * @access  Private
 */
exports.parseToProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // 1. Extract text first (reuses the extraction logic)
    const { buffer, mimetype, originalname } = req.file;
    let extractedText = '';

    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } 
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalname.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
    else if (mimetype.startsWith('image/')) {
      const result = await Tesseract.recognize(buffer, 'eng');
      extractedText = result.data.text;
    }
    else if (mimetype === 'text/plain') {
      extractedText = buffer.toString('utf8');
    }
    else {
      return res.status(415).json({ success: false, error: 'Unsupported file format.' });
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ success: false, error: 'Could not extract readable text.' });
    }

    // 2. Parse raw text into structured JSON profile
    const structuredProfile = await parseResumeTextToProfile(extractedText);

    res.status(200).json({
      success: true,
      data: structuredProfile,
      rawText: extractedText // Sometimes useful to return raw text too
    });

  } catch (error) {
    console.error('Error parsing resume to profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to parse resume into structured profile.',
      details: error.message 
    });
  }
};
