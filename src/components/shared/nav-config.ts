"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  Briefcase,
  MessageSquare,
  Bell,
  FolderKanban,
  Search,
  Users,
  ShieldCheck,
  Layers,
  Flag,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const talentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/talent/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/talent/profile", icon: User },
  { label: "Opportunities", href: "/talent/opportunities", icon: Briefcase },
  { label: "Applications", href: "/talent/applications", icon: ClipboardList },
  { label: "Messages", href: "/talent/messages", icon: MessageSquare },
];

export const recruiterNavItems: NavItem[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/recruiter/campaigns", icon: FolderKanban },
  { label: "Find Talent", href: "/recruiter/find-talent", icon: Search },
  { label: "Messages", href: "/recruiter/messages", icon: MessageSquare },
  { label: "Notifications", href: "/recruiter/notifications", icon: Bell },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
  { label: "Plans", href: "/admin/plans", icon: Layers },
  { label: "Reports", href: "/admin/reports", icon: Flag },
];
