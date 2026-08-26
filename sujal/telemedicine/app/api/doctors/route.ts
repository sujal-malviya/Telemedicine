import { NextResponse } from "next/server";

export async function GET() {
  // In a real application, you would fetch this data from a database
  const doctors = [
    {
      id: "doc123",
      name: "Dr. Rajesh Khanna",
      specialization: "Cardiologist",
      availability: true,
    },
    {
      id: "doc124",
      name: "Dr. Priya Sharma",
      specialization: "Dermatologist",
      availability: false,
    },
    {
      id: "doc125",
      name: "Dr. Amit Patel",
      specialization: "Pediatrician",
      availability: true,
    },
  ];

  return NextResponse.json(doctors);
}
