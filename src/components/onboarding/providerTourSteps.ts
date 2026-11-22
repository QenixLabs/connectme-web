import type { DriveStep } from "driver.js";

export const providerTourSteps: DriveStep[] = [
  {
    element: '[data-tour="provider-welcome"]',
    popover: {
      title: "Your provider dashboard",
      description: "This welcome card is your starting point for managing your provider profile, services, products, and incoming work.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="provider-controls"]',
    popover: {
      title: "Control availability and profile strength",
      description: "Accepting Inquiries controls whether clients can contact you. Profile Strength opens the editor so you can complete details and improve discovery.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="provider-stats"]',
    popover: {
      title: "See your key numbers",
      description: "These cards show new inquiries, responses, live listings, and profile views. Select a card to open the related area.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="provider-inquiries"]',
    popover: {
      title: "Respond to client inquiries",
      description: "Needs Your Attention shows incoming requests. View an inquiry for details or Reply to keep the conversation moving.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="provider-actions"]',
    popover: {
      title: "Manage your provider work",
      description: "Quick Actions lets you add a service, manage listings, view inquiries, or preview your public profile.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="provider-performance"]',
    popover: {
      title: "Track business performance",
      description: "Review inquiry and listing activity over the last 30 days to understand how your provider business is performing.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="provider-profile-menu"]',
    onHighlightStarted: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    popover: {
      title: "Open your account menu",
      description: "Click your profile picture to open the account menu. The next step explains the options available to providers.",
      side: "bottom",
      align: "end",
      showButtons: ["close"],
    },
    advanceOn: "click",
  },
  {
    element: '[data-tour="provider-profile-menu-content"]',
    popover: {
      title: "Everything in your account menu",
      description: "Billing manages payments. Profile opens your provider profile. Help & Support gets assistance. Listings manages your services and products. Inquiries opens client requests. Verification manages documents. You can also switch workspaces or log out.",
      side: "left",
      align: "end",
    },
    waitForElement: 1000,
  },
];
