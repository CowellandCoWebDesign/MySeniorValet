import { useState } from "react";
import { Link } from "wouter";
import { Lock, LogIn, UserPlus, Phone, Mail, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type ContactConsent = {
  allowDirectContact: boolean;
  allowPhoneContact: boolean;
};

interface ContactConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
  communityName?: string;
  /** Which field the family is trying to see: 'phone' | 'website' | 'pricing' | 'overview' */
  revealedField?: string;
  /** Called once contact info + consent are submitted (or the family chooses to proceed) */
  onRevealed: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  phone: "phone number",
  website: "website",
  pricing: "detailed pricing",
  overview: "full overview",
};

/**
 * Shown to logged-out visitors before revealing gated contact/pricing info.
 * Offers a login/signup path OR a quick contact form with an explicit consent choice.
 * On submit, records a profile-view referral and unlocks the field.
 */
export function ContactConsentDialog({
  open,
  onOpenChange,
  communityId,
  communityName,
  revealedField,
  onRevealed,
}: ContactConsentDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState<"any" | "no_phone">("any");
  const [submitting, setSubmitting] = useState(false);

  const fieldLabel = FIELD_LABELS[revealedField || ""] || "contact details";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: "A little more info needed",
        description: "Please share your name and email so we can connect you.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("POST", `/api/communities/${communityId}/referral-view`, {
        revealedField,
        contact: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
        consent: {
          allowDirectContact: true,
          allowPhoneContact: contactPref === "any",
        },
      });
      onRevealed();
      onOpenChange(false);
      toast({
        title: "Unlocked!",
        description: `You can now see the ${fieldLabel} for ${communityName || "this community"}.`,
      });
    } catch (error) {
      // Still unlock so the family isn't blocked by a logging failure.
      onRevealed();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-contact-consent">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            See the {fieldLabel}
          </DialogTitle>
          <DialogDescription>
            {communityName ? `${communityName} — ` : ""}Sign in or share a few details to
            unlock {fieldLabel}. We'll let the community know you're interested.
          </DialogDescription>
        </DialogHeader>

        {/* Login / signup path */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full" data-testid="button-consent-login">
              <LogIn className="w-4 h-4 mr-2" />
              Log in
            </Button>
          </Link>
          <Link href="/signup" className="w-full">
            <Button variant="outline" className="w-full" data-testid="button-consent-signup">
              <UserPlus className="w-4 h-4 mr-2" />
              Sign up
            </Button>
          </Link>
        </div>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or share your info</span>
          </div>
        </div>

        {/* Quick contact form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="consent-name">Your name</Label>
            <Input
              id="consent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              data-testid="input-consent-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="consent-email">Email</Label>
            <Input
              id="consent-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              data-testid="input-consent-email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="consent-phone">Phone (optional)</Label>
            <Input
              id="consent-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              data-testid="input-consent-phone"
            />
          </div>

          <RadioGroup
            value={contactPref}
            onValueChange={(v) => setContactPref(v as "any" | "no_phone")}
            className="space-y-2 pt-1"
          >
            <div className="flex items-start gap-2 rounded-md border border-gray-200 dark:border-gray-700 p-2.5">
              <RadioGroupItem value="any" id="pref-any" className="mt-0.5" data-testid="radio-consent-any" />
              <Label htmlFor="pref-any" className="font-normal cursor-pointer leading-snug">
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5" /> The community may contact me by phone, email, or text
                </span>
              </Label>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-gray-200 dark:border-gray-700 p-2.5">
              <RadioGroupItem value="no_phone" id="pref-no-phone" className="mt-0.5" data-testid="radio-consent-no-phone" />
              <Label htmlFor="pref-no-phone" className="font-normal cursor-pointer leading-snug">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5" /> Email or text only — please don't call me
                </span>
              </Label>
            </div>
          </RadioGroup>

          <Button type="submit" className="w-full" disabled={submitting} data-testid="button-consent-submit">
            {submitting ? "Unlocking…" : `Show me the ${fieldLabel}`}
          </Button>
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            We respect your contact preference and never sell your information.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
