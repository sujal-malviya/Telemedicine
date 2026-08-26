import { NextResponse } from "next/server";

export async function GET() {
  // In a real application, you would fetch this data from a database
  const history = [
    {
      id: "apt123",
      doctorName: "Dr. Rajesh Khanna",
      date: "2023-05-15",
      problem: "Chest Pain",
      prescription: "Aspirin 75mg daily",
    },
    {
      id: "apt124",
      doctorName: "Dr. Priya Sharma",
      date: "2023-06-02",
      problem: "Skin rash",
      prescription: "Hydrocortisone cream",
    },
    {
      id: "apt125",
      doctorName: "Dr. Amit Patel",
      date: "2023-06-20",
      problem: "Fever",
      prescription: "Paracetamol 500mg",
    },
  ];

  return NextResponse.json(history);
}
