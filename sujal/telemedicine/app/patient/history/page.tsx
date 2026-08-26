"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Use Badge for status indicators

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  problem: string;
  prescription: string;
}

export default function PatientHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch("/api/patient/history");
      const data = await response.json();
      setAppointments(data);
    };

    fetchHistory();
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">
          Patient History
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {appointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg border border-gray-300"
            >
              <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-semibold">
                  Appointment with {appointment.doctorName}
                </CardTitle>
                <p className="text-sm">{appointment.date}</p>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 rounded-b-lg">
                <p className="text-sm text-gray-700 mb-4">
                  <strong className="text-gray-800">Problem:</strong> {appointment.problem}
                </p>
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-800">Prescription:</strong> {appointment.prescription}
                </p>
                {/* Optionally, add a status badge */}
                <Badge className="mt-4" variant="outline" color="blue">
                  Completed
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
