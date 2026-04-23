import { Link, Outlet } from "@tanstack/react-router";

function Header() {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/villas", label: "Villas" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Book Now" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="font-serif text-xl tracking-tight text-foreground">
          First<span className="text-primary">rose</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary text-sm font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-lg text-foreground">Firstrose</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Curated coastal villas for unforgettable escapes.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Contact</h4>
            <p className="mt-2 text-sm text-muted-foreground">hello@firstrosevilla.com</p>
            <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Visit</h4>
            <p className="mt-2 text-sm text-muted-foreground">Diani Beach, Kenya</p>
          </div>
        </div>
        <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Firstrose. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
