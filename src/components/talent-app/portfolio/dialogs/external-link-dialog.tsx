"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreatePortfolioLink } from "@/hooks/use-portfolio";

export function ExternalLinkDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const addLink = useCreatePortfolioLink();

  const close = () => {
    setUrl("");
    setTitle("");
    onOpenChange(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^https?:\/\/\S+$/i.test(url.trim())) {
      toast.error("Enter a valid URL starting with https://");
      return;
    }
    try {
      await addLink.mutateAsync({ url: url.trim(), title: title.trim() || undefined, category: "work" });
      toast.success("External link added");
      close();
    } catch {
      toast.error("Could not add external link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add External Link</DialogTitle>
          <DialogDescription>Add a website, campaign, article, or social link to your media library.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/your-work" inputMode="url" required />
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Link title (optional)" />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={addLink.isPending}>
              {addLink.isPending ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
              Add Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
