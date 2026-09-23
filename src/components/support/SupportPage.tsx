"use client";

import {
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Headphones,
  Mail,
  Megaphone,
  MessageSquareMore,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  name: string;
  description: string;
  icon: LucideIcon;
  tone: string;
};

const categories: Category[] = [
  { name: "Account", description: "Profile, settings and security", icon: UserRound, tone: "category-violet" },
  { name: "Verification", description: "KYC and document checks", icon: ShieldCheck, tone: "category-blue" },
  { name: "Talent Search", description: "Find and connect with talent", icon: Search, tone: "category-green" },
  { name: "Campaigns", description: "Create, manage and promote", icon: Megaphone, tone: "category-rose" },
  { name: "Payments", description: "Billing, invoices and plans", icon: CreditCard, tone: "category-orange" },
  { name: "Messaging", description: "Chat and notifications", icon: MessageSquareMore, tone: "category-purple" },
  { name: "Technical", description: "Fix issues and get help", icon: Wrench, tone: "category-teal" },
];

const faqs: Array<[string, string]> = [
  ["How do I verify my account on Rootin?", "Open Account, choose Verification, and follow the secure document-check steps."],
  ["How can I post a casting campaign?", "Go to Projects, tap Create Campaign, add your brief, and publish when it is ready."],
  ["How do I search for talent?", "Use Talent Search to filter profiles by role, location, skills, and availability."],
  ["What are the payment options?", "Available payment methods appear securely at checkout and in your billing settings."],
  ["How do I upgrade my plan?", "Open Subscription from your account menu to compare plans and upgrade."],
  ["Why am I not receiving messages?", "Check notification permissions and your internet connection, then refresh your inbox."],
];

type Ticket = {
  id: string;
  subject: string;
  date: string;
  status: string;
  tone: string;
  description: string;
};

const initialTickets: Ticket[] = [
  { id: "#RTN-78543", subject: "Payment not reflecting", date: "20 Sep", status: "Open", tone: "status-open", description: "Payment completed but not reflecting in the wallet balance." },
  { id: "#RTN-77211", subject: "Document verification issue", date: "18 Sep", status: "In Progress", tone: "status-progress", description: "Submitted documents are still pending review." },
  { id: "#RTN-76109", subject: "Cannot send messages", date: "14 Sep", status: "Resolved", tone: "status-resolved", description: "Messages were failing to send. Fixed after reconnecting." },
];

