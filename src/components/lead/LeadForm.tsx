import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Info, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileDropzone from "@/components/lead/FileDropzone";
import Turnstile from "@/components/lead/Turnstile";
import { siteConfig } from "@/content/site";
import { dictionaries, LOCALES } from "@/i18n";
import { useLanguage } from "@/i18n/LanguageProvider";
import { track } from "@/lib/analytics";
import { createLeadSchema, type LeadFormValues } from "@/lib/leadSchema";
import { sanitizeFileName } from "@/lib/fileValidation";
import {
  getTurnstileSiteKey,
  isSubmissionConfigured,
  submitLead,
} from "@/lib/leadSubmission";
import { cn } from "@/lib/utils";

type SubmitState = "idle" | "submitting" | "success" | "error" | "verification" | "unconfigured";

interface LeadFormProps {
  campaign?: string;
  successMessage?: string;
  submitLabel?: string;
  className?: string;
}

/**
 * Lead + bill submission form.
 *
 * Validation lives in `createLeadSchema`, built from the active dictionary,
 * so every message is translated and switching language re-derives the
 * resolver. Attachments are validated client-side for fast feedback only;
 * the API repeats every check. Submission is create -> upload to S3 ->
 * complete (see `src/lib/leadSubmission.ts`), behind a Turnstile check.
 */
