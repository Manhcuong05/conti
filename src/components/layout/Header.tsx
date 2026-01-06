import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BriefcaseBusiness } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
const navLinks = [
  { name: 'Bảng giá', path: '/pricing' },
  { name: 'Tài nguyên', path: '/resources' },
  { name: 'Về chúng tôi', path: '/about' },
];
export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-500 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <span className="text-2xl font-display font-black tracking-tight text-blue-900">CONTI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 text-sm font-bold transition-all duration-200",
                    isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-500"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="font-bold hover:bg-blue-50 hover:text-blue-600">
              <Link to="/portal">Tra cứu hồ sơ</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10">
              <Link to="/lien-he">Tư vấn miễn phí</Link>
            </Button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs border-none bg-slate-50 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-8 pb-4">
                    <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 mb-10">
                      <div className="bg-blue-500 p-2 rounded-lg text-white">
                        <BriefcaseBusiness className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-display font-black text-blue-900">CONTI</span>
                    </Link>
                    <nav className="flex flex-col space-y-2">
                      {navLinks.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.path}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            cn(
                              "px-4 py-3 text-lg font-bold rounded-xl transition-all",
                              isActive ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-100"
                            )
                          }
                        >
                          {link.name}
                        </NavLink>
                      ))}
                    </nav>
                  </div>
                  <div className="mt-auto p-8 pt-4 space-y-4 bg-white border-t border-slate-100">
                    <Button variant="outline" className="w-full h-14 font-bold border-slate-200 rounded-2xl" asChild>
                      <Link to="/portal" onClick={closeMobileMenu}>Tra cứu hồ sơ</Link>
                    </Button>
                    <Button asChild className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10">
                      <Link to="/lien-he" onClick={closeMobileMenu}>Tư vấn miễn phí</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
