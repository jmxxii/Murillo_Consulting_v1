import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/App";
import en from "@/i18n/en";
import es from "@/i18n/es";
import { STORAGE_KEY } from "@/i18n";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("language routing", () => {
  it("renders English at the root by default", async () => {
    renderAt("/");
    expect(
      await screen.findByRole("heading", { level: 1, name: en.hero.headline }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
  });

  it("renders Spanish at /es", async () => {
    renderAt("/es");
    expect(
      await screen.findByRole("heading", { level: 1, name: es.hero.headline }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
  });

  it("ignores a stored preference on a deep link, so shared URLs are stable", async () => {
    window.localStorage.setItem(STORAGE_KEY, "es");
    renderAt("/campaigns/restaurants");
    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
  });

  it("honours a stored Spanish preference on the bare root", async () => {
    window.localStorage.setItem(STORAGE_KEY, "es");
    renderAt("/");
    expect(
      await screen.findByRole("heading", { level: 1, name: es.hero.headline }),
    ).toBeInTheDocument();
  });

  it("shows a localized 404 for an unknown English route", async () => {
    renderAt("/nope");
    expect(
      await screen.findByRole("heading", { level: 1, name: en.notFound.heading }),
    ).toBeInTheDocument();
  });

  it("shows a localized 404 for an unknown Spanish route", async () => {
    renderAt("/es/nope");
    expect(
      await screen.findByRole("heading", { level: 1, name: es.notFound.heading }),
    ).toBeInTheDocument();
  });
});

describe("language switcher", () => {
  it("switches the page copy, the nav labels and the document language", async () => {
    renderAt("/");
    await screen.findByRole("heading", { level: 1, name: en.hero.headline });

    const [spanishOption] = screen.getAllByRole("radio", { name: "Español" });
    await act(async () => {
      fireEvent.click(spanishOption);
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: es.hero.headline }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
    expect(screen.getAllByRole("link", { name: es.nav.contact }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: en.nav.howItWorks })).toBeNull();
  });

  it("persists the choice so a return visit to / stays in Spanish", async () => {
    renderAt("/");
    const [spanishOption] = await screen.findAllByRole("radio", { name: "Español" });
    await act(async () => {
      fireEvent.click(spanishOption);
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("es");
  });

  it("marks the active language with aria-checked, not just color", async () => {
    renderAt("/es");
    const [english] = await screen.findAllByRole("radio", { name: "English" });
    const [spanish] = screen.getAllByRole("radio", { name: "Español" });
    expect(spanish).toHaveAttribute("aria-checked", "true");
    expect(english).toHaveAttribute("aria-checked", "false");
  });

  it("is reachable as real buttons, so it works from the keyboard", async () => {
    renderAt("/");
    const options = await screen.findAllByRole("radio", { name: "Español" });
    for (const option of options) {
      expect(option.tagName).toBe("BUTTON");
      expect(option).not.toBeDisabled();
    }
  });
});

describe("navigation", () => {
  it("renders every nav item, translated, pointing at real sections", async () => {
    renderAt("/");
    await screen.findByRole("heading", { level: 1, name: en.hero.headline });

    for (const label of [
      en.nav.howItWorks,
      en.nav.services,
      en.nav.about,
      en.nav.faq,
      en.nav.contact,
    ]) {
      const links = screen.getAllByRole("link", { name: label });
      expect(links.length).toBeGreaterThan(0);
      const href = links[0].getAttribute("href") ?? "";
      expect(href.startsWith("#")).toBe(true);
      expect(document.querySelector(href)).not.toBeNull();
    }
  });

  it("prefixes nav anchors with /es on the Spanish homepage", async () => {
    renderAt("/es");
    await screen.findByRole("heading", { level: 1, name: es.hero.headline });
    const [link] = screen.getAllByRole("link", { name: es.nav.contact });
    expect(link.getAttribute("href")).toBe("/es#contact");
  });

  it("exposes a skip link targeting the main landmark", async () => {
    renderAt("/");
    const skip = await screen.findByRole("link", { name: en.common.skipToContent });
    expect(skip).toHaveAttribute("href", "#main");
    expect(document.getElementById("main")).not.toBeNull();
  });

  it("opens the mobile menu and shows translated links plus the language selector", async () => {
    renderAt("/es");
    await screen.findByRole("heading", { level: 1, name: es.hero.headline });

    const trigger = screen.getByRole("button", { name: es.nav.mobileMenuLabel });
    await act(async () => {
      fireEvent.click(trigger);
    });

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(es.nav.howItWorks);
    expect(dialog).toHaveTextContent(es.nav.contact);
    expect(dialog).toHaveTextContent(es.nav.languageLabel);
    expect(
      screen.getByRole("button", { name: es.nav.closeMenu }),
    ).toBeInTheDocument();
  });
});

describe("homepage content", () => {
  it("renders every required section in both languages", async () => {
    for (const [path, dict] of [
      ["/", en],
      ["/es", es],
    ] as const) {
      const { unmount } = renderAt(path);
      await screen.findByRole("heading", { level: 1, name: dict.hero.headline });

      for (const heading of [
        dict.reliability.heading,
        dict.process.heading,
        dict.services.heading,
        dict.whyUs.heading,
        dict.industries.heading,
        dict.billCta.heading,
        dict.about.heading,
        dict.faq.heading,
        dict.contact.heading,
      ]) {
        expect(
          screen.getAllByRole("heading", { name: heading }).length,
          `${path} missing "${heading}"`,
        ).toBeGreaterThan(0);
      }
      unmount();
    }
  });

  it("has exactly one h1 per page", async () => {
    renderAt("/");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("keeps the utility/supplier distinction in the reliability copy", async () => {
    renderAt("/");
    await screen.findByRole("heading", { level: 1, name: en.hero.headline });
    const body = document.body.textContent ?? "";
    expect(body).toContain("same established utility infrastructure");
    expect(body).toContain("pricing and supply options");
  });

  it("does not read as restaurant-specific", async () => {
    renderAt("/");
    await screen.findByRole("heading", { level: 1, name: en.hero.headline });
    const hero = screen.getByRole("heading", { level: 1 }).textContent ?? "";
    expect(hero.toLowerCase()).not.toContain("restaurant");
  });
});

describe("campaign routes", () => {
  it("renders the campaign template for a known slug", async () => {
    renderAt("/campaigns/restaurants");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Your kitchen runs all day. Your energy rate should work just as hard.",
      }),
    ).toBeInTheDocument();
  });

  it("renders the Spanish campaign under /es", async () => {
    renderAt("/es/campaigns/restaurants");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Tu cocina trabaja todo el día. Tu tarifa de energía debería trabajar igual.",
      }),
    ).toBeInTheDocument();
  });

  it("renders the campaign's own process, services and FAQ sections", async () => {
    renderAt("/campaigns/restaurants");
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.getAllByRole("heading", { name: "Built around how restaurants actually use energy" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("heading", { name: "Questions restaurant owners ask" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "What we review" }).length).toBeGreaterThan(0);
  });

  it("404s an unknown campaign slug", async () => {
    renderAt("/campaigns/not-a-campaign");
    expect(
      await screen.findByRole("heading", { level: 1, name: en.notFound.heading }),
    ).toBeInTheDocument();
  });
});

describe("page metadata", () => {
  it("sets a distinct title, canonical and hreflang set per language", async () => {
    const { unmount } = renderAt("/");
    await waitFor(() => expect(document.title).toBe(en.seo.homeTitle));
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://murilloconsulting.com/");
    expect(
      document.querySelector('link[rel="alternate"][hreflang="es"]')?.getAttribute("href"),
    ).toBe("https://murilloconsulting.com/es");
    expect(
      document.querySelector('meta[property="og:locale"]')?.getAttribute("content"),
    ).toBe("en_US");
    unmount();

    renderAt("/es");
    await waitFor(() => expect(document.title).toBe(es.seo.homeTitle));
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://murilloconsulting.com/es");
    expect(
      document.querySelector('meta[property="og:locale"]')?.getAttribute("content"),
    ).toBe("es_US");
  });

  it("marks draft campaign pages noindex", async () => {
    renderAt("/campaigns/restaurants");
    await waitFor(() =>
      expect(
        document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      ).toBe("noindex, nofollow"),
    );
  });

  it("emits JSON-LD without unconfirmed business details", async () => {
    renderAt("/");
    await waitFor(() => expect(document.getElementById("structured-data")).not.toBeNull());
    const data = JSON.parse(document.getElementById("structured-data")!.textContent!);
    const org = data["@graph"].find(
      (node: { "@type": string }) => node["@type"] === "Organization",
    );
    expect(org.name).toBe("Murillo Consulting, LLC");
    // Phone and service area are unconfirmed, so they must not be published.
    expect(org.contactPoint?.telephone).toBeUndefined();
    expect(org.areaServed).toBeUndefined();
  });
});
