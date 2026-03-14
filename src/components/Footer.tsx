const Footer = () => {
  return (
    <footer className="bg-nav py-10 md:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-display font-semibold text-nav-foreground tracking-tight">
              Murillo Consulting, LLC
            </p>
            <p className="text-nav-foreground/40 text-[11px] mt-1 leading-relaxed">
              Energy &amp; Sustainability Solutions
              <span className="hidden sm:inline"> &nbsp;·&nbsp; Community &amp; Property Energy Consulting</span>
            </p>
            <p className="text-nav-foreground/30 text-[11px] sm:hidden mt-0.5">
              Community &amp; Property Energy Consulting
            </p>
          </div>
          <p className="text-nav-foreground/50 text-sm shrink-0">
            &copy; {new Date().getFullYear()} Murillo Consulting, LLC.
            <span className="hidden sm:inline"> All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
