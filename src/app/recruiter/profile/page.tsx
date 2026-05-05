"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function RecruiterProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const profileData = {
    companyName: "Company",
    companyWebsite: "",
    companySize: "Not set",
    industry: "Not set",
    contactName: user.email.split("@")[0],
    position: "Not set",
    location: "Not set",
    verificationStatus: user.is_email_verified ? "verified" as const : "pending" as const,
    campaignsPosted: 0,
    talentShortlisted: 0,
    activeCampaigns: 0,
    logo: null as string | null,
  };

  return (
    <div>
        {/* Company Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-6">
            {/* Company Logo & Name */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 border border-slate-200">
                {profileData.logo ? (
                  <img src={profileData.logo} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  profileData.companyName.split(" ").map((w) => w[0]).slice(0, 2).join("")
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{profileData.companyName}</h1>
                  {profileData.verificationStatus === "verified" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{profileData.industry}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Edit Profile
              </button>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Website</p>
                <a
                  href={`https://${profileData.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  {profileData.companyWebsite || "Not set"}
                </a>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Company Size</p>
                <p className="text-sm text-slate-700">{profileData.companySize} employees</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm text-slate-700">{profileData.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Your Position</p>
                <p className="text-sm text-slate-700">{profileData.position}</p>
              </div>
            </div>

            {/* Contact Person */}
            <div className="border-t border-slate-100 pt-4 mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Contact Person</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                  {profileData.contactName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{profileData.contactName}</p>
                  <p className="text-xs text-slate-500">{profileData.position}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-100">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">{profileData.campaignsPosted}</div>
                <div className="text-xs text-slate-500">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">{profileData.talentShortlisted}</div>
                <div className="text-xs text-slate-500">Shortlisted</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">{profileData.activeCampaigns}</div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members (Placeholder) */}
        <div className="bg-white rounded-2xl border border-slate-200 mt-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Manage Team
            </button>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
              {profileData.contactName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{profileData.contactName}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
            <span className="text-xs text-emerald-600 font-medium">You</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Add team members to collaborate on hiring
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border border-amber-200 mt-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">Current Plan</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Free Plan</p>
              <p className="text-sm text-slate-500 mt-1">5 messages/month • 1 campaign/month</p>
            </div>
            <button className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-all">
              Upgrade
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v4H2v-4M8 2v8M4 6l4-4 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Post Campaign
          </button>
          <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Find Talent
          </button>
        </div>
    </div>
  );
}