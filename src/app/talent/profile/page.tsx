"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

type Availability = "available" | "busy" | "not_available";

export default function TalentProfilePage() {
  const { user } = useAuthStore();
  const [availability, setAvailability] = useState<Availability>("available");
  const [isEditing, setIsEditing] = useState(false);

  const profileData = {
    fullName: user.email.split("@")[0],
    headline: "Complete your profile to get started",
    location: "Not set",
    profession: "Not set",
    industry: [],
    about: "Add your bio to tell recruiters about yourself.",
    verificationTier: user.verification_tier,
    profileViews: 0,
    shortlists: 0,
    messages: 0,
    avatar: null as string | null,
  };

  const skills: { name: string; proficiency: "beginner" | "intermediate" | "expert" }[] = [
    { name: "Acting", proficiency: "intermediate" },
    { name: "Dancing", proficiency: "beginner" },
    { name: "Stage Combat", proficiency: "intermediate" },
    { name: "Voice Modulation", proficiency: "beginner" },
  ];

  const languages = [
    { name: "Hindi", fluency: "native" },
    { name: "English", fluency: "fluent" },
    { name: "Marathi", fluency: "conversational" },
  ];

  return (
    <div>
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Cover / Banner area */}
          <div className="h-24 bg-gradient-to-r from-brand-soft to-brand-light" />

          <div className="px-6 pb-6">
{/* Avatar */}
            <div className="relative -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full bg-surface-secondary border-4 border-card flex items-center justify-center text-2xl font-bold text-text-muted">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <>
                    {profileData.fullName.split(" ").map((n) => n[0]).join("")}
                  </>
                )}
              </div>
              {/* Verification Badge */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Name & Headline */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-text-primary">{profileData.fullName}</h1>
                <p className="text-sm text-text-tertiary mt-1">{profileData.headline}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-brand-hover hover:text-brand-active font-medium"
              >
                Edit Profile
              </button>
            </div>

            {/* Location & Profession */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-text-secondary bg-muted-bg px-3 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M8 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {profileData.location}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-text-secondary bg-muted-bg px-3 py-1 rounded-full">
                {profileData.profession}
              </span>
              {profileData.industry.map((ind) => (
                <span key={ind} className="text-sm text-text-tertiary px-3 py-1">
                  {ind}
                </span>
              ))}
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-text-secondary">Availability:</span>
              <div className="flex gap-1 bg-muted-bg p-1 rounded-lg">
                {(["available", "busy", "not_available"] as Availability[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvailability(a)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      availability === a
                        ? "bg-card text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {a === "available" ? "Available" : a === "busy" ? "Busy" : "Not Available"}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{profileData.profileViews}</div>
                <div className="text-xs text-text-muted">Profile Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{profileData.shortlists}</div>
                <div className="text-xs text-text-muted">Shortlists</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">{profileData.messages}</div>
                <div className="text-xs text-text-muted">Messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-card rounded-2xl border border-border mt-6 p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">About</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {profileData.about}
          </p>
        </div>

        {/* Skills Section */}
        <div className="bg-card rounded-2xl border border-border mt-6 p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-page border border-border rounded-lg text-sm"
              >
                <span className="text-text-primary">{skill.name}</span>
                <span className={`text-xs ${
                  skill.proficiency === "expert" ? "text-success-text" :
                  skill.proficiency === "intermediate" ? "text-brand-hover" :
                  "text-text-muted"
                }`}>
                  {skill.proficiency}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <div className="bg-card rounded-2xl border border-border mt-6 p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Languages</h2>
          <div className="space-y-2">
            {languages.map((lang) => (
              <div key={lang.name} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{lang.name}</span>
                <span className="text-xs text-text-muted capitalize bg-surface-light px-2 py-0.5 rounded">
                  {lang.fluency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-text-secondary font-medium hover:bg-page transition-all">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v4H2v-4M8 2v8M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View Public Profile
          </button>
          <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-text-secondary font-medium hover:bg-page transition-all">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5v3l2.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Analytics
          </button>
        </div>
    </div>
  );
}