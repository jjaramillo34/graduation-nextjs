import dbConnect from '../src/lib/mongodb';
import Event from '../src/lib/models/Event';
import fs from 'fs';
import path from 'path';

async function seed() {
  try {
    // Read events directly from file
    const filePath = path.join(process.cwd(), 'public', 'data', 'events.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Events file not found at ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('Invalid events data format');
    }
    
    // Fill in default values for required fields
    const cleanedEvents = data.events.map((e: any) => ({
      ...e,
      school_number: e.school_number && e.school_number.trim() !== '' ? e.school_number : 'N/A',
      time: e.time && e.time.trim() !== '' ? e.time : 'N/A',
      principal: e.principal && e.principal.trim() !== '' ? e.principal : 'N/A',
      location: e.location && e.location.trim() !== '' ? e.location : 'N/A',
      date: e.date && e.date.trim() !== '' ? e.date : 'N/A',
    }));

    // Connect to MongoDB
    await dbConnect();

    // Clear existing events
    const deleteResult = await Event.deleteMany({});

    // Insert new events
    const insertedEvents = await Event.insertMany(cleanedEvents);

    // Verify insertion
    const count = await Event.countDocuments();

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seed(); 