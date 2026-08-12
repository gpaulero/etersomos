"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Instagram,
  Menu,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Mail,
  Shield,
  Check,
  Send,
  Loader2,
  CreditCard,
  Landmark,
  Gem,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FormPausedBanner from "@/components/form-paused-banner";
import { cmsJson } from "@/lib/cms-helpers";
import { useSiteContent } from "@/hooks/use-site-content";

/* ======================================================================== */
/*                                 DATA                                      */
/* ======================================================================== */

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Amatista",
    price: 15000,
    image: "/images/amethyst.png",
    description:
      "Protección y paz interior. Ideal para meditación y conexión espiritual.",
    category: "Amatista",
  },
  {
    id: 2,
    name: "Cuarzo Rosa",
    price: 12000,
    image: "/images/rose-quartz.png",
    description:
      "Amor propio y sanación emocional. Atrae energías de amor y compasión.",
    category: "Cuarzo Rosa",
  },
  {
    id: 3,
    name: "Cuarzo Claro",
    price: 10000,
    image: "/images/clear-quartz.png",
    description:
      "Amplificador energético universal. Limpieza y armonización de chakras.",
    category: "Cuarzo Claro",
  },
  {
    id: 4,
    name: "Citrino",
    price: 13000,
    image: "/images/citrine.png",
    description:
      "Prosperidad y abundancia. Estimula la creatividad y la autoconfianza.",
    category: "Citrino",
  },
  {
    id: 5,
    name: "Turmalina Negra",
    price: 11000,
    image: "/images/tourmaline.png",
    description:
      "Protección contra energías negativas. Radicación y conexión a tierra.",
    category: "Turmalina",
  },
  {
    id: 6,
    name: "Selinita",
    price: 14000,
    image: "/images/selenite.png",
    description:
      "Paz y claridad mental. Conexión con guías espirituales y ángeles.",
    category: "Selinita",
  },
];

const crystalCategories = [
  "Todos",
  "Amatista",
  "Cuarzo Rosa",
  "Cuarzo Claro",
  "Citrino",
  "Turmalina",
  "Selinita",
];

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Sesiones", href: "/lecturas" },
  { label: "Cursos", href: "/cursos" },
  { label: "Membresía", href: "/membresias" },
  { label: "Expansión", href: "/recursos" },
  { label: "Tienda", href: "/tienda" },
  { label: "Contacto", href: "/#contacto" },
];

/* ======================================================================== */
/*                            ANIMATION VARS                                 */
/* ======================================================================== */

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

/* ======================================================================== */
/*                           MAIN PAGE                                       */
/* ======================================================================== */

