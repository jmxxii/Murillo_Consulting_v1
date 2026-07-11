import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Logo from "@/components/Logo";

const navItems = [
  { label: "About", anchor: "about" },
  { label: "Divisions", anchor: "divisions" },
  { label: "Services", anchor: "services" },
  { label: "Approach", anchor: "approach" },
  { label: "Schedule", anchor: "schedule" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-20">
      <div className="container flex items-center justify-between py-5">
        <Logo variant="nav" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`#${item.anchor}`}
              className="text-primary-foreground/70 hover:text-accent text-sm font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-md"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[280px] sm:w-80 bg-nav border-white/10 p-0 flex flex-col"
          >
            {/* Accessible title (visually hidden) */}
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

            {/* Sheet header */}
            <div className="px-6 py-5 border-b border-white/10">
              <Logo variant="nav" />
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-3 py-3 flex-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.anchor}`}
                  onClick={() => setOpen(false)}
                  className="text-nav-foreground/70 hover:text-accent hover:bg-white/5 px-4 py-3.5 rounded-md text-[15px] font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTA at bottom */}
            <div className="px-5 pb-8 pt-4 border-t border-white/10">
              <a
                href="#schedule"
                onClick={() => setOpen(false)}
                className="block w-full text-center bg-background text-primary hover:bg-surface py-3.5 rounded-md text-sm font-semibold transition-colors"
              >
                Schedule a Consultation
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
