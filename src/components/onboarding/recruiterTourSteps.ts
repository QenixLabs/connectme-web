import type { DriveStep } from "driver.js";

export const recruiterTourSteps: DriveStep[] = [
  {
    element: '[data-tour="recruiter-summary"]',
    popover: {
      title: "Your recruiting overview",
      description: "This summary gives you a quick view of active work, applications, and the people you are currently looking for.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="recruiter-copilot"]',
    popover: {
      title: "Search with AI Casting Copilot",
      description: "Describe the project, role, or talent you need. Copilot turns your request into a talent search and takes you to matching results.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="recruiter-actions"]',
    popover: {
      title: "Start common recruiting tasks",
      description: "These shortcuts help you quickly find talent, create a campaign, review your shortlist, or compare candidates.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="recruiter-tasks"]',
    popover: {
      title: "Stay on top of priority tasks",
      description: "Open a task to continue campaign work, review applications, or complete the next action needed for a project.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="recruiter-matches"]',
    popover: {
      title: "Review AI talent matches",
      description: "These candidates are matched to your recruiting needs. Open a profile to learn more or shortlist someone for later.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="recruiter-campaigns"]',
    popover: {
      title: "Manage active campaigns",
      description: "Track each campaign, its applications, and progress. Select a campaign to view details and continue casting.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="recruiter-profile-menu"]',
    onHighlightStarted: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    popover: {
      title: "Open your account menu",
      description: "Click your profile picture to open the account menu. The next step explains the options available to recruiters.",
      side: "bottom",
      align: "end",
      showButtons: ["close"],
    },
    advanceOn: "click",
  },
  {
    element: '[data-tour="recruiter-profile-menu-content"]',
    popover: {
      title: "Everything in your account menu",
      description: "Billing manages payments. Profile opens your recruiter profile. Verification manages documents. Help & Support gets assistance. Analytics shows performance. Shortlist and Team help you organize recruiting. You can also switch to your provider workspace or log out.",
      side: "left",
      align: "end",
    },
    waitForElement: 1000,
  },
];
