import type { DriveStep } from "driver.js";

export const talentTourSteps: DriveStep[] = [
  {
    element: '[data-tour="profile-overview"]',
    popover: {
      title: "Your profile at a glance",
      description: "This card shows how recruiters see you, your availability, verification, and profile visibility. Use View Profile to preview your public page, Edit Profile to update it, or Share Profile to send it to someone.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="analytics"]',
    popover: {
      title: "Track your career progress",
      description: "Career Performance summarizes views, applications, and other activity. Select the section title to open Analytics and see the fuller picture.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="opportunities"]',
    popover: {
      title: "Find your next opportunity",
      description: "These are recommended roles matched to your profile. Select a role to view its details, or use See all to browse and filter every opportunity.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="profile-completion"]',
    popover: {
      title: "Build a stronger profile",
      description: "Use your profile strength card to see what is missing and make it easier for recruiters to discover you. Select the arrow to continue editing your profile.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="application-tracker"]',
    popover: {
      title: "Follow every application",
      description: "Application Tracker shows where your applications are—from Applied and Viewed to Shortlisted, Auditions, and Callbacks. Open it to review the full history.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="profile-menu"]',
    onHighlightStarted: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    popover: {
      title: "Open your profile menu",
      description: "Click your profile picture to open the account menu. The next step will explain what each option does.",
      side: "bottom",
      align: "end",
      showButtons: ["close"],
    },
    advanceOn: "click",
  },
  {
    element: '[data-tour="profile-menu-content"]',
    popover: {
      title: "Everything in your account menu",
      description: "Billing manages subscription payments. Profile opens the editor. Verification manages identity documents. Help & Support gets assistance. Analytics and Reputation show progress. Requests shows connection activity. Settings controls preferences. Take a tour replays this guide. You can also switch workspaces or log out here.",
      side: "left",
      align: "end",
    },
    waitForElement: 1000,
  },
];