export default function TiendaPage() {
  const [tiendaEnabled, setTiendaEnabled] = useState<boolean | null>(null);
  const [pauseMessage, setPauseMessage] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [navScrolled, setNavScrolled] = useState(false);
  const { cmsMap } = useSiteContent();

  /* ---- Check if tienda is enabled ---- */
  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const forms = data.forms || {};
        setTiendaEnabled(forms.tienda !== false);
        setPauseMessage(data.pauseMessage || "");
      })
      .catch(() => setTiendaEnabled(true));
  }, []);

  /* ---- Checkout form state ---- */
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>(
    {}
  );

  /* ---- Nav scroll effect ---- */
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---- Floating stars ---- */
  const [starsCount, setStarsCount] = useState(15);
  useEffect(() => {
    setStarsCount(window.innerWidth < 640 ? 6 : 15);
  }, []);
  const stars = Array.from({ length: starsCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  /* ---- Helpers ---- */
  const formatPrice = (price: number) =>
    `$${price.toLocaleString("es-AR")} ARS`;

  /* ---- Cart operations ---- */
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} agregado al carrito`, {
      description: `$${product.price.toLocaleString("es-AR")} ARS`,
      icon: <Check className="size-5 text-green-400" />,
    });
  }, []);

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cmsProducts = cmsJson<Product[]>(cmsMap, 'crystals.products', products);
  const cmsCategories = cmsJson<string[]>(cmsMap, 'crystals.categories', crystalCategories);

  const filteredProducts =
    activeCategory === "Todos"
      ? cmsProducts
      : cmsProducts.filter((p) => p.category === activeCategory);

  /* ---- Checkout session helpers ---- */
  const saveCheckoutSession = (
    paymentMethod: string,
    paymentId?: string
  ) => {
    const session = {
      type: "crystal_order" as const,
      customerName: checkoutForm.name,
      customerEmail: checkoutForm.email,
      customerPhone: checkoutForm.phone,
      address: checkoutForm.address,
      city: checkoutForm.city,
      province: checkoutForm.province,
      postalCode: checkoutForm.postalCode,
      notes: checkoutForm.notes,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cartTotal,
      paymentMethod,
      paymentId: paymentId || null,
      createdAt: new Date().toISOString(),
    };
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    localStorage.setItem(
      `checkoutSession_${sessionId}`,
      JSON.stringify(session)
    );
    return sessionId;
  };

  const validateCheckoutForm = () => {
    const errors: Record<string, string> = {};
    if (!checkoutForm.name.trim()) errors.name = "Ingresá tu nombre completo";
    if (!checkoutForm.email.trim()) errors.email = "Ingresá tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email))
      errors.email = "Ingresá un email válido";
    if (!checkoutForm.phone.trim()) errors.phone = "Ingresá tu teléfono";
    if (!checkoutForm.address.trim())
      errors.address = "Ingresá tu dirección";
    if (!checkoutForm.city.trim()) errors.city = "Ingresá tu ciudad";
    if (!checkoutForm.province.trim())
      errors.province = "Ingresá tu provincia";
    if (!checkoutForm.postalCode.trim())
      errors.postalCode = "Ingresá tu código postal";
    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutChange = (field: string, value: string) => {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
    if (checkoutErrors[field]) {
      setCheckoutErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePayWithMercadoPago = async () => {
    if (!validateCheckoutForm()) return;
    setCheckoutSubmitting(true);
    try {
      const sessionId = saveCheckoutSession("mercadopago");
      const res = await fetch("/api/payments/create-mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          sessionId,
          buyerEmail: checkoutForm.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.initPoint) {
        const sessionKey = `checkoutSession_${sessionId}`;
        const session = JSON.parse(
          localStorage.getItem(sessionKey) || "{}"
        );
        session.paymentId = data.preferenceId;
        localStorage.setItem(sessionKey, JSON.stringify(session));
        setCartOpen(false);
        setCheckoutDialogOpen(false);
        window.location.href = data.initPoint;
      } else {
        toast.error(
          data.error || "Error al crear la preferencia de MercadoPago"
        );
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  /* ================================================================== */
  /*                          RETURN JSX                                 */
  /* ================================================================== */

  // Loading state
  if (tiendaEnabled === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Tienda pausada — mostrar banner
  if (!tiendaEnabled) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            navScrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
          }`}
        >
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/images/logo-etersomos.jpg" alt="Eter Somos Logo" width={40} height={40} className="rounded-full" />
              <span className="text-violet-400 font-serif font-semibold text-lg tracking-[0.2em] uppercase">ETER SOMOS</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.filter(l => l.href !== "/tienda").map((link) => (
                <Link key={link.href} href={link.href} className="text-sm transition-colors duration-300 font-sans font-medium text-foreground/60 hover:text-violet-400">
                  {link.label}
                </Link>
              ))}
              <a href="https://instagram.com/etersomos" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-violet-400 transition-colors duration-300" aria-label="Instagram">
                <Instagram className="size-5" />
              </a>
            </div>
            <div className="flex lg:hidden items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground/50 hover:text-violet-400">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-72">
                  <SheetHeader>
                    <SheetTitle className="text-violet-400 font-serif tracking-[0.2em] uppercase">ETER SOMOS</SheetTitle>
                    <SheetDescription className="text-foreground/60">Navegación</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 mt-8">
                    {navLinks.filter(l => l.href !== "/tienda").map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-mystic-900/50 transition-all duration-300 text-foreground/70 hover:text-violet-400">
                        {link.label}
                        <ChevronRight className="size-4" />
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </header>

        <div className="flex-1 flex items-center justify-center pt-20 pb-16 px-4">
          <div className="w-full max-w-lg">
            <FormPausedBanner formKey="tienda" customTitle="Tienda en construcción" customMessage="Pronto vas a poder explorar nuestros cristales seleccionados con amor e intención." />
          </div>
        </div>

        <footer className="border-t border-mystic-800/20 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-violet-400/80 hover:text-violet-300 transition-colors duration-300 text-sm font-sans font-medium">
              Volver al inicio
              <ArrowRight className="size-4" />
            </Link>
            <p className="text-foreground/30 text-xs font-sans mt-4">© 2026 Eter Somos. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#161310",
            color: "#f0ebe5",
            border: "1px solid #2a252066",
          },
        }}
      />

      {/* ============================================================ */}
      {/*                       NAVIGATION BAR                          */}
      {/* ============================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navScrolled
            ? "glass shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo-etersomos.jpg"
              alt="Eter Somos Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-violet-400 font-serif font-semibold text-lg tracking-[0.2em] uppercase">
              ETER SOMOS
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors duration-300 font-sans font-medium ${
                  link.href === "/tienda"
                    ? "text-violet-400"
                    : "text-foreground/60 hover:text-violet-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://instagram.com/etersomos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/50 hover:text-violet-400 transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
            {/* Desktop Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/50 hover:text-violet-400 transition-colors duration-300"
              onClick={() => setCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-violet-500 text-white border-0 text-[10px] px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/50 hover:text-violet-400 transition-colors duration-300"
              onClick={() => setCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-violet-500 text-white border-0 text-[10px] px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/50 hover:text-violet-400"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-72"
              >
                <SheetHeader>
                  <SheetTitle className="text-violet-400 font-serif tracking-[0.2em] uppercase">
                    ETER SOMOS
                  </SheetTitle>
                  <SheetDescription className="text-foreground/60">
                    Navegación
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-mystic-900/50 transition-all duration-300 ${
                        link.href === "/tienda"
                          ? "text-violet-400"
                          : "text-foreground/70 hover:text-violet-400"
                      }`}
                    >
                      {link.label}
                      <ChevronRight className="size-4" />
                    </Link>
                  ))}
                  <Separator className="bg-mystic-800/30 my-4" />
                  <a
                    href="https://instagram.com/etersomos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-violet-400 hover:bg-mystic-900/50 transition-all duration-300"
                  >
                    <Instagram className="size-5" />
                    <span>@etersomos</span>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* ============================================================ */}
      {/*                        HERO / HEADER                          */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-background to-background" />

        {/* Floating stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-violet-300/40 animate-twinkle pointer-events-none"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ duration: 0.8 }}
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
              <div className="w-16 h-16 rounded-xl bg-violet-500/15 flex items-center justify-center mx-auto mb-6">
                <Gem className="size-8 text-violet-400" />
              </div>
            </motion.div>
            <motion.span
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block text-violet-400 text-xs font-sans font-semibold tracking-[0.3em] uppercase mb-3"
            >
              Para tu camino espiritual
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3"
            >
              Tienda de Cristales
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-foreground/50 max-w-xl mx-auto font-sans"
            >
              Seleccionados con amor e intención
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*                      PRODUCT GRID                              */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Tabs
              defaultValue="Todos"
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <TabsList className="flex flex-wrap justify-center gap-1 bg-mystic-900/50 p-1 rounded-xl border border-mystic-800/30">
                {cmsCategories.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className={`rounded-lg px-3 py-2 text-xs data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 text-foreground/50 font-sans ${
                      cat === activeCategory
                        ? "data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                        : "hover:text-foreground/70"
                    }`}
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Product Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass hover:shadow-lg hover:shadow-violet-900/10 transition-all duration-500 group h-full border-mystic-700/20 hover:border-violet-500/20 flex flex-col rounded-2xl overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mystic-950/60 to-transparent" />
                    </div>
                    <CardHeader className="pb-2 px-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-foreground font-serif">
                          {product.name}
                        </CardTitle>
                        <span className="text-violet-400 font-serif font-semibold text-lg">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 px-5">
                      <p className="text-foreground/50 text-sm leading-relaxed font-sans">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter className="px-5 pb-5">
                      <Button
                        className="w-full bg-foreground/90 hover:bg-foreground text-background font-sans font-medium rounded-full py-3 text-sm transition-all duration-300 hover:scale-[1.02]"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingBag className="size-4 mr-2" />
                        Agregar al carrito
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*                          FOOTER                                */}
      {/* ============================================================ */}
      <footer className="border-t border-mystic-800/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/images/logo-etersomos.jpg"
                  alt="Eter Somos"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="text-violet-400 font-serif font-bold tracking-[0.2em] uppercase text-lg">
                  ETER SOMOS
                </span>
              </div>
              <p className="text-foreground/40 text-sm leading-relaxed font-sans">
                Lecturas, cursos y cristales para tu camino espiritual.
                Conexión con la sabiduría del alma.
              </p>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                Contacto
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:etersomos@gmail.com"
                    className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    <Mail className="size-4" />
                    etersomos@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/etersomos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    <Instagram className="size-4" />
                    @etersomos
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/5493518629325"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/40 hover:text-violet-400 transition-colors duration-300 text-sm font-sans"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-violet-400 font-serif font-semibold mb-4 text-sm uppercase tracking-wider">
                Tienda
              </h3>
              <p className="text-foreground/40 text-sm leading-relaxed font-sans mb-4">
                Envíos a toda Argentina. Cada cristal es seleccionado y
                empaquetado con cuidado y protección energética.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-violet-400/80 hover:text-violet-300 transition-colors duration-300 text-sm font-sans font-medium"
              >
                Volver al inicio
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <Separator className="bg-mystic-800/20 my-10" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground/30 text-sm font-sans">
              © 2026 Eter Somos. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/etersomos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/30 hover:text-violet-400 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://wa.me/5493518629325"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/30 hover:text-violet-400 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-5" />
              </a>
              <a
                href="mailto:etersomos@gmail.com"
                className="text-foreground/30 hover:text-violet-400 transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*                       CART SHEET                               */}
      {/* ============================================================ */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="bg-mystic-950/95 backdrop-blur-xl border-mystic-800/30 w-full sm:max-w-md flex flex-col"
        >
          <SheetHeader>
            <SheetTitle className="text-violet-400 font-serif tracking-wider flex items-center gap-2">
              <ShoppingBag className="size-5" />
              Tu Carrito
            </SheetTitle>
            <SheetDescription className="text-foreground/60 font-sans">
              {cartCount === 0
                ? "Tu carrito está vacío"
                : `${cartCount} ${
                    cartCount === 1 ? "producto" : "productos"
                  } en tu carrito`}
            </SheetDescription>
          </SheetHeader>

          {cart.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl glass"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground font-semibold text-sm truncate font-sans">
                        {item.name}
                      </h4>
                      <p className="text-violet-400 text-sm font-medium font-serif">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-foreground/60 hover:text-violet-400"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="text-sm font-medium text-foreground/80 w-6 text-center font-sans">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-foreground/60 hover:text-violet-400"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-foreground/40 hover:text-red-400 ml-auto"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-mystic-800/30 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground/60 font-medium font-sans">
                    Total
                  </span>
                  <span className="text-violet-400 text-xl font-serif font-bold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutDialogOpen(true);
                  }}
                  className="w-full bg-foreground hover:bg-foreground/80 text-background font-sans font-semibold py-6 rounded-full transition-all duration-300 hover:scale-[1.02]"
                >
                  <CreditCard className="size-5 mr-2" />
                  Pagar
                </Button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-foreground/40">
                    <Shield className="size-3.5" />
                    <span className="text-xs font-sans">Pago seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/40">
                    <Lock className="size-3.5" />
                    <span className="text-xs font-sans">
                      Datos encriptados
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <ShoppingBag className="size-12 text-mystic-700 mb-4" />
              <p className="text-foreground/50 text-sm font-sans">
                Explorá nuestra tienda y agregá los cristales que resuenen
                con vos.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ============================================================ */}
      {/*                   CHECKOUT FORM DIALOG                        */}
      {/* ============================================================ */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="bg-mystic-950/98 backdrop-blur-xl border-mystic-700/40 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-400 font-serif text-2xl flex items-center gap-2">
              <CreditCard className="size-5" />
              Finalizá tu Compra
            </DialogTitle>
            <DialogDescription className="text-foreground/60 font-sans">
              Completá tus datos de envío para recibir tus cristales.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="checkout-name" className="text-foreground/80 text-sm font-medium font-sans">
                Nombre completo <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-name"
                placeholder="Ej: María González"
                value={checkoutForm.name}
                onChange={(e) =>
                  handleCheckoutChange("name", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.name ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.name && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="checkout-email" className="text-foreground/80 text-sm font-medium font-sans">
                Email <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-email"
                type="email"
                placeholder="Ej: maria@ejemplo.com"
                value={checkoutForm.email}
                onChange={(e) =>
                  handleCheckoutChange("email", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.email ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.email && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.email}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="checkout-phone" className="text-foreground/80 text-sm font-medium font-sans">
                Teléfono <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-phone"
                type="tel"
                placeholder="Ej: 1155123456"
                value={checkoutForm.phone}
                onChange={(e) =>
                  handleCheckoutChange("phone", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.phone ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.phone && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.phone}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="checkout-address" className="text-foreground/80 text-sm font-medium font-sans">
                Dirección (calle y número){" "}
                <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-address"
                placeholder="Ej: Av. Corrientes 1234"
                value={checkoutForm.address}
                onChange={(e) =>
                  handleCheckoutChange("address", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.address ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.address && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.address}
                </p>
              )}
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <Label htmlFor="checkout-city" className="text-foreground/80 text-sm font-medium font-sans">
                Ciudad <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-city"
                placeholder="Ej: Buenos Aires"
                value={checkoutForm.city}
                onChange={(e) =>
                  handleCheckoutChange("city", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.city ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.city && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.city}
                </p>
              )}
            </div>

            {/* Provincia */}
            <div className="space-y-2">
              <Label htmlFor="checkout-province" className="text-foreground/80 text-sm font-medium font-sans">
                Provincia <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-province"
                placeholder="Ej: CABA"
                value={checkoutForm.province}
                onChange={(e) =>
                  handleCheckoutChange("province", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.province ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.province && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.province}
                </p>
              )}
            </div>

            {/* Código Postal */}
            <div className="space-y-2">
              <Label htmlFor="checkout-postal" className="text-foreground/80 text-sm font-medium font-sans">
                Código Postal <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="checkout-postal"
                placeholder="Ej: 1234"
                value={checkoutForm.postalCode}
                onChange={(e) =>
                  handleCheckoutChange("postalCode", e.target.value)
                }
                className={`bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 font-sans ${checkoutErrors.postalCode ? "border-red-400/60" : ""}`}
              />
              {checkoutErrors.postalCode && (
                <p className="text-red-400 text-xs font-sans">
                  {checkoutErrors.postalCode}
                </p>
              )}
            </div>

            {/* Notas adicionales */}
            <div className="space-y-2">
              <Label htmlFor="checkout-notes" className="text-foreground/80 text-sm font-medium font-sans">
                Notas adicionales
              </Label>
              <Textarea
                id="checkout-notes"
                placeholder="Instrucciones especiales de envío, horarios preferidos..."
                rows={3}
                value={checkoutForm.notes}
                onChange={(e) =>
                  handleCheckoutChange("notes", e.target.value)
                }
                className="bg-mystic-900/50 border-mystic-700/40 focus:border-violet-500/60 text-foreground placeholder:text-foreground/30 resize-none font-sans"
              />
            </div>

            <Separator className="bg-mystic-800/30" />

            {/* Order summary */}
            <div className="p-3 rounded-xl bg-mystic-900/50 border border-mystic-700/30">
              <p className="text-sm text-foreground/60 mb-2 font-medium font-sans">
                Resumen del pedido
              </p>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm mb-1 font-sans"
                >
                  <span className="text-foreground/70">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-foreground/80">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator className="bg-mystic-800/30 my-2" />
              <div className="flex justify-between font-bold">
                <span className="text-violet-300 font-sans">Total</span>
                <span className="text-violet-400 font-serif">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-mystic-900/30 border border-mystic-700/20">
              <Shield className="size-5 text-violet-400 shrink-0" />
              <p className="text-xs text-foreground/50 leading-relaxed font-sans">
                Tus datos están protegidos con encriptación SSL. No
                almacenamos información de tarjetas de crédito.
              </p>
            </div>

            {/* Payment button - MercadoPago only */}
            <Button
              onClick={handlePayWithMercadoPago}
              disabled={checkoutSubmitting}
              className="w-full bg-[#009ee3] hover:bg-[#0089c7] text-white font-semibold text-base py-5 rounded-full transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 font-sans"
            >
              {checkoutSubmitting ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Landmark className="size-5 mr-2" />
                  Pagar con MercadoPago
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
