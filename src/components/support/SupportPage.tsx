"use client";

import {
  ChevronRight,
  CircleHelp,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  Mail,
  LoaderCircle,
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
import { supportApi, type SupportTicket } from "@/lib/api/support";
import { toast } from "sonner";

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

export function SupportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [ticketList, setTicketList] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const messagesHref = pathname.startsWith("/recruiter")
    ? "/recruiter/messages"
    : pathname.startsWith("/provider")
      ? "/provider/messages"
      : "/talent/messages";

  const refreshTickets = async () => {
    setTicketError(false);
    try { setTicketList((await supportApi.mine()).tickets); }
    catch { setTicketError(true); }
    finally { setTicketLoading(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshTickets(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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
    if (ticketSubmitting) return;
    const subject = newSubject.trim();
    const message = newDescription.trim();
    if (subject.length < 3 || !message) {
      toast.error("Add a subject and describe the issue.");
      return;
    }
    setTicketSubmitting(true);
    void supportApi.create({ subject, message, category: ticketCategory || undefined }).then(async (ticket) => {
      setNewSubject(""); setNewDescription(""); setTicketCategory(""); setTicketDialogOpen(false);
      setNotice(`Ticket created. Reference ${ticket._id.slice(-8).toUpperCase()}.`);
      toast.success("Ticket submitted. You can follow the conversation below.");
      await refreshTickets();
    }).catch(() => toast.error("Ticket could not be submitted. Please try again.")).finally(() => setTicketSubmitting(false));
  };

  const openTicket = async (id: string) => {
    try {
      setSelectedTicket(await supportApi.getMine(id));
    } catch {
      toast.error("Could not load this conversation. Please try again.");
    }
  };

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket || !replyMessage.trim() || replySubmitting) return;
    setReplySubmitting(true);
    try {
      const updatedTicket = await supportApi.replyMine(selectedTicket._id, replyMessage.trim());
      setSelectedTicket(updatedTicket);
      setReplyMessage("");
      await refreshTickets();
      toast.success("Reply sent.");
    } catch {
      toast.error("Reply could not be sent. Please try again.");
    } finally {
      setReplySubmitting(false);
    }
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
              <button key={name} type="button" onClick={() => applySearch(name)} className={`${tone} category-card snap-start`}>
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

        <section id="support-tickets" className="mt-4 scroll-mt-24 rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-ink">Your Support Tickets</h2>
              <p className="text-[11px] text-muted-foreground">Track previous support requests.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTicketDialogOpen(true)}><Plus /> <span className="hidden sm:inline">Create New Ticket</span><span className="sm:hidden">New</span></Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ticketLoading ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-5 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading your requests…</div>
            ) : ticketError ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
                <span>We couldn’t load your support requests.</span>
                <Button variant="outline" size="sm" onClick={() => void refreshTickets()}>Try again</Button>
              </div>
            ) : ticketList.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/30 px-5 py-8 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><MessageSquareMore className="size-5" /></span>
                <h3 className="mt-3 text-sm font-bold text-ink">No support requests yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">If you need a hand, send us a message and we’ll take it from there.</p>
                <Button size="sm" className="mt-4" onClick={() => setTicketDialogOpen(true)}><Plus /> Create a request</Button>
              </div>
            ) : ticketList.map((ticket) => (
              <article key={ticket._id} className="rounded-lg border border-border bg-background/60 p-4 transition hover:border-primary/30 hover:shadow-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-primary">#{ticket._id.slice(-8).toUpperCase()}</p>
                    <h3 className="mt-1 truncate text-xs font-bold text-ink">{ticket.subject}</h3>
                  </div>
                  <span className={`${ticket.status === "resolved" || ticket.status === "closed" ? "status-resolved" : ticket.status === "in_progress" ? "status-progress" : "status-open"} status-pill`}>{ticket.status === "waiting_on_user" ? "Your reply needed" : ticket.status.replaceAll("_", " ")}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Updated {new Date(ticket.last_activity_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => void openTicket(ticket._id)}>View conversation <ChevronRight /></Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="support-theme sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">Tell us how we can help</DialogTitle>
            <DialogDescription>Share a few details. Our support team will reply here and you can track the conversation in your requests.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTicket} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-category">What do you need help with?</Label>
              <select id="ticket-category" value={ticketCategory} onChange={(event) => setTicketCategory(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Choose a topic (optional)</option>
                {[
                  ["account", "Account"],
                  ["verification", "Verification"],
                  ["payments", "Payments"],
                  ["technical", "Technical issue"],
                  ["other", "Something else"],
                ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                minLength={3}
                maxLength={120}
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                placeholder="e.g. Payment not reflecting"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                maxLength={10000}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Describe the issue in a few lines"
                rows={5}
              />
              <p className="text-right text-[11px] text-muted-foreground">{newDescription.length}/10,000</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={ticketSubmitting || newSubject.trim().length < 3 || !newDescription.trim()}>
                {ticketSubmitting && <LoaderCircle className="animate-spin" />} {ticketSubmitting ? "Sending…" : "Send request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedTicket !== null} onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}>
        <DialogContent className="support-theme sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ink">{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>Ticket #{selectedTicket?._id.slice(-8).toUpperCase()} · {selectedTicket?.status.replaceAll("_", " ")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg bg-muted/30 p-3">
            {selectedTicket?.replies.length === 0 && <p className="py-5 text-center text-sm text-muted-foreground">Your message is with our team. We’ll reply here.</p>}
            {selectedTicket?.replies.map((reply, index) => <div key={reply._id || index} className={`max-w-[90%] rounded-xl p-3 text-sm ${reply.author_role === "admin" ? "bg-primary/10" : "ml-auto bg-card shadow-sm"}`}><p className="mb-1 text-[10px] font-bold text-muted-foreground">{reply.author_role === "admin" ? "Rootin Support" : "You"} · {new Date(reply.created_at).toLocaleString()}</p><p className="whitespace-pre-wrap break-words">{reply.message}</p></div>)}
          </div>
          {selectedTicket && !["resolved", "closed"].includes(selectedTicket.status) && <form className="grid gap-2" onSubmit={sendReply}><Label htmlFor="ticket-reply" className="sr-only">Your reply</Label><Textarea id="ticket-reply" value={replyMessage} onChange={(event) => setReplyMessage(event.target.value)} placeholder="Write a reply…" maxLength={10000} required /><div className="flex justify-end"><Button type="submit" disabled={replySubmitting || !replyMessage.trim()}>{replySubmitting && <LoaderCircle className="animate-spin" />} {replySubmitting ? "Sending…" : "Send reply"}</Button></div></form>}
          {selectedTicket && ["resolved", "closed"].includes(selectedTicket.status) && <p className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-foreground"><CheckCircle2 className="size-4 text-success" /> This request is closed. Create a new request if you need more help.</p>}
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
              <a href="mailto:support@rootin.app"><Mail /> Email us</a>
            </Button>
            <Button variant="outline" onClick={() => { setContactOpen(false); setTicketDialogOpen(true); }}><Plus /> Create a ticket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
