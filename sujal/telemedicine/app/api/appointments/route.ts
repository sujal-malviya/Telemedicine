import { NextResponse } from "next/server";

export async function GET() {
  // In a real application, you would fetch this data from a database
  const appointments = [
    {
      id: "apt567",
      patientName: "Anay Malviya",
      age: 30,
      problem: "Chest Pain",
      prescriptionHistory: "Beta Blockers for BP",
      status: "Pending",
    },
    {
      id: "apt568",
      patientName: "Priya Reddy",
      age: 25,
      problem: "Skin rash",
      prescriptionHistory: "Antihistamines",
      status: "Confirmed",
    },
    {
      id: "apt569",
      patientName: "Rahul Sharma",
      age: 45,
      problem: "Joint pain",
      prescriptionHistory: "NSAIDs",
      status: "Pending",
    },
  ];

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const body = await request.json();
  // In a real application, you would save this data to a database
  console.log("Appointment request received:", body);
  return NextResponse.json({ message: "Appointment request received" });
}
