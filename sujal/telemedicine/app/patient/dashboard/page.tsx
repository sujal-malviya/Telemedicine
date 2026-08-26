"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import LanguageTranslator from "@/components/LanguageTranslator";

export default function PatientDashboard() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [prescriptionHistory, setPrescriptionHistory] = useState("");
  const [currentProblem, setCurrentProblem] = useState("");
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/patient/doctors");
  };

  const addMedication = () => {
    if (newMedication) {
      setMedications([...medications, newMedication]);
      setNewMedication("");
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Patient Dashboard
        </h1>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Patient Information</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="translation">Translation</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="prescription-history">
                      Prescription History
                    </Label>
                    <Textarea
                      id="prescription-history"
                      value={prescriptionHistory}
                      onChange={(e) => setPrescriptionHistory(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="current-problem">Current Problem</Label>
                    <Textarea
                      id="current-problem"
                      value={currentProblem}
                      onChange={(e) => setCurrentProblem(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Submit and Find Doctors</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medication Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new medication"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                    />
                    <Button onClick={addMedication}>Add</Button>
                  </div>
                  <ul className="space-y-2">
                    {medications.map((med, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded"
                      >
                        <span>{med}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setMedications(
                              medications.filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Schedule Reminder
                    </h3>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <Input type="time" className="w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="translation">
            <LanguageTranslator />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
