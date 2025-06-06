'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { EventWithRegistrations } from '@/types';
import EventCard from '@/components/EventCard';
import RegistrationForm from '@/components/RegistrationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  MapPin, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Database
} from 'lucide-react';

export default function HomePage() {
  const [events, setEvents] = useState<EventWithRegistrations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch events with registration counts from MongoDB
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setError('Invalid events data format');
      }
    } catch (err) {
      setError('Failed to load events from server');
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setSeeding(true);
      await fetchEvents(); // Just load the events from static file
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    fetchEvents(); // Refresh events and registration counts after successful registration
    setShowRegistrationForm(false);
    setSelectedEventId(undefined);
  };

  const totalEvents = events.length;
  const availableEvents = events.filter(event => event.registrationCount < 2).length;
  const fullEvents = events.filter(event => event.registrationCount >= 2).length;
  const totalRegistrations = events.reduce((sum, event) => sum + event.registrationCount, 0);

  // Modal component
  function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative animate-fade-in">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600">Loading graduation events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="graduation-gradient text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
            <img 
              src="/d79-logo.png" 
              alt="District 79 Logo" 
              className="h-16 w-auto mb-4 md:mb-0"
            />
            <div className="flex flex-col md:flex-row items-center gap-3">
              <GraduationCap className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">
                D79 Graduation Signup
              </h1>
            </div>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Register for District 79 graduation ceremonies. Limited to 2 participants per event.
            Only @schools.nyc.gov email addresses are accepted. Exceptions: Unlimited Registration for P2G Graduation
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Events</p>
                  <p className="text-2xl font-bold text-green-600">{availableEvents}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Events</p>
                  <p className="text-2xl font-bold text-red-600">{fullEvents}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600">{error}</p>
                  <div className="mt-3 flex gap-2">
                    <Button 
                      onClick={fetchEvents}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    {events.length === 0 && (
                      <Button 
                        onClick={seedDatabase}
                        disabled={seeding}
                        size="sm"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {seeding ? 'Seeding...' : 'Seed Database'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Graduation Events</h2>
              <Button 
                onClick={fetchEvents}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {events.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Available</h3>
                  <p className="text-gray-500 mb-4">
                    There are currently no graduation events in the system.
                  </p>
                  <Button 
                    onClick={seedDatabase}
                    disabled={seeding}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {seeding ? 'Loading Events...' : 'Load Sample Events'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Registration Form Modal */}
          <Modal open={showRegistrationForm} onClose={() => { setShowRegistrationForm(false); setSelectedEventId(undefined); }}>
            <RegistrationForm
              events={events}
              selectedEventId={selectedEventId}
              onSuccess={handleRegistrationSuccess}
            />
          </Modal>

          {/* Registration Info Card (when modal is closed) */}
          {!showRegistrationForm && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Registration Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Maximum 2 people per event</span>
                      
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-blue-500">Exceptions: Unlimited Registration for P2G Graduation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Only @schools.nyc.gov emails</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Instant confirmation</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-4">
                      Click &quot;Register Now&quot; on any available event to begin registration.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Available Events:</span>
                        <Badge variant="success">{availableEvents}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Full Events:</span>
                        <Badge variant="destructive">{fullEvents}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
