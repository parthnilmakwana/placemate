const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Force process-level DNS resolution to Google/Cloudflare public DNS to bypass Windows/ISP SRV lookup blocks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Warning: Could not set custom DNS servers, falling back to system default.', e.message);
}

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/placemate';
const ATLAS_MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  if (!ATLAS_MONGO_URI || ATLAS_MONGO_URI.includes('<db_password>')) {
    console.error('Error: Please update MONGO_URI in server/.env with your actual database password first!');
    process.exit(1);
  }
  
  console.log('--- Starting MongoDB Atlas Migration ---');
  console.log(`Source (Local): ${LOCAL_MONGO_URI}`);
  console.log(`Destination (Atlas): ${ATLAS_MONGO_URI}`);
  
  try {
    const localConn = await mongoose.createConnection(LOCAL_MONGO_URI).asPromise();
    console.log('Connected to Local MongoDB.');
    
    const atlasConn = await mongoose.createConnection(ATLAS_MONGO_URI).asPromise();
    console.log('Connected to MongoDB Atlas.');
    
    // Get list of collection names from local database
    const collections = await localConn.db.listCollections().toArray();
    
    for (const col of collections) {
      const colName = col.name;
      // Skip system collections
      if (colName.startsWith('system.')) continue;
      
      console.log(`\nMigrating collection: ${colName}...`);
      
      // Fetch all documents from local collection
      const localDocs = await localConn.collection(colName).find({}).toArray();
      console.log(`Found ${localDocs.length} documents in local ${colName}.`);
      
      if (localDocs.length === 0) {
        console.log(`Skipping empty collection: ${colName}`);
        continue;
      }
      
      // Clear destination collection on Atlas
      console.log(`Clearing old documents in Atlas ${colName}...`);
      await atlasConn.collection(colName).deleteMany({});
      
      // Insert documents into Atlas
      console.log(`Inserting ${localDocs.length} documents into Atlas ${colName}...`);
      await atlasConn.collection(colName).insertMany(localDocs);
      console.log(`Successfully migrated ${colName}.`);
    }
    
    console.log('\n=========================================');
    console.log('🎉 Database migration completed successfully!');
    console.log('=========================================');
    
    await localConn.close();
    await atlasConn.close();
  } catch (error) {
    console.error('Migration failed with error:', error);
  }
  process.exit(0);
}

migrate();