export function SupportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [ticketList, setTicketList] = useState<Ticket[]>(initialTickets);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const messagesHref = pathname.startsWith("/recruiter") ? "/recruiter/messages" : "/talent/messages";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("rootin-support-tickets");
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted tickets on mount
      if (Array.isArray(parsed)) setTicketList(parsed as Ticket[]);
    } catch {
      // Corrupt storage — fall back to the default tickets.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("rootin-support-tickets", JSON.stringify(ticketList));
    } catch {
      // Storage unavailable — tickets still work for this session.
    }
  }, [ticketList]);

  const matches = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase());

  const countHits = (term: string) =>
    categories.filter(({ name, description }) => matches(name, term) || matches(description, term)).length +
    faqs.filter(([question, answer]) => matches(question, term) || matches(answer, term)).length;

  const filteredCategories = submittedQuery
    ? categories.filter(({ name, description }) => matches(name, submittedQuery) || matches(description, submittedQuery))
    : categories;

  const filteredFaqs = submittedQuery
    ? faqs.filter(([question, answer]) => matches(question, submittedQuery) || matches(answer, submittedQuery))
    : faqs;

  const applySearch = (term: string) => {
    const cleaned = term.trim();
    setQuery(term);
    setSubmittedQuery(cleaned);
    if (!cleaned) {
      setNotice("Type a question to search support.");
      return;
    }
    const hits = countHits(cleaned);
    setNotice(
      hits > 0
        ? `${hits} result${hits === 1 ? "" : "s"} for \u201c${cleaned}\u201d`
        : `No results for \u201c${cleaned}\u201d. Try another keyword.`,
    );
  };

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setNotice("Showing all help topics.");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch(query);
  };

  const submitTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = newSubject.trim();
    if (!subject) {
      setNotice("Give your ticket a subject before submitting.");
      return;
    }
    const id = `#RTN-${Math.floor(10000 + Math.random() * 89999)}`;
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    setTicketList((current) => [
      { id, subject, date, status: "Open", tone: "status-open", description: newDescription.trim() || "No additional details provided." },
      ...current,
    ]);
    setNewSubject("");
    setNewDescription("");
    setTicketDialogOpen(false);
    setNotice(`Ticket ${id} created. Our team will reply soon.`);
  };

  return (
    <div className="support-theme min-h-screen bg-background pb-8 text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-7">
        <div className="mb-4 flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Go back"
            className="size-9 rounded-full"
            onClick={() => router.back()}
          >
            <ChevronRight className="rotate-180" />
          </Button>
          <div>
            <p className="text-[11px] font-semibold text-primary">Help &amp; Support</p>
            <h1 className="text-2xl font-extrabold leading-none text-ink md:text-3xl">Help &amp; Support</h1>
          </div>
        </div>

        <section className="support-hero overflow-hidden rounded-lg border border-primary/10">
          <div className="relative min-h-[430px] md:min-h-[320px]">
            <div className="support-agent-wrap absolute inset-x-0 top-0 h-48 overflow-hidden md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[46%]">
              <Image
                src="/images/support-agent.png"
                alt="Rootin support specialist wearing a headset"
                width={1024}
                height={1024}
                priority
                className="h-full w-full object-cover object-[center_18%]"
              />
              <div className="support-agent-fade absolute inset-0" />
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="text-[10px] font-bold text-ink">Support online</span>
              </div>
            </div>

            <div className="relative z-10 flex min-h-[430px] flex-col justify-end p-5 md:min-h-[320px] md:w-[58%] md:justify-center md:p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                <Sparkles className="size-3" /> Personal support, whenever you need it
              </div>
              <h2 className="max-w-md text-3xl font-extrabold leading-[1.02] text-ink md:text-5xl">What can we help you solve?</h2>
              <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground md:text-sm">
                Find a quick answer or talk to our support team.
              </p>
              <form onSubmit={submitSearch} className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] rounded-lg border border-primary/20 bg-card p-1.5 shadow-hero-search">
                <label className="flex min-w-0 items-center gap-2 px-2">
                  <Search className="size-4 shrink-0 text-primary" />
                  <span className="sr-only">Search support</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground"
                    placeholder="What do you need help with?"
                  />
                </label>
                <Button type="submit" size="icon" className="size-9" aria-label="Search support"><ChevronRight /></Button>
              </form>
              <p className="mt-2 min-h-4 text-[10px] font-medium text-primary" aria-live="polite">{notice}</p>
              <div className="mt-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Popular searches">
                {["Verify account", "Post a casting call", "Find talent", "Payment issues"].map((item) => (
                  <Button key={item} type="button" variant="outline" size="sm" onClick={() => applySearch(item)} className="h-7 shrink-0 rounded-full bg-card/75 px-3 text-[10px] font-medium">
                    {item}
                  </Button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex -space-x-1.5" aria-hidden="true">
                  <span className="size-5 rounded-full border-2 border-support bg-primary/25" />
                  <span className="size-5 rounded-full border-2 border-support bg-accent" />
                  <span className="grid size-5 place-items-center rounded-full border-2 border-support bg-primary text-[7px] font-bold text-primary-foreground">8+</span>
                </span>
                Real people · Average reply under 2 hours
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-ink">Browse Help Categories</h2>
              <p className="text-[11px] text-muted-foreground">Find answers by topic.</p>
            </div>
            <Button variant="link" size="sm" className="h-auto shrink-0 p-0 text-xs" onClick={clearSearch}>View all <ChevronRight /></Button>
          </div>
          {filteredCategories.length > 0 ? (
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:px-0 scrollbar-none">
            {filteredCategories.map(({ name, description, icon: Icon, tone }) => (
              <button key={name} type="button" onClick={() => setNotice(`${name} articles selected`)} className={`${tone} category-card snap-start`}>
                <span className="category-icon"><Icon /></span>
                <span className="mt-3 block text-xs font-extrabold text-ink">{name}</span>
                <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
          ) : (
            <div className="rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
              No categories match &ldquo;{submittedQuery}&rdquo;.{" "}
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearSearch}>Clear search</Button>
            </div>
          )}
        </section>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-lg border border-border bg-card p-4 md:p-5">
            <div className="mb-2">
              <h2 className="text-lg font-extrabold text-ink">Frequently Asked Questions</h2>
              <p className="text-[11px] text-muted-foreground">Quick answers to common questions.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-1.5">
              {filteredFaqs.map(([question, answer], index) => (
                <AccordionItem key={question} value={`faq-${index}`} className="rounded-md border border-border px-3">
                  <AccordionTrigger className="py-3 text-xs font-semibold text-ink hover:no-underline">{question}</AccordionTrigger>
                  <AccordionContent className="text-xs leading-5 text-muted-foreground">{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <div className="mt-1.5 rounded-md border border-border px-3 py-4 text-xs text-muted-foreground">
                No answers found for &ldquo;{submittedQuery}&rdquo;.{" "}
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearSearch}>Clear search</Button>
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-primary/10 bg-support p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Headphones /></span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold text-ink">Contact Support</h2>
                <p className="text-[10px] text-muted-foreground">Our team is here for you.</p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => setContactOpen(true)}>Contact Support</Button>
            <div className="mt-3 divide-y divide-border rounded-md bg-card px-3">
              <div className="flex gap-3 py-3">
                <Clock3 className="size-4 shrink-0 text-primary" />
                <div><p className="text-[10px] text-muted-foreground">Average response time</p><p className="text-xs font-bold text-ink">Under 2 hours</p></div>
              </div>
              <div className="flex gap-3 py-3">
                <CircleHelp className="size-4 shrink-0 text-primary" />
                <div><p className="text-[10px] text-muted-foreground">Support hours</p><p className="text-xs font-bold text-ink">Mon–Sat, 9:00 AM–7:00 PM</p></div>
              </div>
              <div className="flex gap-3 py-3">
                <Mail className="size-4 shrink-0 text-primary" />
                <div><p className="text-[10px] text-muted-foreground">Get help via</p><p className="text-xs font-bold text-ink">Email, chat or ticket</p></div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-4 rounded-lg border border-border bg-card p-4 md:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-ink">Your Support Tickets</h2>
              <p className="text-[11px] text-muted-foreground">Track previous support requests.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTicketDialogOpen(true)}><Plus /> <span className="hidden sm:inline">Create New Ticket</span><span className="sm:hidden">New</span></Button>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {ticketList.map((ticket) => (
              <article key={ticket.id} className="rounded-md border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-primary">{ticket.id}</p>
                    <h3 className="mt-1 truncate text-xs font-bold text-ink">{ticket.subject}</h3>
                  </div>
                  <span className={`${ticket.tone} status-pill`}>{ticket.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Updated {ticket.date}</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => setViewingTicket(ticket)}>View <ChevronRight /></Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="support-theme sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">Create support ticket</DialogTitle>
            <DialogDescription>Tell us what went wrong and our team will get back to you.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTicket} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                placeholder="e.g. Payment not reflecting"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Describe the issue in a few lines"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Submit ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewingTicket !== null} onOpenChange={(open) => { if (!open) setViewingTicket(null); }}>
        <DialogContent className="support-theme sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">{viewingTicket?.subject}</DialogTitle>
            <DialogDescription>{viewingTicket?.id} · Updated {viewingTicket?.date}</DialogDescription>
          </DialogHeader>
          {viewingTicket && (
            <div className="grid gap-3">
              <span className={`${viewingTicket.tone} status-pill w-fit`}>{viewingTicket.status}</span>
              <p className="text-xs leading-5 text-muted-foreground">{viewingTicket.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="support-theme sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">Contact support</DialogTitle>
            <DialogDescription>Mon–Sat, 9:00 AM–7:00 PM · Average reply under 2 hours.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button onClick={() => router.push(messagesHref)}><MessageSquareMore /> Open chat</Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@connectme.app"><Mail /> Email us</a>
            </Button>
            <Button variant="outline" onClick={() => { setContactOpen(false); setTicketDialogOpen(true); }}><Plus /> Create a ticket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
