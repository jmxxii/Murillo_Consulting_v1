const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20">
      <div className="container flex items-center justify-between py-6">
        <a href="#" className="text-primary-foreground font-display font-bold text-xl tracking-tight">
          Murillo Consulting
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["About", "Services", "Approach", "Schedule"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
