'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  GraduationCap, 
  RefreshCw,
  Download,
  Mail,
  School,
  Clock,
  MapPin,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface RegistrationWithEvent {
  _id: string;
  eventId: number;
  email: string;
  name: string;
  registeredAt: string;
  event: {
    id: number;
    school_number: string;
    principal: string;
    date: string;
    time: string;
    location: string;
    title: string;
  } | null;
}

interface RegistrationData {
  registrations: RegistrationWithEvent[];
  statistics: {
    totalRegistrations: number;
    totalEvents: number;
    eventsWithRegistrations: number;
    eventsWithoutRegistrations: number;
    averageRegistrationsPerEvent: string;
  };
  registrationsByEvent: Array<{
    _id: number;
    count: number;
    registrations: any[];
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch registrations from MongoDB
      const response = await fetch('/api/registrations');
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to load registration data');
        return;
      }

      const { registrations, statistics, registrationsByEvent } = result.data;
      setData({ registrations, statistics, registrationsByEvent });
      
    } catch (err) {
      setError('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const exportToCSV = () => {
    if (!data || !data.registrations.length) return;

    const headers = ['Name', 'Email', 'School Number', 'Principal', 'Date', 'Time', 'Location', 'Registered At'];
    const csvContent = [
      headers.join(','),
      ...data.registrations.map(reg => [
        reg.name,
        reg.email,
        reg.event?.school_number || 'N/A',
        reg.event?.principal || 'N/A',
        reg.event?.date || 'N/A',
        reg.event?.time || 'N/A',
        `"${reg.event?.location?.replace(/"/g, '""') || 'N/A'}"`,
        new Date(reg.registeredAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graduation-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600">Loading registration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="graduation-gradient text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/d79-logo.png" 
                alt="District 79 Logo" 
                className="h-12 w-auto"
              />
              <GraduationCap className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100">Graduation Registration Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchRegistrations}
                variant="secondary"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="secondary"
                size="sm"
              >
                ← Back to Registration
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600">{error}</p>
                  <Button 
                    onClick={fetchRegistrations}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                      <p className="text-2xl font-bold">{data.statistics.totalRegistrations}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Events with Registrations</p>
                      <p className="text-2xl font-bold text-green-600">{data.statistics.eventsWithRegistrations}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Events without Registrations</p>
                      <p className="text-2xl font-bold text-orange-600">{data.statistics.eventsWithoutRegistrations}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Registrations/Event</p>
                      <p className="text-2xl font-bold text-purple-600">{data.statistics.averageRegistrationsPerEvent}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Registrations</h2>
              <Button 
                onClick={exportToCSV}
                disabled={!data.registrations.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Registrations Table */}
            {data.registrations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Registrations Yet</h3>
                  <p className="text-gray-500">
                    Registration data will appear here once people start registering for events.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Participant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.registrations.map((registration) => (
                          <tr key={registration._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {registration.name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {registration.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {registration.event ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                    <School className="h-3 w-3" />
                                    School {registration.event.school_number}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Principal: {registration.event.principal}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-start gap-1">
                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">
                                      {registration.event.location.replace(/\n/g, ', ')}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="destructive">Event Not Found</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {registration.event && (
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {registration.event.date}
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {registration.event.time}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(registration.registeredAt).toLocaleDateString()}
                              <br />
                              {new Date(registration.registeredAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Events by Registration Count */}
            {data.registrationsByEvent.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Events by Registration Count</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.registrationsByEvent.map((eventData) => (
                    <Card key={eventData._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">School {eventData._id}</p>
                            <p className="text-sm text-gray-500">
                              {eventData.count} registration{eventData.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Badge 
                            variant={eventData.count >= 2 ? "destructive" : "success"}
                          >
                            {eventData.count >= 2 ? "Full" : "Available"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
