"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { VideoCall } from "@/components/VideoCall";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Phone, Video } from "lucide-react";


interface Doctor {
  id: number;
  username: string;
  email: string;
}

interface Appointment {
  id: number;
  doctor_id: number;
  status: string;
  description: string;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const patientId = localStorage.getItem("patient");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/doctors?skip=0&limit=100"
        );
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/appointments/?user_id=${patientId}`
        );
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
    fetchAppointments();
  }, [patientId]);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !description.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/appointments/?patient_id=${patientId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor_id: selectedDoctor.id,
            description: description.trim(),
          }),
        }
      );

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments((prev) => [...prev, newAppointment]);
        toast({
          title: "Success",
          description: `Appointment booked with Dr. ${selectedDoctor.username}`,
        });
        setShowDialog(false);
        setDescription("");
      } else {
        throw new Error("Failed to book appointment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not book appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find((doc) => doc.id === doctorId);
    return doctor ? doctor.username : "Unknown Doctor";
  };

  const handleContact = (doctor: Doctor, method: "phone" | "video") => {
    if (method === "video") {
      setSelectedDoctor(doctor);
      setShowVideoCall(true);
    } else {
      toast({
        title: "Phone Call",
        description: `Initiating call with Dr. ${doctor.username}`,
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-4xl font-semibold mb-6 text-center text-gray-900">
          Available Doctors
        </h2>
        {showVideoCall && selectedDoctor ? (
          <VideoCall roomId={`call-${selectedDoctor.id}`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="hover:shadow-xl transition-shadow duration-300 rounded-lg border border-gray-300"
              >
                <CardHeader className="bg-gray-100">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {doctor.username}
                  </CardTitle>
                  <Badge variant="default" className="mt-2">
                    Available
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 mb-4">{doctor.email}</p>
                  <div className="flex flex-col space-y-4">
                    <Button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowDialog(true);
                      }}
                      disabled={isLoading}
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200"
                    >
                      <Calendar className="h-5 w-5 mr-2" /> Book Appointment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleContact(doctor, "phone")}
                      className="w-full text-gray-700 border-gray-300 hover:bg-gray-200 transition duration-200"
                    >
                      <Phone className="h-5 w-5 mr-2" /> Phone Call
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleContact(doctor, "video")}
                      className="w-full text-gray-700 border-gray-300 hover:bg-gray-200 transition duration-200"
                    >
                      <Video className="h-5 w-5 mr-2" /> Video Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Book Appointment
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Please describe your reason for the appointment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] p-4 border rounded-lg"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBookAppointment}
                disabled={!description.trim()}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Book
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-12">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900">
            Your Appointments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="border-gray-300 rounded-lg">
                <CardHeader>
                  <CardTitle>
                    Appointment with Dr. {getDoctorName(appointment.doctor_id)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Status: {appointment.status}</p>
                  <p className="text-sm">{appointment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
