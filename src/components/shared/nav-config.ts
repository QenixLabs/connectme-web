"use client";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  User,
  Briefcase,
  Package,
  ShoppingBag,
  MessageSquare,
  FolderKanban,
  Search,
  Users,
  ShieldCheck,
  Layers,
  Flag,
  UsersRound,
  BarChart3,
  Star,
  ClipboardList,
  LayoutGrid,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const talentNavItems: NavItem[] = [
  { label: "Home", href: "/talent/dashboard", icon: Home },
  { label: "Opportunities", href: "/talent/opportunities", icon: Briefcase },
  { label: "Services", href: "/services", icon: ShoppingBag },
  { label: "Network", href: "/talent/network", icon: UsersRound },
  { label: "Analytics", href: "/talent/analytics", icon: BarChart3 },
  { label: "Messages", href: "/talent/messages", icon: MessageSquare },
  { label: "Reputation", href: "/talent/reputation", icon: Star },
  { label: "Profile", href: "/talent/profile", icon: User },
];

export const recruiterNavItems: NavItem[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: Home },
  { label: "Campaigns", href: "/recruiter/campaigns", icon: FolderKanban },
  { label: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
  { label: "Find Talent", href: "/recruiter/find-talent", icon: Search },
  { label: "Shortlist", href: "/recruiter/shortlist", icon: UsersRound },
  { label: "Team", href: "/recruiter/team", icon: Users },
  { label: "Messages", href: "/recruiter/messages", icon: MessageSquare },
];

export const recruiterBottomNavItems: NavItem[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: Home },
  { label: "Campaigns", href: "/recruiter/campaigns", icon: FolderKanban },
  { label: "Find Talent", href: "/recruiter/find-talent", icon: Search },
  { label: "Messages", href: "/recruiter/messages", icon: MessageSquare },
  { label: "Profile", href: "/recruiter/profile", icon: User },
];

export const providerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/provider/profile", icon: User },
  { label: "Listings", href: "/provider/listings", icon: Package },
  { label: "Inquiries", href: "/provider/inquiries", icon: ClipboardList },
  { label: "Messages", href: "/provider/messages", icon: MessageSquare },
  { label: "Verification", href: "/provider/verify-documents", icon: ShieldCheck },
];

export const providerBottomNavItems: NavItem[] = [
  { label: "Dashboard", href: "/provider/dashboard", icon: Home },
  { label: "Inquiries", href: "/provider/inquiries", icon: ClipboardList },
  { label: "Listings", href: "/provider/listings", icon: Layers },
  { label: "Messages", href: "/provider/messages", icon: MessageSquare },
  { label: "More", href: "/provider/profile", icon: LayoutGrid },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
  { label: "Plans", href: "/admin/plans", icon: Layers },
  { label: "Reports", href: "/admin/reports", icon: Flag },
];
