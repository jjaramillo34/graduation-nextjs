import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read events directly from file
    const filePath = path.join(process.cwd(), 'public', 'data', 'events.json');
    console.log('Reading file from:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Events file not found at ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('Invalid events data format');
    }
    
    console.log(`Loaded ${data.events.length} events from file`);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB');

    // Clear existing events
    console.log('Clearing existing events...');
    const deleteResult = await Event.deleteMany({});
    console.log('Deleted existing events:', deleteResult);

    // Insert new events
    console.log('Inserting new events...');
    const insertedEvents = await Event.insertMany(data.events);
    console.log(`Inserted ${insertedEvents.length} events`);

    // Verify insertion
    const count = await Event.countDocuments();
    console.log('Total events in database:', count);

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${insertedEvents.length} events`,
        count: count,
        details: {
          deleted: deleteResult.deletedCount,
          inserted: insertedEvents.length,
          total: count
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to seed database',
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Alternative seeding method using static data
export async function GET(request: NextRequest) {
  try {
    // Try MongoDB first
    try {
      await dbConnect();

      // Check if events already exist
      const existingEvents = await Event.countDocuments();
      
      if (existingEvents > 0) {
        return NextResponse.json({
          success: true,
          message: `Database already contains ${existingEvents} events (MongoDB)`,
          source: 'mongodb',
          seeded: false,
        });
      }

      // For development/demo purposes, use a smaller static dataset
      const sampleEvents = [
        {
          id: 1,
          school_number: "1",
          principal: "Sarada Dorce",
          date: "June 18th",
          time: "5pm",
          location: "Lehman HS-3000 Tremont Ave.\nBronx, NY  10465",
          address: "",
          ceremony_type: "Graduation Ceremony",
          title: "School 1 Graduation Ceremony",
          year: "2025",
          raw_text: "",
          extracted_at: new Date().toISOString()
        },
        {
          id: 2,
          school_number: "2",
          principal: "Olga Steward Nelson",
          date: "June 20th",
          time: "6pm",
          location: "I.S. 61\n98-50th , Corona, NY11368",
          address: "",
          ceremony_type: "Graduation Ceremony",
          title: "School 2 Graduation Ceremony",
          year: "2025",
          raw_text: "",
          extracted_at: new Date().toISOString()
        }
      ];

      const insertedEvents = await Event.insertMany(sampleEvents);
      
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${insertedEvents.length} sample events (MongoDB)`,
        source: 'mongodb',
        seeded: true,
      });

    } catch (mongoError) {
      console.log('MongoDB not available, using mock database:', mongoError instanceof Error ? mongoError.message : mongoError);
      
      // Fallback to mock database
      const events = await loadEventsFromFile();
      
      return NextResponse.json({
        success: true,
        message: `Successfully loaded ${events.length} events (Mock Database)`,
        source: 'mock',
        note: 'Using mock database (MongoDB not available)',
        seeded: true,
      });
    }

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed database',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
