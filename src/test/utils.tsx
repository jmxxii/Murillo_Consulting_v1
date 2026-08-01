import { render, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n";

/** Renders a component inside a router + language provider. */
export function renderWithLocale(
  ui: ReactElement,
  locale: Locale = "en",
  initialEntries: string[] = ["/"],
): RenderResult {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LanguageProvider locale={locale}>{ui}</LanguageProvider>
    </MemoryRouter>,
  );
}

/** Builds a File whose leading bytes match a real format signature. */
export function makeFile(
  name: string,
  type: string,
  {
    sizeBytes = 1024,
    signature = "pdf",
  }: { sizeBytes?: number; signature?: "pdf" | "png" | "jpeg" | "none" } = {},
): File {
  const headers: Record<string, number[]> = {
    pdf: [0x25, 0x50, 0x44, 0x46],
    jpeg: [0xff, 0xd8, 0xff],
    png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    none: [0x4d, 0x5a, 0x90, 0x00],
  };
  const head = headers[signature];
  const bytes = new Uint8Array(Math.max(sizeBytes, head.length));
  bytes.set(head, 0);
  return new File([bytes], name, { type });
}
