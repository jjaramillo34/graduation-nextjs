import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';
import Event from '@/lib/models/Event';
import { getAllRegistrations, getRegistrationStatistics, getAllEventsWithRegistrations } from '@/lib/mockDatabase';

export async function GET(request: NextRequest) {
  try {
    // Try MongoDB first
    try {
      await dbConnect();

      // Fetch all registrations with event details
      const registrations = await Registration.find({})
        .sort({ registeredAt: -1 })
        .lean();

      // Get all events for mapping
      const events = await Event.find({}).lean();
      const eventMap = new Map();
      events.forEach(event => {
        eventMap.set(event.id, event);
      });

      // Combine registrations with event details
      const registrationsWithEvents = registrations.map(registration => {
        const event = eventMap.get(registration.eventId);
        return {
          ...registration,
          event: event ? {
            id: event.id,
            school_number: event.school_number,
            principal: event.principal,
            date: event.date,
            time: event.time,
            location: event.location,
            title: event.title,
          } : null,
        };
      });

      // Calculate statistics
      const totalRegistrations = registrations.length;
      const uniqueEvents = new Set(registrations.map(r => r.eventId)).size;
      const totalEvents = events.length;
      const eventsWithRegistrations = uniqueEvents;
      const eventsWithoutRegistrations = totalEvents - eventsWithRegistrations;

      // Registration counts by event
      const registrationCounts = await Registration.aggregate([
        {
          $group: {
            _id: '$eventId',
            count: { $sum: 1 },
            registrations: { $push: '$$ROOT' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        data: {
          registrations: registrationsWithEvents,
          statistics: {
            totalRegistrations,
            totalEvents,
            eventsWithRegistrations,
            eventsWithoutRegistrations,
            averageRegistrationsPerEvent: totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(2) : 0,
          },
          registrationsByEvent: registrationCounts,
        },
      });

    } catch (mongoError) {
      console.log('MongoDB not available, using mock database:', mongoError instanceof Error ? mongoError.message : mongoError);
      
      // Fallback to mock database
      const registrations = await getAllRegistrations();
      const statistics = await getRegistrationStatistics();
      const events = await getAllEventsWithRegistrations();

      // Create event map for lookup
      const eventMap = new Map();
      events.forEach(event => {
        eventMap.set(event.id, event);
      });

      // Combine registrations with event details
      const registrationsWithEvents = registrations.map(registration => {
        const event = eventMap.get(registration.eventId);
        return {
          ...registration,
          event: event ? {
            id: event.id,
            school_number: event.school_number,
            principal: event.principal,
            date: event.date,
            time: event.time,
            location: event.location,
            title: event.title,
          } : null,
        };
      });

      return NextResponse.json({
        success: true,
        source: 'mock',
        note: 'Using mock database (MongoDB not available)',
        data: {
          registrations: registrationsWithEvents,
          statistics,
          registrationsByEvent: statistics.registrationsByEvent,
        },
      });
    }

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch registrations',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
