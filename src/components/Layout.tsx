import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletStatus } from "./WalletStatus";
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children
}: LayoutProps) {
  const location = useLocation();
  const navigation = [{
    name: 'Mint',
    href: '/'
  }, {
    name: 'My Omamori',
    href: '/my'
  }, {
    name: 'Explore',
    href: '/explore'
  }, {
    name: 'About',
    href: '/about'
  }];
  const isActive = (href: string) => {
    return location.pathname === href;
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover-lift">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-mono text-sm font-bold">
                &lt;&gt;
              </div>
              <div>
                <div className="font-mono text-lg font-bold">hyper.faith</div>
                <div className="text-xs text-muted-foreground -mt-1">
                  mint your omamori; pray for your fills
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map(item => <Button key={item.name} asChild variant={isActive(item.href) ? "secondary" : "ghost"} className="font-mono">
                  <Link to={item.href}>{item.name}</Link>
                </Button>)}
            </nav>

            {/* Wallet Status - Mobile Hidden */}
            <div className="hidden lg:block">
              <WalletStatus />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-4">
              {navigation.map(item => <Button key={item.name} asChild variant={isActive(item.href) ? "secondary" : "ghost"} size="sm" className="font-mono">
                  <Link to={item.href}>{item.name}</Link>
                </Button>)}
            </div>
            <WalletStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="font-mono text-sm text-muted-foreground mb-4">Ancient magic for modern traders</div>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Discord
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
            <div className="mt-6 text-xs text-muted-foreground font-mono">
              hyper.faith © 2024
            </div>
          </div>
        </div>
      </footer>
    </div>;
}