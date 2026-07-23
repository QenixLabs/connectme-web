"use client";

import { Card } from "@/components/ui/card";
import { FaLinkedin } from "react-icons/fa";

const MOCK_TEAM = [
  { name: "Rohan Malhotra", role: "CEO & Founder", initials: "RM" },
  { name: "Neha Kapoor", role: "Head of Production", initials: "NK" },
  { name: "Arjun Mehta", role: "Creative Director", initials: "AM" },
  { name: "Simran D'Souza", role: "HR Manager", initials: "SD" },
];

export function RecruiterTeamSection() {
  return (
    <Card className="border-border p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Our Team</h2>
        <button className="text-sm font-semibold text-amber hover:underline">
          View All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {MOCK_TEAM.map((m) => (
          <div key={m.name} className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-2 ring-amber/40">
              {m.initials}
            </div>
            <div className="mt-2 text-sm font-semibold">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.role}</div>
            <FaLinkedin className="mt-1.5 h-4 w-4 text-primary" />
          </div>
        ))}
      </div>
    </Card>
  );
}