const LeadForm = ({
  campaign,
  successMessage,
  submitLabel,
  className,
}: LeadFormProps) => {
  const { t, locale, format } = useLanguage();
  const [state, setState] = useState<SubmitState>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);
  // Turnstile tokens are single use: bumping `attempt` remounts the widget.
  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [verificationPending, setVerificationPending] = useState(false);
  const turnstileSiteKey = getTurnstileSiteKey();
  const statusRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(() => createLeadSchema(t), [t]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      phone: "",
      preferredLanguage: locale,
      businessLocation: "",
      serviceType: undefined,
      locationCount: 1,
      notes: "",
      consent: false as unknown as true,
    },
  });

  const submitting = state === "submitting";

  const onSubmit = async (values: LeadFormValues) => {
    if (turnstileSiteKey && !token) {
      setVerificationPending(true);
      return;
    }
    setVerificationPending(false);
    setState("submitting");
    setProgress(files.length > 0 ? 0 : null);

    track({
      name: "lead_form_submit",
      has_files: files.length > 0,
      file_count: files.length,
    });

    const result = await submitLead({
      payload: {
        ...values,
        notes: values.notes || undefined,
        consent: true,
        submittedLocale: locale,
        campaign,
      },
      files,
      turnstileToken: token ?? "",
      onProgress: files.length > 0 ? setProgress : undefined,
    });

    setProgress(null);
    setToken(null);
    setAttempt((n) => n + 1);

    if (result.status === "success") {
      const delivered = files.filter((_, index) => !result.rejected.includes(index));
      if (delivered.length > 0) {
        track({
          name: "bill_upload_complete",
          file_count: delivered.length,
          total_size_kb: Math.round(
            delivered.reduce((sum, file) => sum + file.size, 0) / 1024,
          ),
        });
      }
      track({ name: "lead_form_success", file_count: delivered.length });
      if (campaign) track({ name: "campaign_conversion", campaign });
      setRejectedNames(result.rejected.map((index) => sanitizeFileName(files[index].name)));
      setState("success");
      form.reset();
      setFiles([]);
    } else if (result.status === "unconfigured") {
      track({ name: "lead_form_error", reason: "unconfigured" });
      setState("unconfigured");
    } else {
      track({ name: "lead_form_error", reason: result.reason });
      setState(result.reason === "verification" ? "verification" : "error");
    }

    // Move focus to the outcome so it is announced and visible immediately.
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const onInvalid = () => {
    track({ name: "lead_form_error", reason: "validation" });
  };

  if (state === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className={cn(
          "rounded-lg border border-secondary/30 bg-secondary-subtle p-8 text-center",
          className,
        )}
      >
        <CheckCircle2
          className="mx-auto h-11 w-11 text-secondary"
          aria-hidden="true"
        />
        <h3 className="mt-4 font-display text-xl font-bold text-primary">
          {t.form.status.successTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-secondary-subtle-foreground">
          {successMessage ?? t.form.status.successBody}
        </p>
        {rejectedNames.length > 0 && (
          <p className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-md bg-destructive-subtle px-3 py-2 text-left text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {format(t.form.status.filesRejected, { names: rejectedNames.join(", ") })}
              {siteConfig.email && (
                <>
                  {" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    onClick={() => track({ name: "email_click", placement: "form_rejected_files" })}
                    className="font-semibold underline"
                  >
                    {siteConfig.email}
                  </a>
                </>
              )}
            </span>
          </p>
        )}
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setState("idle")}
        >
          {t.form.submitAnother}
        </Button>
      </div>
    );
  }

  const notices: Partial<Record<SubmitState, { title: string; body: string; Icon: typeof Info }>> = {
    unconfigured: {
      title: t.form.status.unconfiguredTitle,
      body: t.form.status.unconfiguredBody,
      Icon: Info,
    },
    verification: {
      title: t.form.status.verificationTitle,
      body: t.form.status.verificationBody,
      Icon: AlertTriangle,
    },
    error: {
      title: t.form.status.errorTitle,
      body: t.form.status.errorBody,
      Icon: AlertTriangle,
    },
  };
  const blockingNotice = notices[state];

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-card md:p-8",
        className,
      )}
    >
      <h3 className="font-display text-xl font-bold text-primary">
        {t.form.introHeading}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        {t.form.introBody}
      </p>

      {blockingNotice && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 flex gap-3 rounded-md border border-destructive/25 bg-destructive-subtle p-4"
        >
          <blockingNotice.Icon
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-destructive">
              {blockingNotice.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {blockingNotice.body}
            </p>
            {siteConfig.email && (
              <a
                href={`mailto:${siteConfig.email}`}
                onClick={() => track({ name: "email_click", placement: "form_error" })}
                className="mt-2 inline-block rounded-sm text-sm font-semibold text-accent-strong hover:underline"
              >
                {siteConfig.email}
              </a>
            )}
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="mt-7 space-y-8"
          noValidate
        >
          <fieldset disabled={submitting} className="space-y-5">
            <legend className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary">
              {t.form.sectionContact}
            </legend>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.firstName}</FormLabel>
                    <FormControl>
                      <Input autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.lastName}</FormLabel>
                    <FormControl>
                      <Input autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.email}</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" inputMode="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.phone}</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" inputMode="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.preferredLanguage}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LOCALES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {dictionaries[code].meta.localeNativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <fieldset disabled={submitting} className="space-y-5">
            <legend className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary">
              {t.form.sectionBusiness}
            </legend>

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.businessName}</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="businessLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.businessLocation}</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormDescription>{t.form.businessLocationHelp}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.form.locationCount}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={100} inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.form.serviceType}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-3 sm:grid-cols-3"
                    >
                      {[
                        { value: "electricity", label: t.form.serviceTypeElectricity },
                        { value: "gas", label: t.form.serviceTypeGas },
                        { value: "both", label: t.form.serviceTypeBoth },
                      ].map((option) => (
                        <FormItem key={option.value} className="space-y-0">
                          <FormLabel
                            className={cn(
                              "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-colors",
                              field.value === option.value
                                ? "border-secondary bg-secondary-subtle text-secondary-subtle-foreground"
                                : "border-input hover:border-secondary/50",
                            )}
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <fieldset disabled={submitting}>
            <legend className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary">
              {t.form.sectionFiles}
            </legend>
            <FileDropzone
              files={files}
              onChange={setFiles}
              uploadProgress={progress}
              disabled={submitting}
            />
          </fieldset>

          <fieldset disabled={submitting} className="space-y-5">
            <legend className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary">
              {t.form.sectionNotes}
            </legend>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.form.notes}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      ({t.common.optional})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t.form.notesPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="rounded-md border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed">
                        {t.form.consent}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {t.form.consentHelp}
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          {turnstileSiteKey && (
            <div>
              <Turnstile
                key={attempt}
                siteKey={turnstileSiteKey}
                language={locale}
                onToken={(value) => {
                  setToken(value);
                  if (value) setVerificationPending(false);
                }}
              />
              {verificationPending && (
                <p role="alert" className="mt-2 text-sm font-medium text-destructive">
                  {t.form.errors.verificationPending}
                </p>
              )}
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="cta"
              size="xl"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.form.submitting}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {submitLabel ?? t.form.submit}
                </>
              )}
            </Button>

            {!isSubmissionConfigured() && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t.form.status.unconfiguredBody}
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
