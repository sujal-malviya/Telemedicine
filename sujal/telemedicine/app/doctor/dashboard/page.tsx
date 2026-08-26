"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  description: string;
  status: string;
}

interface AppointmentWithUser extends Appointment {
  patientDetails?: User;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<AppointmentWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointmentsAndUsers = async () => {
    try {
      const doctorId = localStorage.getItem("doctor");
      if (!doctorId) {
        toast({
          title: "Error",
          description: "Doctor ID not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const [appointmentsResponse, usersResponse] = await Promise.all([
        fetch(`http://localhost:8000/appointments/?user_id=${doctorId}`),
        fetch("http://localhost:8000/user?skip=0&limit=100"),
      ]);

      if (!appointmentsResponse.ok || !usersResponse.ok)
        throw new Error("Failed to fetch data");

      const appointmentsData: Appointment[] = await appointmentsResponse.json();
      const usersData: User[] = await usersResponse.json();

      const appointmentsWithUsers = appointmentsData.map((appointment) => ({
        ...appointment,
        patientDetails: usersData.find(
          (user) => user.id === appointment.patient_id
        ),
      }));

      setAppointments(appointmentsWithUsers);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndUsers();
  }, []);

  const handleAppointment = async (
    appointmentId: number,
    status: "accepted" | "rejected"
  ) => {
    try {
      const doctorId = localStorage.getItem("doctor");
      if (!doctorId) {
        toast({
          title: "Error",
          description: "Doctor ID not found",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `http://localhost:8000/appointments/${appointmentId}/status?status=${status}&doctor_id=${doctorId}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );

      toast({
        title: "Success",
        description: `Appointment ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <h2 className="text-2xl font-bold mb-6">Appointment Requests</h2>
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {appointment.patientDetails?.username ||
                      `Patient #${appointment.patient_id}`}
                  </CardTitle>
                  <Badge
                    variant={
                      appointment.status === "pending"
                        ? "secondary"
                        : appointment.status === "accepted"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {appointment.patientDetails && (
                    <>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Email:</span>{" "}
                        {appointment.patientDetails.email}
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Reason for Appointment:</span>{" "}
                    {appointment.description}
                  </p>
                  {appointment.status === "pending" && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() =>
                          handleAppointment(appointment.id, "accepted")
                        }
                        className="w-full"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleAppointment(appointment.id, "rejected")
                        }
                        className="w-full"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
