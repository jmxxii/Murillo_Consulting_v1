const Footer = () => {
  return (
    <footer className="bg-nav py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display font-semibold text-nav-foreground tracking-tight">
            Murillo Consulting
          </p>
          <p className="text-nav-foreground/50 text-sm">
            &copy; {new Date().getFullYear()} Murillo Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
