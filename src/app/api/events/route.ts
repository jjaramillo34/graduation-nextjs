import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import Registration from '@/lib/models/Registration';
import { getAllEventsWithRegistrations } from '@/lib/mockDatabase';
import { EventWithRegistrations } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('[API] /api/events called');
  try {
    // Try MongoDB first
    try {
      await dbConnect();
      console.log('[API] MongoDB connected');

      // Fetch all events
      const events = await Event.find({}).sort({ id: 1 }).lean();
      console.log(`[API] Found ${events.length} events in DB`);

      // Get registration counts for each event
      const registrationCounts = await Registration.aggregate([
        {
          $group: {
            _id: '$eventId',
            count: { $sum: 1 }
          }
        }
      ]);
      console.log(`[API] Registration counts:`, registrationCounts);

      // Create a map for quick lookup
      const countMap = new Map();
      registrationCounts.forEach(item => {
        countMap.set(item._id, item.count);
      });

      // Combine events with registration counts
      const eventsWithRegistrations: EventWithRegistrations[] = events.map(event => ({
        id: event.id,
        school_number: event.school_number,
        principal: event.principal,
        date: event.date,
        time: event.time,
        location: event.location,
        address: event.address,
        ceremony_type: event.ceremony_type,
        title: event.title,
        year: event.year,
        raw_text: event.raw_text,
        extracted_at: event.extracted_at,
        registrationCount: countMap.get(event.id) || 0,
        isFullyBooked: (countMap.get(event.id) || 0) >= 2,
      }));
      console.log(`[API] Returning ${eventsWithRegistrations.length} events with registration counts`);

      return NextResponse.json({
        success: true,
        events: eventsWithRegistrations,
        source: 'mongodb'
      });
    } catch (err) {
      console.error('[API] MongoDB error:', err);
      throw err;
    }
  } catch (error) {
    console.error('[API] /api/events error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to load events',
      error: error instanceof Error ? error.message : error
    }, { status: 500 });
  }
}
