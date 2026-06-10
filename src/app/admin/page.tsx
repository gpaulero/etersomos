"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  ShoppingCart,
  GraduationCap,
  Crown,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Star,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GripVertical,
  Timer,
  Hourglass,
  Trash2,
  Download,
  Truck,
  PackageCheck,
  UserCheck,
  Users,
  CircleCheck,
  CircleX,
  Send,
  Power,
  Pause,
  Play,
  FileText,
  RotateCcw,
  Save,
  Upload,
  FolderOpen,
  ExternalLink,
  UserPlus,
  Video,
  Headphones,
  Plus,
  Eye,
  Menu,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { sectionLabels, sectionOrder, defaultSiteContent } from "@/lib/cms-defaults";
import { CMS_UPDATED_EVENT } from "@/hooks/use-site-content";
import { toast, Toaster } from "sonner";

/* ── Types ─�────────────────────────────────────────────────────────────── */

interface Stats {
  overview: {
    totalBookings: number;
    totalCrystalOrders: number;
    totalCourseEnrollments: number;
    totalMemberships: number;
    totalRevenue: number;
    crystalRevenue: number;
    courseRevenue: number;
    recentBookings: number;
    recentOrders: number;
    recentMemberships: number;
  };
  paymentBreakdown: Record<string, { count: number; total: number }>;
  bookingStatuses: Record<string, number>;
  orderStatuses: Record<string, number>;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  readingType: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message?: string | null;
  status: string;
  confirmedAt?: string | null;
  sentAt?: string | null;
  notes?: string | null;
  deliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  type: "crystal" | "course";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string | null;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  paymentId?: string | null;
  status: string;
  courseData?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface Membership {
  id: string;
  name: string;
  email: string;
  membershipId: string;
  membershipName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  fileType: string;
  r2Key: string;
  fileName: string;
  fileSize: number;
  price: number;
  priceArs: number;
  priceUsd: number;
  active: boolean;
  order: number;
  createdAt: string;
  url: string;
}

interface UploadForm {
  title: string;
  description: string;
  fileType: string;
  price: string;
  priceArs: string;
  priceUsd: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Argentina/Cordoba",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Cordoba",
  });
}

function formatCurrency(amount: number, method: string) {
  return method === "paypal"
    ? `US$ ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
    : `$ ${amount.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_progreso: "En Progreso",
  entregada: "Entregada",
  cancelada: "Cancelada",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
  inscrito: "Inscrito",
  en_curso: "En Curso",
  completado: "Completado",
  activa: "Activa",
  vencida: "Vencida",
};

/* ── Sidebar Nav Config ──────────────────────────────────────────────────── */

const navGroups: Array<{
  label: string;
  items: Array<{ id: string; label: string; icon: React.ElementType; countKey?: string }>;
}> = [
  {
    label: "PRINCIPAL",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "lecturas", label: "Lecturas", icon: BookOpen, countKey: "bookings" },
      { id: "cristales", label: "Cristales", icon: ShoppingCart, countKey: "crystals" },
      { id: "cursos", label: "Cursos", icon: GraduationCap, countKey: "courses" },
      { id: "membresias", label: "Membresías", icon: Crown, countKey: "memberships" },
    ],
  },
  {
    label: "AULA VIRTUAL",
    items: [
      { id: "alumnos", label: "Alumnos", icon: Users, countKey: "students" },
      { id: "curso-contenido", label: "Contenido", icon: Video },
    ],
  },
  {
    label: "SITIO WEB",
    items: [
      { id: "cms", label: "Contenido", icon: FileText },
      { id: "recursos", label: "Recursos", icon: FolderOpen, countKey: "resources" },
      { id: "formularios", label: "Formularios", icon: Power },
    ],
  },
  {
    label: "DATOS",
    items: [
      { id: "suscriptores", label: "Suscriptores", icon: Mail, countKey: "subscribers" },
    ],
  },
];

/* ── Sidebar Component ──────────────────────────────────────────────────── */

function SidebarContent({
  activeSection,
  onNavClick,
  onLogout,
  counts,
}: {
  activeSection: string;
  onNavClick: (id: string) => void;
  onLogout: () => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="p-4 border-b border-mystic-700/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gold-400/30 shrink-0">
            <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-playfair text-base text-cream-100 block leading-tight">Admin</span>
            <span className="text-mystic-500 text-[10px] font-josefin uppercase tracking-wider">Eter Somos</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] text-mystic-600 font-josefin uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const count = item.countKey ? counts[item.countKey] || 0 : 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-josefin transition-all ${
                      isActive
                        ? "bg-violet-500/15 text-violet-200 border border-violet-500/20"
                        : "text-mystic-400 hover:text-cream-100 hover:bg-mystic-800/40 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : ""}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-mystic-800/60 text-mystic-500"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-mystic-700/40 space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-josefin text-mystic-400 hover:text-cream-100 hover:bg-mystic-800/40 transition-all">
            <ExternalLink className="w-4 h-4" />
            <span>Ver sitio</span>
          </button>
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-josefin text-mystic-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

/* ── Small Components ───────────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-mystic-800 transition-colors"
      title="Copiar"
    >
      {copied ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3 text-gold-400" />
      )}
    </button>
  );
}

function DeleteButton({
  itemId,
  itemType,
  itemName,
  onDelete,
}: {
  itemId: string;
  itemType: "booking" | "order" | "membership";
  itemName: string;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(itemId);
            setConfirming(false);
          }}
          className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
          title="Confirmar eliminacion"
        >
          <CheckCircle2 className="w-3 h-3 text-red-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(false);
          }}
          className="p-1 rounded bg-mystic-800/60 hover:bg-mystic-700 transition-colors"
          title="Cancelar"
        >
          <X className="w-3 h-3 text-mystic-400" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setConfirming(true);
      }}
      className="p-1 rounded hover:bg-red-500/10 transition-colors group/del"
      title={`Eliminar ${itemName}`}
    >
      <Trash2 className="w-3 h-3 text-mystic-600 group-hover/del:text-red-400 transition-colors" />
    </button>
  );
}

function ExportButton({ type, label, fetchFn }: { type: string; label: string; fetchFn?: typeof fetch }) {
  const [loading, setLoading] = useState(false);
  const _fetch = fetchFn || fetch;

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await _fetch(`/api/admin/contacts?type=${type}`);
      if (!res.ok) throw new Error("Error al exportar");
      const data = await res.json();

      // Generate CSV
      const headers = ["Nombre", "Email", "Fuente", "Fecha"];
      const rows = data.contacts.map((c: { name: string; email: string; source: string; date: string }) => [
        c.name,
        c.email,
        c.source,
        formatDate(c.date),
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((r: string[]) => r.map((v) => `"${v}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contactos_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="text-mystic-400 hover:text-gold-400 hover:bg-mystic-800/60 gap-1.5 h-8 text-xs"
    >
      <Download className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

/* ── Stat Card ──────────────────────────────────────────────────────────── */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="bg-mystic-900/60 border-mystic-700/50 glow-mystic">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-gold-400/70 font-josefin uppercase tracking-wider">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-playfair font-bold text-cream-100">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-mystic-300 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-mystic-800/60">
            <Icon className="w-5 h-5 text-gold-400" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-1" />
            ) : null}
            <span
              className={
                trend === "up"
                  ? "text-emerald-400"
                  : "text-mystic-300"
              }
            >
              {trend === "up" ? "Ultimos 7 dias" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Kanban Column ──────────────────────────────────────────────────────── */

function KanbanColumn({
  column,
  items,
  dragOverColumn,
  setDragOverColumn,
  draggedId,
  updatingId,
  setDraggedId,
  onDrop,
  onToggle,
  expandedRows,
  onDelete,
  itemType,
  renderCard,
  exportType,
  exportLabel,
  fetchFn,
}: {
  column: { key: string; label: string; icon: React.ElementType; color: string; border: string };
  items: Array<{ id: string }>;
  dragOverColumn: string | null;
  setDragOverColumn: (v: string | null) => void;
  draggedId: string | null;
  updatingId: string | null;
  setDraggedId: (v: string | null) => void;
  onDrop: (itemId: string, newStatus: string) => void;
  onToggle: (id: string) => void;
  expandedRows: Set<string>;
  onDelete: (id: string) => void;
  itemType: "booking" | "order" | "membership";
  renderCard: (item: any, isDragging: boolean, isUpdating: boolean, isOpen: boolean) => React.ReactNode;
  exportType?: string;
  exportLabel?: string;
  fetchFn?: typeof fetch;
}) {
  const isOver = dragOverColumn === column.key;

  return (
    <div
      className={`
        flex flex-col rounded-xl border border-mystic-700/40 bg-mystic-900/30
        border-t-2 ${column.border}
        transition-all duration-200
        ${isOver ? "ring-2 ring-gold-400/40 bg-mystic-800/40 scale-[1.01]" : ""}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(column.key);
      }}
      onDragLeave={() => setDragOverColumn(null)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOverColumn(null);
        if (draggedId) {
          onDrop(draggedId, column.key);
          setDraggedId(null);
        }
      }}
    >
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-mystic-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <column.icon className={`w-4 h-4 text-${column.color}-400`} />
          <span className="font-josefin text-sm text-cream-200 font-medium">
            {column.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`bg-${column.color}-500/20 text-${column.color}-300 text-xs`}
          >
            {items.length}
          </Badge>
          {exportType && (
            <ExportButton type={exportType} label={exportLabel || "CSV"} fetchFn={fetchFn} />
          )}
        </div>
      </div>

      {/* Column Body */}
      <div className="p-2 space-y-2 min-h-[200px] max-h-[520px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-8 text-center text-mystic-600 text-xs font-josefin">
            Sin registros
          </div>
        ) : (
          items.map((item) => {
            const isDragging = draggedId === item.id;
            const isUpdating = updatingId === item.id;
            const isOpen = expandedRows.has(item.id);

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                  setDraggedId(item.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", item.id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverColumn(null);
                }}
                className={`
                  group rounded-lg border border-mystic-700/40 bg-mystic-900/60
                  transition-all duration-200 cursor-grab active:cursor-grabbing
                  ${isDragging ? "opacity-40 scale-95 rotate-1" : "hover:border-mystic-600/60 hover:bg-mystic-800/50"}
                  ${isUpdating ? "ring-1 ring-gold-400/50" : ""}
                `}
              >
                {renderCard(item, isDragging, isUpdating, isOpen)}
                {/* Delete button at bottom of each card */}
                <div className="px-3 pb-2 flex justify-end">
                  <DeleteButton
                    itemId={item.id}
                    itemType={itemType}
                    itemName={item.id}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Main Admin Page ────────────────────────────────────────────────────── */

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // CMS Content state
  const [cmsContent, setCmsContent] = useState<Record<string, Record<string, { value: string; label: string; type: string; updatedAt: string }>>>({});
  const [cmsDrafts, setCmsDrafts] = useState<Record<string, string>>({});
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsSaving, setCmsSaving] = useState<string | null>(null); // section being saved

  // Form toggle state
  const [formToggles, setFormToggles] = useState<Record<string, boolean>>({});
  const [pauseMessage, setPauseMessage] = useState("");
  const [togglesLoading, setTogglesLoading] = useState(false);

  const formLabels: Record<string, string> = {
    lecturas: "Lecturas",
    "n1-teorico": "N1 Teorico",
    "n1-con-practica": "N1 con Practica",
    "n2-completo": "N2 Completo",
    ambos: "Ambos Cursos",
    membresias: "Membresias",
    tienda: "Tienda de Cristales",
  };

  // Predefined course options for Registros Akashicos
  const courseOptions = [
    { id: "n1-teorico", label: "RA N1 Teórico" },
    { id: "n1-practica", label: "RA N1 con Práctica" },
    { id: "n2", label: "RA N2 Completo" },
    { id: "ambos", label: "Ambos Niveles (N1 + N2)" },
  ];

  // Resources state
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [resourceError, setResourceError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>({ title: "", description: "", fileType: "documento", price: "", priceArs: "", priceUsd: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingResource, setEditingResource] = useState<string | null>(null);

  // Students state (aula virtual)
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({ email: "", nombre: "", phone: "", password: "" });
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [enrollmentForm, setEnrollmentForm] = useState({ type: "curso", title: "", referenceId: "", notes: "", expiresAt: "" });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [lecturaAudioFile, setLecturaAudioFile] = useState<File | null>(null);
  const [uploadingLecturaAudio, setUploadingLecturaAudio] = useState(false);
  const [lecturaUploadStep, setLecturaUploadStep] = useState<string>(""); // progress message

  // Course Content state (aula virtual)
  const [courseContents, setCourseContents] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [showContentUpload, setShowContentUpload] = useState(false);
  const [contentUploadForm, setContentUploadForm] = useState({ title: "", description: "", fileType: "video" });
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [uploadingContent, setUploadingContent] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");

  // Generic drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem("admin_token");
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", "Bearer " + token);
    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    return fetch(url, { ...options, headers });
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      authFetch("/api/admin/stats").then((res) => {
        if (res.ok) setAuthenticated(true);
        else { sessionStorage.removeItem("admin_token"); setLoading(false); }
      }).catch(() => { sessionStorage.removeItem("admin_token"); setLoading(false); });
    } else { setLoading(false); }
  }, [authFetch]);

  // Fetch data once authenticated
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, bookingsRes, ordersRes, membershipsRes, subscribersRes] =
        await Promise.all([
          authFetch("/api/admin/stats"),
          authFetch("/api/bookings"),
          authFetch("/api/admin/orders"),
          authFetch("/api/admin/memberships"),
          authFetch("/api/admin/subscribers"),
        ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings((data.bookings || []).map((b: any) => ({
          ...b,
          // Normalize status for bookings that don't have one
          status: b.status || "pendiente",
        })));
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders((data.orders || []).map((o: any) => {
          let status = o.status || "";
          // Map existing statuses to kanban columns
          if (o.type === "crystal") {
            const crystalMap: Record<string, string> = {
              "pagado": "pendiente",
              "enviado": "entregado",
              "": "pendiente",
            };
            status = crystalMap[status] || status || "pendiente";
          } else {
            const courseMap: Record<string, string> = {
              "pagado": "inscrito",
              "enviado": "completado",
              "": "inscrito",
            };
            status = courseMap[status] || status || "inscrito";
          }
          return { ...o, status };
        }));
      }
      if (membershipsRes.ok) {
        const data = await membershipsRes.json();
        setMemberships((data.memberships || []).map((m: any) => ({
          ...m,
          status: m.status || "activa",
        })));
      }
      if (subscribersRes.ok) {
        const data = await subscribersRes.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (authenticated) {
      fetchData();
      fetchFormSettings();
      fetchCmsContent();
      fetchResources();
      fetchStudents();
    }
  }, [authenticated, fetchData]);

  // ── CMS Content ──
  const fetchCmsContent = async () => {
    setCmsLoading(true);
    try {
      // First ensure seed
      await authFetch("/api/cms/content/seed", { method: "POST" });
      const res = await authFetch("/api/cms/content");
      if (res.ok) {
        const data = await res.json();
        setCmsContent(data);
        // Initialize drafts from current content
        const drafts: Record<string, string> = {};
        for (const section of Object.values(data)) {
          for (const [key, item] of Object.entries(section as Record<string, { value: string }>)) {
            drafts[key] = item.value;
          }
        }
        setCmsDrafts(drafts);
      }
    } catch {}
    setCmsLoading(false);
  };

  const saveCmsSection = async (section: string) => {
    setCmsSaving(section);
    try {
      const updates: Record<string, string> = {};
      const sectionData = cmsContent[section];
      if (!sectionData) return;
      for (const key of Object.keys(sectionData)) {
        if (cmsDrafts[key] !== undefined) {
          updates[key] = cmsDrafts[key];
        }
      }
      const res = await authFetch("/api/cms/content/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        await fetchCmsContent();
        // Notify main site to refresh (cross-tab via localStorage + same-tab via custom event)
        localStorage.setItem('cms_updated_at', Date.now().toString());
        window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
        toast.success(`${sectionLabels[section] || section} guardado correctamente`);
      } else {
        toast.error("Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCmsSaving(null);
    }
  };

  const saveCmsAll = async () => {
    setCmsSaving("all");
    try {
      const updates: Record<string, string> = {};
      for (const [key, value] of Object.entries(cmsDrafts)) {
        updates[key] = value;
      }
      const res = await authFetch("/api/cms/content/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        await fetchCmsContent();
        // Notify main site to refresh (cross-tab via localStorage + same-tab via custom event)
        localStorage.setItem('cms_updated_at', Date.now().toString());
        window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
        toast.success("Todo el contenido guardado correctamente");
      } else {
        toast.error("Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCmsSaving(null);
    }
  };

  const resetCmsSection = async (section: string) => {
    const sectionData = cmsContent[section];
    if (!sectionData) return;
    const defaults = defaultSiteContent.filter(d => d.section === section);
    const newDrafts = { ...cmsDrafts };
    for (const def of defaults) {
      newDrafts[def.key] = def.value;
    }
    setCmsDrafts(newDrafts);
    toast.success(`${sectionLabels[section] || section} reseteado a valores por defecto`);
  };

  const isCmsDirty = (section: string) => {
    const sectionData = cmsContent[section];
    if (!sectionData) return false;
    return Object.keys(sectionData).some(key => cmsDrafts[key] !== sectionData[key].value);
  };

  const hasAnyCmsDirty = () => {
    return sectionOrder.some(sec => isCmsDirty(sec));
  };

  // ── Form settings ──
  const fetchFormSettings = async () => {
    try {
      const res = await authFetch("/api/settings");
      const data = await res.json();
      setFormToggles(data.forms || {});
      setPauseMessage(data.pauseMessage || "");
    } catch {}
  };

  const handleToggleForm = async (key: string) => {
    // Optimistic update — instant visual feedback
    const currentValue = formToggles[key] !== false;
    setFormToggles((prev) => ({ ...prev, [key]: !currentValue }));
    setTogglesLoading(true);
    try {
      const res = await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forms: { [key]: !currentValue } }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormToggles(data.settings.forms || {});
      } else {
        // Revert on failure
        setFormToggles((prev) => ({ ...prev, [key]: currentValue }));
      }
    } catch {
      // Revert on failure
      setFormToggles((prev) => ({ ...prev, [key]: currentValue }));
    } finally {
      setTogglesLoading(false);
    }
  };

  const handlePauseAll = async () => {
    const allOff = Object.fromEntries(Object.keys(formLabels).map((k) => [k, false]));
    setFormToggles(allOff); // optimistic
    setTogglesLoading(true);
    try {
      const res = await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forms: allOff }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormToggles(data.settings.forms || {});
      }
    } catch {} finally {
      setTogglesLoading(false);
    }
  };

  const handleResumeAll = async () => {
    const allOn = Object.fromEntries(Object.keys(formLabels).map((k) => [k, true]));
    setFormToggles(allOn); // optimistic
    setTogglesLoading(true);
    try {
      const res = await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forms: allOn }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormToggles(data.settings.forms || {});
      }
    } catch {} finally {
      setTogglesLoading(false);
    }
  };

  const handleSavePauseMessage = async () => {
    setTogglesLoading(true);
    try {
      await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseMessage }),
      });
    } catch {} finally {
      setTogglesLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginLoading(true); setPasswordError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (res.ok && data.token) { sessionStorage.setItem("admin_token", data.token); setAuthenticated(true); setPassword(""); }
      else setPasswordError(data.error || "Contrasena incorrecta");
    } catch { setPasswordError("Error de conexion"); }
    finally { setLoginLoading(false); }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    fetchResources();
  };

  // ── Resources ──

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await authFetch("/api/admin/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {
      toast.error("Error al cargar alumnos");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudentForm.email || !newStudentForm.nombre) {
      toast.error("Email y nombre son requeridos");
      return;
    }
    try {
      const res = await authFetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudentForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear alumno");
        return;
      }
      toast.success(`Alumno ${data.student.nombre} creado`);
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      }
      setNewStudentForm({ email: "", nombre: "", phone: "", password: "" });
      fetchStudents();
    } catch {
      toast.error("Error al crear alumno");
    }
  };

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setStudentEnrollments([]);
    try {
      const res = await authFetch(`/api/admin/students/${student.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentEnrollments(data.enrollments || []);
      }
    } catch {
      toast.error("Error al cargar inscripciones");
    }
  };

  const handleAssignEnrollment = async () => {
    if (!selectedStudent || !enrollmentForm.title || !enrollmentForm.type) {
      toast.error("Tipo y título son requeridos");
      return;
    }
    setUploadingLecturaAudio(true);
    setLecturaUploadStep("");
    try {
      let r2Key = "";
      let audioFileName = "";

      // If it's a lectura and has an audio file, upload it first via server-side endpoint
      if (enrollmentForm.type === "lectura" && lecturaAudioFile) {
        setLecturaUploadStep(`Subiendo audio "${lecturaAudioFile.name}"...`);
        const formData = new FormData();
        formData.append("file", lecturaAudioFile);

        const uploadRes = await authFetch(`/api/admin/lectura-upload`, {
          method: "POST",
          body: formData,
          // Note: Don't set Content-Type header - browser sets it with boundary for FormData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          toast.error(uploadData.error || "Error al subir audio");
          setLecturaUploadStep("");
          return;
        }

        r2Key = uploadData.r2Key;
        audioFileName = uploadData.fileName;
        setLecturaUploadStep("Audio subido. Guardando inscripción...");
      }

      // Create the enrollment
      setLecturaUploadStep(enrollmentForm.type === "lectura" && r2Key ? "Guardando inscripción con audio..." : "Guardando inscripción...");
      const res = await authFetch(`/api/admin/students/${selectedStudent.id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...enrollmentForm,
          r2Key,
          fileName: audioFileName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al asignar");
        setLecturaUploadStep("");
        return;
      }

      toast.success(`${enrollmentForm.type} "${enrollmentForm.title}" asignado${r2Key ? " con audio" : ""}`);
      setEnrollmentForm({ type: "curso", title: "", referenceId: "", notes: "", expiresAt: "" });
      setLecturaAudioFile(null);
      setLecturaUploadStep("");
      handleSelectStudent(selectedStudent);
    } catch (err) {
      console.error("[Admin] Error al asignar:", err);
      toast.error("Error al asignar");
      setLecturaUploadStep("");
    } finally {
      setUploadingLecturaAudio(false);
    }
  };

  // Upload audio to an existing enrollment (for adding audio later)
  const handleUploadAudioToEnrollment = async (enrollmentId: string) => {
    if (!lecturaAudioFile) {
      toast.error("Seleccioná un archivo de audio");
      return;
    }
    setUploadingLecturaAudio(true);
    setLecturaUploadStep(`Subiendo audio "${lecturaAudioFile.name}"...`);
    try {
      // Upload file via server-side endpoint (avoids CORS issues with direct R2 upload)
      const formData = new FormData();
      formData.append("file", lecturaAudioFile);
      formData.append("enrollmentId", enrollmentId);

      const uploadRes = await authFetch(`/api/admin/lectura-upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error || "Error al subir audio");
        setLecturaUploadStep("");
        return;
      }

      setLecturaUploadStep("Audio subido. Actualizando inscripción...");
      // Update the enrollment with r2Key
      const updateRes = await authFetch(`/api/admin/enrollments/${enrollmentId}/upload-audio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ r2Key: uploadData.r2Key, fileName: uploadData.fileName }),
      });
      if (!updateRes.ok) {
        toast.error("Error al actualizar inscripción");
        setLecturaUploadStep("");
        return;
      }

      toast.success("Audio subido correctamente");
      setLecturaAudioFile(null);
      setLecturaUploadStep("");
      handleSelectStudent(selectedStudent);
    } catch (err) {
      console.error("[Admin] Error al subir audio:", err);
      toast.error("Error al subir audio");
      setLecturaUploadStep("");
    } finally {
      setUploadingLecturaAudio(false);
    }
  };

  const handleRemoveEnrollmentAudio = async (enrollmentId: string) => {
    if (!confirm("¿Eliminar el audio de esta lectura?")) return;
    try {
      const res = await authFetch(`/api/admin/enrollments/${enrollmentId}/upload-audio`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Audio eliminado");
        handleSelectStudent(selectedStudent);
      }
    } catch {
      toast.error("Error al eliminar audio");
    }
  };

  const handleCleanupExpiredLecturas = async () => {
    if (!confirm("¿Limpiar lecturas expiradas? Esto eliminará los audios de Cloudflare para las lecturas vencidas.")) return;
    try {
      const res = await authFetch("/api/admin/cleanup-lecturas", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.cleaned} lecturas expiradas limpiadas${data.errors > 0 ? ` (${data.errors} errores)` : ""}`);
        if (selectedStudent) handleSelectStudent(selectedStudent);
      } else {
        toast.error("Error al limpiar lecturas expiradas");
      }
    } catch {
      toast.error("Error al limpiar lecturas expiradas");
    }
  };

  const handleUpdateEnrollmentExpiration = async (enrollmentId: string, expiresAt: string) => {
    try {
      const res = await authFetch(`/api/admin/enrollments/${enrollmentId}/upload-audio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresAt }),
      });
      if (res.ok) {
        toast.success("Fecha de expiración actualizada");
        if (selectedStudent) handleSelectStudent(selectedStudent);
      } else {
        toast.error("Error al actualizar expiración");
      }
    } catch {
      toast.error("Error al actualizar expiración");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("¿Eliminar este alumno y todas sus inscripciones?")) return;
    try {
      const res = await authFetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Alumno eliminado");
        if (selectedStudent?.id === id) {
          setSelectedStudent(null);
          setStudentEnrollments([]);
        }
        fetchStudents();
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // ── Course Content Management ──

  const fetchCourseContents = async (courseId: string) => {
    setSelectedCourseId(courseId);
    try {
      const res = await authFetch(`/api/admin/course-content?courseId=${encodeURIComponent(courseId)}`);
      if (res.ok) {
        const data = await res.json();
        setCourseContents(data.contents || []);
      }
    } catch {
      toast.error("Error al cargar contenido del curso");
    }
  };

  const handleUploadCourseContent = async () => {
    if (!selectedCourseId || !contentUploadForm.title || !contentFile) {
      toast.error("Curso, título y archivo son requeridos");
      return;
    }
    setUploadingContent(true);
    try {
      // Step 1: Get presigned upload URL
      const presignRes = await authFetch("/api/admin/course-content/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: contentFile.name,
          contentType: contentFile.type,
        }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        toast.error(presignData.error || "Error al obtener URL de subida");
        return;
      }

      // Step 2: Upload file to R2 via presigned URL
      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentFile.type },
        body: contentFile,
      });
      if (!uploadRes.ok) {
        toast.error("Error al subir archivo a R2");
        return;
      }

      // Step 3: Create content record in DB
      const createRes = await authFetch("/api/admin/course-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: contentUploadForm.title,
          description: contentUploadForm.description,
          fileType: contentUploadForm.fileType,
          r2Key: presignData.key,
          fileName: contentFile.name,
          sortOrder: courseContents.length,
          active: 1,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        toast.error(createData.error || "Error al crear contenido");
        return;
      }

      toast.success(`"${contentUploadForm.title}" subido correctamente`);
      setContentUploadForm({ title: "", description: "", fileType: "video" });
      setContentFile(null);
      setShowContentUpload(false);
      fetchCourseContents(selectedCourseId);
    } catch {
      toast.error("Error al subir contenido");
    } finally {
      setUploadingContent(false);
    }
  };

  const handleDeleteCourseContent = async (id: string) => {
    if (!confirm("¿Eliminar este contenido?")) return;
    try {
      const res = await authFetch(`/api/admin/course-content?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Contenido eliminado");
        fetchCourseContents(selectedCourseId);
      }
    } catch {
      toast.error("Error al eliminar contenido");
    }
  };

  const handleToggleContentActive = async (id: string, currentActive: number) => {
    try {
      const res = await authFetch("/api/admin/course-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: currentActive ? 0 : 1 }),
      });
      if (res.ok) {
        fetchCourseContents(selectedCourseId);
      }
    } catch {
      toast.error("Error al actualizar contenido");
    }
  };

  const fetchResources = async () => {
    setResourcesLoading(true);
    setResourceError("");
    try {
      const res = await authFetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources((data.resources || []).map((r: any) => ({
          ...r,
          url: `/api/resources/download?key=${encodeURIComponent(r.r2Key)}`,
        })));
      } else {
        const text = await res.text().catch(() => "");
        setResourceError(`Error ${res.status}: ${text}`);
      }
    } catch (err: any) {
      setResourceError(err?.message || String(err));
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleUploadResource = async () => {
    if (!selectedFile) { toast.error("Seleccioná un archivo"); return; }
    if (!uploadForm.title.trim()) { toast.error("Poné un título al recurso"); return; }

    // Check file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("El archivo excede el limite de 500MB");
      return;
    }

    setUploading(true);
    setUploadProgress(`Preparando subida de ${selectedFile.name}...`);
    setResourceError("");
    try {
      // Step 1: Get presigned URL
      const presignRes = await authFetch("/api/resources/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selectedFile.name, contentType: selectedFile.type || "application/octet-stream" }),
      });
      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => null);
        throw new Error(data?.error || `Error al obtener URL (${presignRes.status})`);
      }
      const { uploadUrl, key } = await presignRes.json();

      // Step 2: Upload directly to R2
      setUploadProgress(`Subiendo ${selectedFile.name}...`);
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
      });
      if (!uploadRes.ok) throw new Error(`Error al subir archivo (${uploadRes.status})`);

      // Step 3: Save metadata to DB
      setUploadProgress("Guardando información...");
      const metaRes = await authFetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim(),
          fileType: uploadForm.fileType,
          r2Key: key,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          price: parseFloat(uploadForm.price) || parseFloat(uploadForm.priceArs) || 0,
          priceArs: parseFloat(uploadForm.priceArs) || parseFloat(uploadForm.price) || 0,
          priceUsd: parseFloat(uploadForm.priceUsd) || 0,
        }),
      });
      if (!metaRes.ok) {
        const data = await metaRes.json().catch(() => null);
        throw new Error(data?.error || "Error al guardar metadata");
      }

      toast.success("Recurso subido correctamente");
      setShowUploadForm(false);
      setUploadForm({ title: "", description: "", fileType: "documento", price: "", priceArs: "", priceUsd: "" });
      setSelectedFile(null);
      fetchResources();
    } catch (err: any) {
      const msg = err?.message || String(err);
      setResourceError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const res = await authFetch(`/api/resources?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recurso eliminado");
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error("Error al eliminar");
      }
    } catch (err: any) {
      toast.error(`Error: ${err?.message || String(err)}`);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await authFetch("/api/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) {
        setResources((prev) => prev.map((r) => r.id === id ? { ...r, active: !currentActive } : r));
        toast.success(!currentActive ? "Recurso activado" : "Recurso desactivado");
      }
    } catch {}
  };

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function getFileIcon(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return "📄";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
    if (["mp4", "webm", "mov", "avi"].includes(ext)) return "🎬";
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "🎵";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["ppt", "pptx"].includes(ext)) return "📽️";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "📦";
    return "📎";
  }

  // ── Generic status update ──
  const updateStatus = async (endpoint: string, id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await authFetch(`/api/admin/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Refresh data for consistency
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Error updating status:", data.error || res.statusText);
        toast.error(`Error al actualizar: ${data.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Error de conexión al actualizar estado");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Generic delete ──
  const deleteItem = async (endpoint: string, id: string) => {
    try {
      const res = await authFetch(`/api/admin/${endpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Remove from local state optimistically
        if (endpoint === "bookings") {
          setBookings((prev) => prev.filter((b) => b.id !== id));
        } else if (endpoint === "orders") {
          setOrders((prev) => prev.filter((o) => o.id !== id));
        } else if (endpoint === "memberships") {
          setMemberships((prev) => prev.filter((m) => m.id !== id));
        } else if (endpoint === "subscribers") {
          setSubscribers((prev) => prev.filter((s) => s.id !== id));
        }
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Filter logic ──
  const filterBySearch = <T extends { customerName?: string; name?: string; email?: string; customerEmail?: string }>(
    items: T[],
    field: "name" | "customerName" = "name"
  ) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      const nameField = item[field] || "";
      const emailField =
        "email" in item ? (item.email as string) : (item.customerEmail as string);
      return (
        nameField.toLowerCase().includes(q) ||
        emailField.toLowerCase().includes(q)
      );
    });
  };

  const filteredBookings = filterBySearch(bookings, "name");
  const filteredOrders = filterBySearch(orders, "customerName");
  const filteredMemberships = filterBySearch(memberships, "name");

  const crystalOrders = filteredOrders.filter((o) => o.type === "crystal");
  const courseOrders = filteredOrders.filter((o) => o.type === "course");

  /* ── LOGIN SCREEN ── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-mystic-950 flex items-center justify-center px-4">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161310',
              color: '#f0ebe5',
              border: '1px solid #2a252066',
            },
          }}
        />
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Star className="w-12 h-12 text-gold-400 mx-auto mb-4 text-glow-gold" />
            <h1 className="text-2xl font-playfair text-cream-100 mb-2">
              Panel de Administracion
            </h1>
            <p className="text-sm text-mystic-300 font-josefin">
              Eter Somos
            </p>
          </div>
          <Card className="bg-mystic-900/60 border-mystic-700/50">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-gold-400/70 font-josefin uppercase tracking-wider block mb-2">
                    Contrasena
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Ingresar contrasena"
                    className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50"
                  />
                  {passwordError && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {passwordError}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/30 font-josefin tracking-wider"
                >
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ── LOADING SCREEN ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-mystic-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    );
  }

  /* ── ADMIN DASHBOARD ── */
  // Nav counts for sidebar badges
  const navCounts: Record<string, number> = {
    bookings: filteredBookings.length,
    crystals: crystalOrders.length,
    courses: courseOrders.length,
    memberships: filteredMemberships.length,
    students: students.length,
    resources: resources.length,
    subscribers: subscribers.length,
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem("admin_token");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-mystic-950 via-mystic-950 to-violet-950/40 -z-10" />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161310',
            color: '#f0ebe5',
            border: '1px solid #2a252066',
          },
        }}
      />

      {/* Mobile Header */}
      <header className="lg:hidden bg-mystic-900/80 backdrop-blur-xl border-b border-mystic-700/40 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-400/30">
              <img src="/images/logo-etersomos.jpg" alt="Eter Somos" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-playfair text-base text-cream-100">Admin</span>
              <span className="text-mystic-500 text-[10px] font-josefin uppercase tracking-wider ml-2">Eter Somos</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-mystic-300 hover:text-gold-400 hover:bg-mystic-800/60 h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-mystic-300">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-mystic-950 border-mystic-700/40 p-0 w-64">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navegación</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  activeSection={activeSection}
                  onNavClick={handleNavClick}
                  onLogout={handleLogout}
                  counts={navCounts}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-60 bg-mystic-950/90 backdrop-blur-xl border-r border-mystic-700/40 z-40">
          <SidebarContent
            activeSection={activeSection}
            onNavClick={handleNavClick}
            onLogout={handleLogout}
            counts={navCounts}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Section header with search + actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {(() => {
                const currentNav = navGroups.flatMap(g => g.items).find(i => i.id === activeSection);
                if (!currentNav) return null;
                const Icon = currentNav.icon;
                return (
                  <>
                    <Icon className="w-5 h-5 text-violet-400" />
                    <h2 className="font-playfair text-xl text-cream-100">{currentNav.label}</h2>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-9 bg-mystic-900/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 h-9 w-48 sm:w-64 text-sm"
                />
              </div>
              <ExportButton type="all" label="Exportar" fetchFn={authFetch as any} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-mystic-300 hover:text-gold-400 hover:bg-mystic-800/60 h-9 w-9 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Section Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >

          {/* ═══ DASHBOARD ═══ */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="font-playfair text-2xl sm:text-3xl text-cream-100 mb-1">Panel de Administración</h1>
                <p className="text-mystic-400 font-josefin text-sm">Resumen general de la actividad de Eter Somos</p>
              </motion.div>

              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <StatCard
                    title="Lecturas"
                    value={stats.overview.totalBookings}
                    subtitle={stats.overview.recentBookings > 0 ? `${stats.overview.recentBookings} esta semana` : undefined}
                    icon={BookOpen}
                    trend={stats.overview.recentBookings > 0 ? "up" : "neutral"}
                  />
                  <StatCard
                    title="Pedidos Cristales"
                    value={stats.overview.totalCrystalOrders}
                    subtitle={`${formatCurrency(stats.overview.crystalRevenue, "mercadopago")}`}
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Inscripciones Cursos"
                    value={stats.overview.totalCourseEnrollments}
                    subtitle={`${formatCurrency(stats.overview.courseRevenue, "mercadopago")}`}
                    icon={GraduationCap}
                  />
                  <StatCard
                    title="Membresias"
                    value={stats.overview.totalMemberships}
                    subtitle={stats.overview.recentMemberships > 0 ? `${stats.overview.recentMemberships} esta semana` : undefined}
                    icon={Crown}
                    trend={stats.overview.recentMemberships > 0 ? "up" : "neutral"}
                  />
                  <StatCard
                    title="Ingresos Totales"
                    value={formatCurrency(stats.overview.totalRevenue, "mercadopago")}
                    icon={DollarSign}
                  />
                </div>
              )}

              {/* Revenue breakdown cards */}
              {stats && Object.keys(stats.paymentBreakdown).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card className="bg-mystic-900/40 border-mystic-700/40">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-josefin text-gold-400/70 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Metodos de Pago
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {Object.entries(stats.paymentBreakdown).map(([method, data]) => (
                          <div key={method} className="flex items-center justify-between text-sm">
                            <span className="text-cream-200 font-josefin capitalize">
                              {method === "mercadopago" ? "MercadoPago" : method === "paypal" ? "PayPal" : method}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-mystic-400 text-xs">{data.count} pedidos</span>
                              <span className="text-gold-400 font-playfair font-semibold">{formatCurrency(data.total, method)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-mystic-900/40 border-mystic-700/40">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-josefin text-gold-400/70 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Estados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {Object.entries({ ...stats.orderStatuses, ...stats.bookingStatuses })
                          .filter(([k]) => k !== "undefined")
                          .map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between text-sm">
                              <span className="text-cream-200 font-josefin">{statusLabels[status] || status}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-mystic-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      status === "pagado" || status === "enviado" || status === "entregado" ? "bg-emerald-500"
                                      : status === "pendiente" || status === "inscrito" ? "bg-amber-500"
                                      : status === "cancelado" || status === "cancelada" ? "bg-red-500"
                                      : "bg-blue-500"
                                    }`}
                                    style={{ width: `${Math.min((count / Math.max(...Object.values({ ...stats.orderStatuses, ...stats.bookingStatuses }))) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-mystic-400 text-xs w-6 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "lecturas", label: "Lecturas", icon: BookOpen, count: bookings.length, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                  { id: "cristales", label: "Cristales", icon: ShoppingCart, count: crystalOrders.length, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  { id: "cursos", label: "Cursos", icon: GraduationCap, count: courseOrders.length, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  { id: "alumnos", label: "Alumnos", icon: Users, count: students.length, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => setActiveSection(action.id)}
                      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${action.color}`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <p className="text-cream-100 text-sm font-josefin font-medium">{action.label}</p>
                      <p className="text-mystic-400 text-xs font-sans">{action.count} registro{action.count !== 1 ? "s" : ""}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ BOOKINGS - KANBAN ═══ */}
          {activeSection === "lecturas" && (
            <>
            {filteredBookings.length === 0 ? (
              <Card className="bg-mystic-900/40 border-mystic-700/40">
                <div className="py-12 text-center text-mystic-400 font-josefin">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No hay lecturas registradas</p>
                  <p className="text-xs mt-1">
                    {searchQuery
                      ? "Intenta cambiar los filtros de busqueda"
                      : "Las solicitudes de lectura apareceran aqui"}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="mb-3 text-xs text-mystic-500 font-josefin flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3" />
                    Arrastra las tarjetas entre columnas para cambiar el estado
                  </div>
                  <ExportButton type="bookings" label="Descargar Mails" fetchFn={authFetch as any} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {([
                    { key: "pendiente", label: "Pendientes", icon: Clock, color: "amber", border: "border-t-amber-500/60" },
                    { key: "en_progreso", label: "En Proceso", icon: Timer, color: "purple", border: "border-t-purple-500/60" },
                    { key: "entregada", label: "Entregadas", icon: CheckCircle2, color: "cyan", border: "border-t-cyan-500/60" },
                  ] as const).map((column) => (
                    <KanbanColumn
                      key={column.key}
                      column={column}
                      items={filteredBookings.filter((b) => b.status === column.key)}
                      dragOverColumn={dragOverColumn}
                      setDragOverColumn={setDragOverColumn}
                      draggedId={draggedId}
                      updatingId={updatingId}
                      setDraggedId={setDraggedId}
                      onDrop={(id, status) => updateStatus("bookings", id, status)}
                      onToggle={toggleRow}
                      expandedRows={expandedRows}
                      onDelete={(id) => deleteItem("bookings", id)}
                      itemType="booking"
                      renderCard={(booking, isDragging, isUpdating, isOpen) => {
                        const b = booking as Booking;
                        const isOverdue = b.deliveryDate && new Date(b.deliveryDate) < new Date();
                        // Status action buttons for bookings
                        const bookingStatusActions: Record<string, Array<{ status: string; label: string; color: string }>> = {
                          pendiente: [
                            { status: "en_progreso", label: "Iniciar", color: "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" },
                          ],
                          en_progreso: [
                            { status: "entregada", label: "Entregar", color: "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30" },
                            { status: "pendiente", label: "Volver", color: "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" },
                          ],
                          entregada: [
                            { status: "en_progreso", label: "Reabrir", color: "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" },
                          ],
                        };
                        return (
                          <>
                            <div className="px-3 pt-3 pb-2 flex items-start gap-2" onClick={() => toggleRow(b.id)}>
                              <GripVertical className="w-4 h-4 text-mystic-600 mt-0.5 flex-shrink-0 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-josefin text-cream-100 text-sm font-medium truncate">{b.name}</span>
                                  {isUpdating && <Loader2 className="w-3 h-3 text-gold-400 animate-spin flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-mystic-500 mt-0.5 truncate">{b.readingType}</p>
                              </div>
                            </div>
                            <div className="px-3 pb-2 space-y-2">
                              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                <div className="flex items-center gap-1 text-mystic-400">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate" title={formatDateTime(b.createdAt)}>{formatDate(b.createdAt)}</span>
                                </div>
                                {b.deliveryDate ? (
                                  <div className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-gold-400/70"}`}>
                                    <Hourglass className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{formatDate(b.deliveryDate)}</span>
                                    {isOverdue && (
                                      <span className="ml-0.5 text-[9px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded font-josefin">VENCIDA</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-mystic-600">
                                    <Hourglass className="w-3 h-3 flex-shrink-0" />
                                    <span>Sin fecha limite</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-[11px] text-mystic-500 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{b.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{b.phone}</span>
                                </div>
                              </div>
                              {/* Status action buttons */}
                              {bookingStatusActions[b.status] && (
                                <div className="flex gap-1.5 flex-wrap">
                                  {bookingStatusActions[b.status].map((action) => (
                                    <button
                                      key={action.status}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus("bookings", b.id, action.status);
                                      }}
                                      disabled={isUpdating}
                                      className={`text-[10px] px-2 py-1 rounded font-josefin font-medium transition-colors ${action.color} disabled:opacity-50`}
                                    >
                                      {isUpdating ? "..." : action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {isOpen && (
                                <div className="pt-2 border-t border-mystic-800/40 space-y-2">
                                  {b.preferredDate && (
                                    <div className="text-[11px]">
                                      <span className="text-gold-400/60 font-josefin uppercase">Fecha preferida: </span>
                                      <span className="text-cream-200">{b.preferredDate}</span>
                                    </div>
                                  )}
                                  {b.preferredTime && (
                                    <div className="text-[11px]">
                                      <span className="text-gold-400/60 font-josefin uppercase">Horario: </span>
                                      <span className="text-cream-200">{b.preferredTime}</span>
                                    </div>
                                  )}
                                  {b.message && (
                                    <div className="bg-mystic-950/40 p-2 rounded border border-mystic-800/30">
                                      <p className="text-[10px] text-gold-400/60 font-josefin uppercase mb-1">Mensaje</p>
                                      <p className="text-[11px] text-mystic-300 whitespace-pre-wrap">{b.message}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-mystic-600 font-mono truncate">ID: {b.id}</span>
                                    <CopyButton text={b.id} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
          )}

          {/* ═══ CRYSTALS - KANBAN ═══ */}
          {activeSection === "cristales" && (
          <>
            {crystalOrders.length === 0 ? (
              <Card className="bg-mystic-900/40 border-mystic-700/40">
                <div className="py-12 text-center text-mystic-400 font-josefin">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No hay pedidos de cristales</p>
                  <p className="text-xs mt-1">
                    {searchQuery ? "Intenta cambiar los filtros" : "Los pedidos de cristales apareceran aqui"}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="mb-3 text-xs text-mystic-500 font-josefin flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3" />
                    Arrastra para gestionar el estado de envios
                  </div>
                  <ExportButton type="crystals" label="Descargar Mails" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {([
                    { key: "pendiente", label: "Pendientes de Envio", icon: Clock, color: "amber", border: "border-t-amber-500/60" },
                    { key: "preparando", label: "Preparando", icon: PackageCheck, color: "purple", border: "border-t-purple-500/60" },
                    { key: "entregado", label: "Entregados", icon: CheckCircle2, color: "cyan", border: "border-t-cyan-500/60" },
                  ] as const).map((column) => (
                    <KanbanColumn
                      key={column.key}
                      column={column}
                      items={crystalOrders.filter((o) => o.status === column.key)}
                      dragOverColumn={dragOverColumn}
                      setDragOverColumn={setDragOverColumn}
                      draggedId={draggedId}
                      updatingId={updatingId}
                      setDraggedId={setDraggedId}
                      onDrop={(id, status) => updateStatus("orders", id, status)}
                      onToggle={toggleRow}
                      expandedRows={expandedRows}
                      onDelete={(id) => deleteItem("orders", id)}
                      itemType="order"
                      renderCard={(item, isDragging, isUpdating, isOpen) => {
                        const o = item as Order;
                        return (
                          <>
                            <div className="px-3 pt-3 pb-2 flex items-start gap-2" onClick={() => toggleRow(o.id)}>
                              <GripVertical className="w-4 h-4 text-mystic-600 mt-0.5 flex-shrink-0 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-josefin text-cream-100 text-sm font-medium truncate">{o.customerName}</span>
                                  {isUpdating && <Loader2 className="w-3 h-3 text-gold-400 animate-spin flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-[10px] bg-gold-400/10 text-gold-400 border-gold-400/20">
                                    {formatCurrency(o.total, o.paymentMethod)}
                                  </Badge>
                                  <span className="text-[10px] text-mystic-500">
                                    {o.paymentMethod === "mercadopago" ? "MP" : "PP"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="px-3 pb-2 space-y-2">
                              <div className="text-[11px] text-mystic-500 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{o.customerEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Truck className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{o.city}, {o.province}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span>{formatDate(o.createdAt)}</span>
                                </div>
                              </div>
                              {/* Item count */}
                              <div className="text-[10px] text-mystic-500">
                                {o.items.length} producto{o.items.length !== 1 ? "s" : ""}
                              </div>
                              {isOpen && (
                                <div className="pt-2 border-t border-mystic-800/40 space-y-2">
                                  {/* Products */}
                                  <div>
                                    <p className="text-[10px] text-gold-400/60 font-josefin uppercase mb-1">Productos</p>
                                    {o.items.map((item, i) => (
                                      <p key={i} className="text-[11px] text-cream-200">
                                        {item.quantity}x {item.name} — {formatCurrency(item.price, o.paymentMethod)}
                                      </p>
                                    ))}
                                  </div>
                                  {/* Address */}
                                  <div>
                                    <p className="text-[10px] text-gold-400/60 font-josefin uppercase mb-1">Direccion</p>
                                    <p className="text-[11px] text-cream-200">{o.address}, {o.city}, {o.province} ({o.postalCode})</p>
                                  </div>
                                  {/* Phone */}
                                  {o.customerPhone && (
                                    <div className="flex items-center gap-1 text-[11px] text-mystic-400">
                                      <Phone className="w-3 h-3 flex-shrink-0" />
                                      <span>{o.customerPhone}</span>
                                    </div>
                                  )}
                                  {o.notes && !o.notes.startsWith("CURSO:") && (
                                    <div className="bg-mystic-950/40 p-2 rounded border border-mystic-800/30">
                                      <p className="text-[10px] text-gold-400/60 font-josefin uppercase mb-1">Notas</p>
                                      <p className="text-[11px] text-mystic-300">{o.notes}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-mystic-600 font-mono truncate">ID: {o.id}</span>
                                    <CopyButton text={o.id} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
          )}

          {/* ═══ COURSES - KANBAN ═══ */}
          {activeSection === "cursos" && (
          <>
            {courseOrders.length === 0 ? (
              <Card className="bg-mystic-900/40 border-mystic-700/40">
                <div className="py-12 text-center text-mystic-400 font-josefin">
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No hay inscripciones a cursos</p>
                  <p className="text-xs mt-1">
                    {searchQuery ? "Intenta cambiar los filtros" : "Las inscripciones a cursos apareceran aqui"}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="mb-3 text-xs text-mystic-500 font-josefin flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3" />
                    Arrastra para gestionar el progreso de los alumnos
                  </div>
                  <ExportButton type="courses" label="Descargar Mails" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {([
                    { key: "inscrito", label: "Inscritos", icon: UserCheck, color: "amber", border: "border-t-amber-500/60" },
                    { key: "en_curso", label: "En Curso", icon: GraduationCap, color: "purple", border: "border-t-purple-500/60" },
                    { key: "completado", label: "Completados", icon: CheckCircle2, color: "cyan", border: "border-t-cyan-500/60" },
                  ] as const).map((column) => (
                    <KanbanColumn
                      key={column.key}
                      column={column}
                      items={courseOrders.filter((o) => o.status === column.key)}
                      dragOverColumn={dragOverColumn}
                      setDragOverColumn={setDragOverColumn}
                      draggedId={draggedId}
                      updatingId={updatingId}
                      setDraggedId={setDraggedId}
                      onDrop={(id, status) => updateStatus("orders", id, status)}
                      onToggle={toggleRow}
                      expandedRows={expandedRows}
                      onDelete={(id) => deleteItem("orders", id)}
                      itemType="order"
                      renderCard={(item, isDragging, isUpdating, isOpen) => {
                        const o = item as Order;
                        const courseName = o.items.map((i) => i.name).join(", ") || "Curso";
                        return (
                          <>
                            <div className="px-3 pt-3 pb-2 flex items-start gap-2" onClick={() => toggleRow(o.id)}>
                              <GripVertical className="w-4 h-4 text-mystic-600 mt-0.5 flex-shrink-0 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-josefin text-cream-100 text-sm font-medium truncate">{o.customerName}</span>
                                  {isUpdating && <Loader2 className="w-3 h-3 text-gold-400 animate-spin flex-shrink-0" />}
                                </div>
                                <Badge variant="outline" className="text-[10px] mt-1 bg-purple-500/10 text-purple-300 border-purple-500/20">
                                  {courseName}
                                </Badge>
                              </div>
                            </div>
                            <div className="px-3 pb-2 space-y-2">
                              <div className="text-[11px] text-mystic-500 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{o.customerEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 flex-shrink-0" />
                                  <span>{formatCurrency(o.total, o.paymentMethod)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span>Inscrito: {formatDate(o.createdAt)}</span>
                                </div>
                              </div>
                              {isOpen && (
                                <div className="pt-2 border-t border-mystic-800/40 space-y-2">
                                  {o.customerPhone && o.customerPhone !== "N/A" && (
                                    <div className="flex items-center gap-1 text-[11px] text-mystic-400">
                                      <Phone className="w-3 h-3 flex-shrink-0" />
                                      <span>{o.customerPhone}</span>
                                    </div>
                                  )}
                                  {o.courseData && Object.keys(o.courseData).length > 0 && (
                                    <div className="bg-mystic-950/40 p-2 rounded border border-mystic-800/30">
                                      <p className="text-[10px] text-gold-400/60 font-josefin uppercase mb-1">Datos del Formulario</p>
                                      {Object.entries(o.courseData).map(([key, value]) => (
                                        <p key={key} className="text-[11px] text-mystic-300">
                                          <span className="text-gold-400/60 capitalize">{key}: </span>
                                          <span className="text-cream-200">{String(value)}</span>
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                  {o.paymentId && (
                                    <div className="text-[10px] text-mystic-500 font-mono">
                                      ID Pago: {o.paymentId} <CopyButton text={o.paymentId} />
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-mystic-600 font-mono truncate">ID: {o.id}</span>
                                    <CopyButton text={o.id} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
          )}

          {/* ═══ MEMBERSHIPS - KANBAN ═══ */}
          {activeSection === "membresias" && (
          <>
            {filteredMemberships.length === 0 ? (
              <Card className="bg-mystic-900/40 border-mystic-700/40">
                <div className="py-12 text-center text-mystic-400 font-josefin">
                  <Crown className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No hay membresias registradas</p>
                  <p className="text-xs mt-1">
                    {searchQuery ? "Intenta cambiar los filtros" : "Las suscripciones a membresias apareceran aqui"}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="mb-3 text-xs text-mystic-500 font-josefin flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3" />
                    Arrastra para gestionar el estado de las membresias
                  </div>
                  <ExportButton type="memberships" label="Descargar Mails" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {([
                    { key: "activa", label: "Activas", icon: Crown, color: "emerald", border: "border-t-emerald-500/60" },
                    { key: "pendiente", label: "Pendientes", icon: Clock, color: "amber", border: "border-t-amber-500/60" },
                    { key: "vencida", label: "Vencidas / Canceladas", icon: CircleX, color: "red", border: "border-t-red-500/60" },
                  ] as const).map((column) => (
                    <KanbanColumn
                      key={column.key}
                      column={column}
                      items={filteredMemberships.filter((m) => m.status === column.key)}
                      dragOverColumn={dragOverColumn}
                      setDragOverColumn={setDragOverColumn}
                      draggedId={draggedId}
                      updatingId={updatingId}
                      setDraggedId={setDraggedId}
                      onDrop={(id, status) => updateStatus("memberships", id, status)}
                      onToggle={toggleRow}
                      expandedRows={expandedRows}
                      onDelete={(id) => deleteItem("memberships", id)}
                      itemType="membership"
                      renderCard={(item, isDragging, isUpdating, isOpen) => {
                        const m = item as Membership;
                        return (
                          <>
                            <div className="px-3 pt-3 pb-2 flex items-start gap-2" onClick={() => toggleRow(m.id)}>
                              <GripVertical className="w-4 h-4 text-mystic-600 mt-0.5 flex-shrink-0 cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-josefin text-cream-100 text-sm font-medium truncate">{m.name}</span>
                                  {isUpdating && <Loader2 className="w-3 h-3 text-gold-400 animate-spin flex-shrink-0" />}
                                </div>
                                <Badge variant="outline" className="text-[10px] mt-1 bg-gold-400/10 text-gold-400 border-gold-400/20">
                                  {m.membershipName}
                                </Badge>
                              </div>
                            </div>
                            <div className="px-3 pb-2 space-y-2">
                              <div className="text-[11px] text-mystic-500 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{m.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span>Desde: {formatDate(m.createdAt)}</span>
                                </div>
                              </div>
                              {isOpen && (
                                <div className="pt-2 border-t border-mystic-800/40 space-y-2">
                                  <div className="text-[11px]">
                                    <span className="text-gold-400/60 font-josefin uppercase">Ultima actualizacion: </span>
                                    <span className="text-cream-200">{formatDateTime(m.updatedAt)}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-mystic-600 font-mono truncate">ID: {m.id}</span>
                                    <CopyButton text={m.id} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
          )}

          {/* ═══ SUSCRIPTORES ═══ */}
          {activeSection === "suscriptores" && (
            <Card className="bg-mystic-900/40 border-mystic-700/40">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-josefin text-gold-400/70 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Suscriptores del Newsletter
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gold-400/10 text-gold-300 text-xs font-josefin">
                      {subscribers.length} suscriptor{subscribers.length !== 1 ? "es" : ""}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (subscribers.length === 0) return;
                        const headers = ["Email", "Fecha de suscripcion"];
                        const rows = subscribers.map((s) => [
                          s.email,
                          formatDate(s.subscribedAt),
                        ]);
                        const csv = [
                          headers.join(","),
                          ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
                        ].join("\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `suscriptores_newsletter_${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      disabled={subscribers.length === 0}
                      className="text-mystic-400 hover:text-gold-400 hover:bg-mystic-800/60 gap-1.5 h-8 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Exportar emails</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {subscribers.length === 0 ? (
                  <div className="py-12 text-center text-mystic-400 font-josefin">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No hay suscriptores registrados</p>
                    <p className="text-xs mt-1">
                      Los suscriptores del newsletter apareceran aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[520px] overflow-y-auto">
                    <div className="grid grid-cols-[1fr_140px_40px] gap-3 px-3 pb-2 border-b border-mystic-700/40 text-xs font-josefin text-gold-400/60 uppercase tracking-wider">
                      <span>Email</span>
                      <span>Fecha</span>
                      <span></span>
                    </div>
                    {subscribers.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-[1fr_140px_40px] gap-3 px-3 py-3 rounded-lg border border-mystic-700/30 bg-mystic-900/40 hover:bg-mystic-800/50 transition-colors items-center group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3.5 h-3.5 text-mystic-500 flex-shrink-0" />
                          <span className="text-cream-200 text-sm font-josefin truncate">{s.email}</span>
                          <CopyButton text={s.email} />
                        </div>
                        <span className="text-mystic-400 text-xs font-josefin">
                          {formatDate(s.subscribedAt)}
                        </span>
                        <div className="flex justify-end">
                          <DeleteButton
                            itemId={s.id}
                            itemType="membership"
                            itemName={s.email}
                            onDelete={(id) => deleteItem("subscribers", id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ RECURSOS ═══ */}
          {activeSection === "recursos" && (
            <Card className="bg-mystic-900/40 border-mystic-700/40">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-sm font-josefin text-gold-400/70 uppercase tracking-wider flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Recursos
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gold-400/10 text-gold-300 text-xs font-josefin">
                      {resources.length} recurso{resources.length !== 1 ? "s" : ""}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => fetchResources()} disabled={resourcesLoading} className="text-mystic-400 hover:text-gold-400 hover:bg-mystic-800/60 gap-1.5 h-8 text-xs">
                      <RefreshCw className={`w-3.5 h-3.5 ${resourcesLoading ? "animate-spin" : ""}`} />
                      Actualizar
                    </Button>
                    {!showUploadForm && (
                      <Button onClick={() => setShowUploadForm(true)} className="bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/30 font-josefin text-xs gap-1.5 h-8">
                        <Upload className="w-3.5 h-3.5" />
                        Nuevo recurso
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">

                {/* Upload form */}
                {showUploadForm && (
                  <div className="p-4 rounded-xl border border-gold-400/20 bg-gold-400/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-josefin text-gold-400 font-medium">Nuevo recurso</h3>
                      <button onClick={() => { setShowUploadForm(false); setUploadForm({ title: "", description: "", fileType: "documento", price: "", priceArs: "", priceUsd: "" }); setSelectedFile(null); }} className="p-1 hover:bg-mystic-800 rounded">
                        <X className="w-4 h-4 text-mystic-400" />
                      </button>
                    </div>

                    {uploading && <p className="text-xs text-gold-300 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />{uploadProgress}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gold-400/70 font-josefin">Titulo *</label>
                        <Input value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Ej: Meditación para conectar con tu guía interior" className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 h-9 text-sm" disabled={uploading} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gold-400/70 font-josefin">Tipo de archivo</label>
                        <Select value={uploadForm.fileType} onValueChange={(v) => setUploadForm({ ...uploadForm, fileType: v })} disabled={uploading}>
                          <SelectTrigger className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-mystic-900 border-mystic-700/50">
                            <SelectItem value="documento">Documento (PDF, DOC)</SelectItem>
                            <SelectItem value="imagen">Imagen (JPG, PNG)</SelectItem>
                            <SelectItem value="audio">Audio (MP3, WAV)</SelectItem>
                            <SelectItem value="video">Video (MP4, MOV)</SelectItem>
                            <SelectItem value="meditacion">Meditación guiada</SelectItem>
                            <SelectItem value="guia">Guía práctica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gold-400/70 font-josefin">Descripcion</label>
                      <Textarea value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Describí brevemente de qué trata este recurso..." rows={2} className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 text-sm resize-none" disabled={uploading} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gold-400/70 font-josefin">Archivo *</label>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-mystic-600/50 bg-mystic-900/40 hover:border-gold-400/40 cursor-pointer transition-all h-9">
                        {selectedFile ? (
                          <span className="text-sm text-cream-200 truncate">{selectedFile.name}</span>
                        ) : (
                          <span className="text-sm text-mystic-500">Elegir archivo...</span>
                        )}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm,.mov,.avi,.mp3,.wav,.ogg,.m4a,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={uploading} />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gold-400/70 font-josefin">Precio ARS (0 = gratis)</label>
                        <Input type="number" value={uploadForm.priceArs} onChange={(e) => setUploadForm({ ...uploadForm, priceArs: e.target.value })} placeholder="0" min="0" className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 h-9 text-sm" disabled={uploading} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gold-400/70 font-josefin">Precio USD (0 = gratis)</label>
                        <Input type="number" value={uploadForm.priceUsd} onChange={(e) => setUploadForm({ ...uploadForm, priceUsd: e.target.value })} placeholder="0" min="0" className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 h-9 text-sm" disabled={uploading} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gold-400/70 font-josefin">Precio legacy (0 = gratis)</label>
                        <Input type="number" value={uploadForm.price} onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })} placeholder="0" min="0" className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 h-9 text-sm" disabled={uploading} />
                      </div>
                    </div>
                    <p className="text-xs text-mystic-500 font-josefin">Para recursos pagos, completá ARS y/o USD. Los recursos con precio &gt; 0 requieren pago antes de descargar. Videos y audios siempre se reproducen, no se descargan.</p>

                    <div className="flex justify-end">
                      <Button onClick={handleUploadResource} disabled={uploading || !selectedFile || !uploadForm.title.trim()} className="bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/30 font-josefin text-xs gap-1.5">
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Subir recurso
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error banner */}
                {resourceError && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-red-400/80 break-all">{resourceError}</p>
                    </div>
                    <button onClick={() => setResourceError("")} className="flex-shrink-0 p-1 hover:bg-red-500/20 rounded">
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                )}

                <Separator className="bg-mystic-700/30" />

                {/* Resource list */}
                {resourcesLoading && resources.length === 0 ? (
                  <div className="py-12 text-center text-mystic-400 font-josefin">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                    <p>Cargando recursos...</p>
                  </div>
                ) : resources.length === 0 ? (
                  <div className="py-12 text-center text-mystic-400 font-josefin">
                    <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No hay recursos</p>
                    <p className="text-xs mt-1">Clickeá "Nuevo recurso" para agregar uno</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {resources.map((resource) => (
                      <div key={resource.id} className={`p-4 rounded-xl border transition-colors ${resource.active ? "border-mystic-700/30 bg-mystic-900/40 hover:bg-mystic-800/50" : "border-mystic-700/15 bg-mystic-900/20 opacity-60"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-josefin text-cream-200 font-medium truncate">{resource.title}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-mystic-800 text-mystic-400 border-mystic-700/40 shrink-0">
                                {resource.fileType}
                              </Badge>
                              {resource.price > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gold-400/10 text-gold-400 border-gold-400/20 shrink-0">
                                  ${(resource.priceArs || resource.price).toLocaleString("es-AR")} ARS
                                </Badge>
                              )}
                              {(resource.priceUsd || 0) > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#FFC439]/10 text-[#FFC439] border-[#FFC439]/20 shrink-0">
                                  USD ${(resource.priceUsd).toLocaleString("es-AR")}
                                </Badge>
                              )}
                              {!resource.active && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20 shrink-0">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                            {resource.description && (
                              <p className="text-xs text-mystic-400 font-josefin line-clamp-2 mb-1">{resource.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-mystic-500 font-josefin">
                              <span>{resource.fileName}</span>
                              <span>{formatFileSize(resource.fileSize)}</span>
                              <span>{formatDate(resource.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={async () => {
                              try {
                                const res = await authFetch(resource.url);
                                if (!res.ok) throw new Error("Error al descargar");
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = resource.fileName || "recurso";
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error("Download error:", err);
                              }
                            }} className="p-1.5 rounded hover:bg-mystic-800/60 transition-colors" title="Descargar">
                              <Download className="w-3.5 h-3.5 text-mystic-500 hover:text-gold-400" />
                            </button>
                            <button onClick={() => handleToggleActive(resource.id, resource.active)} className="p-1.5 rounded hover:bg-mystic-800/60 transition-colors" title={resource.active ? "Desactivar" : "Activar"}>
                              <Power className={`w-3.5 h-3.5 ${resource.active ? "text-emerald-500/60" : "text-mystic-600"}`} />
                            </button>
                            <button onClick={() => handleDeleteResource(resource.id)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5 text-mystic-600 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ CONTENIDO (CMS) ═══ */}
          {activeSection === "cms" && (
            <>
            {cmsLoading ? (
              <Card className="bg-mystic-900/40 border-mystic-700/40">
                <div className="py-12 text-center text-mystic-400 font-josefin">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                  <p>Cargando contenido del sitio...</p>
                </div>
              </Card>
            ) : (
              <>
                {/* Top actions */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-mystic-300 font-josefin">
                      Editá los textos, precios y configuraciones del sitio web.
                    </span>
                    {hasAnyCmsDirty() && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-josefin">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cambios sin guardar
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveCmsAll}
                      disabled={cmsSaving === "all"}
                      className="bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/30 font-josefin tracking-wider gap-1.5 h-8 text-xs"
                    >
                      {cmsSaving === "all" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Guardar Todo
                    </Button>
                  </div>
                </div>

                {/* Accordion sections */}
                <Accordion type="multiple" defaultValue={sectionOrder.slice(0, 2)} className="space-y-3">
                  {sectionOrder.map((section) => {
                    const sectionData = cmsContent[section]
                    if (!sectionData) return null
                    const keys = Object.keys(sectionData)
                    const dirty = isCmsDirty(section)
                    const saving = cmsSaving === section

                    return (
                      <AccordionItem
                        key={section}
                        value={section}
                        className="bg-mystic-900/40 border border-mystic-700/40 rounded-xl px-4 data-[state=open]:border-gold-400/30 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-josefin text-sm text-cream-200 font-medium">
                              {sectionLabels[section] || section}
                            </span>
                            <Badge variant="secondary" className="bg-mystic-800/60 text-mystic-400 text-[10px]">
                              {keys.length} campo{keys.length !== 1 ? "s" : ""}
                            </Badge>
                            {dirty && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1 space-y-3">
                          {keys.map((key) => {
                            const item = sectionData[key]
                            if (!item) return null
                            const draftValue = cmsDrafts[key] ?? item.value
                            const fieldDirty = draftValue !== item.value

                            return (
                              <div key={key} className={`space-y-1.5 p-3 rounded-lg border ${fieldDirty ? 'border-gold-400/30 bg-gold-500/5' : 'border-mystic-800/40 bg-mystic-950/30'}`}>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs text-gold-400/70 font-josefin uppercase tracking-wider">
                                    {item.label}
                                  </Label>
                                  <span className="text-[10px] text-mystic-600 font-mono">
                                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("es-AR") : ""}
                                  </span>
                                </div>

                                {item.type === 'json' ? (
                                  <Textarea
                                    value={draftValue}
                                    onChange={(e) => setCmsDrafts(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="bg-mystic-900/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 font-mono text-xs min-h-[120px] resize-y"
                                    rows={4}
                                  />
                                ) : item.type === 'textarea' ? (
                                  <Textarea
                                    value={draftValue}
                                    onChange={(e) => setCmsDrafts(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="bg-mystic-900/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 text-sm"
                                    rows={3}
                                  />
                                ) : item.type === 'boolean' ? (
                                  <div className="flex items-center gap-2 pt-1">
                                    <Switch
                                      checked={draftValue === 'true'}
                                      onCheckedChange={(checked) => setCmsDrafts(prev => ({ ...prev, [key]: String(checked) }))}
                                    />
                                    <span className="text-xs text-mystic-400">
                                      {draftValue === 'true' ? 'Sí' : 'No'}
                                    </span>
                                  </div>
                                ) : (
                                  <Input
                                    type={item.type === 'number' ? 'number' : item.type === 'url' ? 'url' : 'text'}
                                    value={draftValue}
                                    onChange={(e) => setCmsDrafts(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="bg-mystic-900/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 text-sm"
                                  />
                                )}
                              </div>
                            )
                          })}

                          {/* Section actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-mystic-800/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveCmsSection(section)}
                              disabled={saving || !dirty}
                              className="bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/30 font-josefin tracking-wider gap-1.5 h-8 text-xs"
                            >
                              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              Guardar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetCmsSection(section)}
                              className="text-mystic-400 hover:text-cream-200 hover:bg-mystic-800/60 gap-1.5 h-8 text-xs"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reset
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </>
            )}
            </>
          )}

          {/* ═══ FORMULARIOS ═══ */}
          {activeSection === "formularios" && (
            <Card className="bg-mystic-900/40 border-mystic-700/40">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-josefin text-gold-400/70 uppercase tracking-wider flex items-center gap-2">
                    <Power className="w-4 h-4" />
                    Control de Formularios
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {togglesLoading && <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />}
                    <Button variant="ghost" size="sm" onClick={handlePauseAll} disabled={togglesLoading} className="text-red-400 hover:bg-red-500/10 gap-1.5 h-8 text-xs font-josefin">
                      <Pause className="w-3.5 h-3.5" />
                      Pausar todos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleResumeAll} disabled={togglesLoading} className="text-emerald-400 hover:bg-emerald-500/10 gap-1.5 h-8 text-xs font-josefin">
                      <Play className="w-3.5 h-3.5" />
                      Activar todos
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <p className="text-xs text-mystic-400 font-josefin">
                  Pausa o reactiva formularios individualmente. Cuando un formulario esta pausado, los usuarios ven un mensaje de aviso y no pueden completarlo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(formLabels).map(([key, label]) => {
                    const isOn = formToggles[key] !== false;
                    return (
                      <button
                        key={key}
                        onClick={() => handleToggleForm(key)}
                        disabled={togglesLoading}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                          isOn
                            ? "bg-emerald-500/5 border-emerald-500/20 text-cream-200 hover:bg-emerald-500/10"
                            : "bg-red-500/5 border-red-500/20 text-cream-200/70 hover:bg-red-500/10"
                        }`}
                      >
                        <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200 ${isOn ? "bg-emerald-500/30" : "bg-red-500/30"}`}>
                          <div className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
                            isOn ? "bg-emerald-500 ml-auto shadow-sm shadow-emerald-500/50" : "bg-mystic-700"
                          }`}>
                            {isOn && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-josefin font-medium">{label}</p>
                          <p className={`text-[11px] font-josefin ${isOn ? "text-emerald-400/70" : "text-red-400/70"}`}>
                            {isOn ? "Activo" : "Pausado"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pause message */}
                <div className="pt-2 border-t border-mystic-700/30">
                  <label className="text-xs text-gold-400/70 font-josefin uppercase tracking-wider block mb-2">
                    Mensaje que ven los usuarios cuando un formulario esta pausado
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={pauseMessage}
                      onChange={(e) => setPauseMessage(e.target.value)}
                      placeholder="Ej: Fer se encuentra de vacaciones hasta el 15/06. ¡Pronto volvemos!"
                      className="flex-1 bg-mystic-800/60 border-mystic-700/50 text-cream-100 placeholder:text-mystic-500 focus:border-gold-400/50 text-sm font-josefin"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSavePauseMessage}
                      disabled={togglesLoading || !pauseMessage.trim()}
                      className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10 font-josefin tracking-wider shrink-0"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ ALUMNOS (AULA VIRTUAL) ═══ */}
          {activeSection === "alumnos" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-gold-300 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Aula Virtual — Alumnos
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewStudentForm(!showNewStudentForm)}
                  className="border-violet-400/30 text-violet-300 hover:bg-violet-400/10 font-josefin gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  {showNewStudentForm ? "Cancelar" : "Nuevo alumno"}
                </Button>
              </div>

              {/* Generated password alert */}
              {generatedPassword && (
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="p-4">
                    <p className="text-amber-300 text-sm font-sans">
                      Contraseña generada: <code className="bg-mystic-800 px-2 py-0.5 rounded text-amber-200">{generatedPassword}</code>
                    </p>
                    <p className="text-amber-400/70 text-xs font-sans mt-1">
                      Copiá esta contraseña y envíasela al alumno. No se volverá a mostrar.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-300 text-xs mt-2"
                      onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success("Copiada"); }}
                    >
                      Copiar
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* New student form */}
              {showNewStudentForm && (
                <Card className="bg-mystic-900/40 border-violet-500/30">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-violet-300 font-josefin text-sm">Crear nuevo alumno</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Nombre"
                        value={newStudentForm.nombre}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, nombre: e.target.value })}
                        className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newStudentForm.email}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                        className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                      />
                      <Input
                        placeholder="Teléfono (opcional)"
                        value={newStudentForm.phone}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                        className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                      />
                      <Input
                        placeholder="Contraseña (vacía = auto)"
                        type="password"
                        value={newStudentForm.password}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                        className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCreateStudent}
                      className="bg-violet-500 hover:bg-violet-400 text-white font-josefin"
                    >
                      Crear alumno
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Students list + detail */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Students list */}
                <div className="lg:col-span-1">
                  <Card className="bg-mystic-900/40 border-mystic-700/40">
                    <CardContent className="p-3">
                      <h4 className="text-mystic-400 text-xs font-josefin uppercase tracking-wider mb-2">
                        Alumnos registrados ({students.length})
                      </h4>
                      {studentsLoading ? (
                        <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-mystic-500" /></div>
                      ) : students.length === 0 ? (
                        <p className="text-mystic-500 text-sm font-sans text-center py-8">No hay alumnos registrados</p>
                      ) : (
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                          {students.map((s: any) => (
                            <button
                              key={s.id}
                              onClick={() => handleSelectStudent(s)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-sans ${
                                selectedStudent?.id === s.id
                                  ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                                  : "hover:bg-mystic-800/60 text-mystic-300"
                              }`}
                            >
                              <p className="truncate">{s.nombre}</p>
                              <p className="text-mystic-500 text-xs truncate">{s.email}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Student detail */}
                <div className="lg:col-span-2">
                  {selectedStudent ? (
                    <div className="space-y-4">
                      {/* Student info */}
                      <Card className="bg-mystic-900/40 border-mystic-700/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-serif text-foreground flex items-center gap-2">
                              <Users className="w-4 h-4 text-violet-400" />
                              {selectedStudent.nombre}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => handleDeleteStudent(selectedStudent.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-mystic-500 text-xs font-sans">Email</p>
                              <p className="text-foreground font-sans">{selectedStudent.email}</p>
                            </div>
                            <div>
                              <p className="text-mystic-500 text-xs font-sans">Teléfono</p>
                              <p className="text-foreground font-sans">{selectedStudent.phone || "—"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Current enrollments */}
                      <Card className="bg-mystic-900/40 border-mystic-700/40">
                        <CardContent className="p-4">
                          <h5 className="text-mystic-400 text-xs font-josefin uppercase tracking-wider mb-3">
                            Inscripciones ({studentEnrollments.length})
                          </h5>
                          {studentEnrollments.length === 0 ? (
                            <p className="text-mystic-500 text-sm font-sans text-center py-4">
                              Sin inscripciones. Asignale un curso o lectura.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {studentEnrollments.map((enr: any) => (
                                <div key={enr.id} className="bg-mystic-800/40 rounded-lg px-3 py-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {enr.type === "curso" && <GraduationCap className="w-4 h-4 text-blue-400" />}
                                      {enr.type === "lectura" && <BookOpen className="w-4 h-4 text-violet-400" />}
                                      {enr.type === "mentoria" && <Star className="w-4 h-4 text-gold-400" />}
                                      <div>
                                        <p className="text-foreground text-sm font-sans">{enr.title}</p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-mystic-500 text-xs font-sans">
                                            {enr.type} · {enr.status}
                                            {enr.assignedBy && ` · por ${enr.assignedBy}`}
                                          </p>
                                          {enr.type === "lectura" && enr.r2Key && (
                                            <Badge variant="outline" className="text-xs border-violet-400/30 text-violet-300 gap-1">
                                              <Headphones className="w-3 h-3" />
                                              Audio
                                            </Badge>
                                          )}
                                          {enr.type === "lectura" && enr.expiresAt && (
                                            <Badge variant="outline" className={`text-xs gap-1 ${
                                              new Date(enr.expiresAt).getTime() < Date.now()
                                                ? "border-red-500/30 text-red-300"
                                                : "border-amber-500/30 text-amber-300"
                                            }`}>
                                              <Clock className="w-3 h-3" />
                                              {new Date(enr.expiresAt).getTime() < Date.now()
                                                ? "Expirada"
                                                : `Expira: ${new Date(enr.expiresAt).toLocaleDateString("es-AR", { month: "short", day: "numeric" })}`}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className={`text-xs ${
                                      enr.status === "activa" ? "border-emerald-500/30 text-emerald-300" :
                                      enr.status === "completada" ? "border-violet-500/30 text-violet-300" :
                                      "border-mystic-600/30 text-mystic-400"
                                    }`}>
                                      {enr.status}
                                    </Badge>
                                  </div>
                                  {/* Lectura audio actions */}
                                  {enr.type === "lectura" && (
                                    <div className="mt-2 pt-2 border-t border-mystic-700/30 space-y-2">
                                      {enr.r2Key ? (
                                        <>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-mystic-400 text-xs font-sans">Audio: {enr.fileName}</span>
                                            {enr.expiresAt && (
                                              <span className={`text-xs font-sans ${
                                                new Date(enr.expiresAt).getTime() < Date.now()
                                                  ? "text-red-400"
                                                  : "text-amber-400"
                                              }`}>
                                                {new Date(enr.expiresAt).getTime() < Date.now()
                                                  ? "Expirada"
                                                  : `Expira: ${new Date(enr.expiresAt).toLocaleDateString("es-AR")}`}
                                              </span>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-red-400 hover:text-red-300 h-6 text-xs"
                                              onClick={() => handleRemoveEnrollmentAudio(enr.id)}
                                            >
                                              <Trash2 className="w-3 h-3 mr-1" /> Quitar audio
                                            </Button>
                                          </div>
                                          {/* Expiration date editor */}
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-mystic-500" />
                                            <Input
                                              type="date"
                                              defaultValue={enr.expiresAt ? new Date(enr.expiresAt).toISOString().split('T')[0] : ""}
                                              className="bg-mystic-800/40 border-mystic-700/40 text-cream-100 text-xs h-6 w-36"
                                              min={new Date().toISOString().split('T')[0]}
                                              onChange={(e) => {
                                                if (e.target.value) {
                                                  handleUpdateEnrollmentExpiration(enr.id, e.target.value);
                                                }
                                              }}
                                            />
                                            <span className="text-mystic-500 text-xs font-sans">Expiración</span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="space-y-2 w-full">
                                          <div className="flex items-center gap-2 w-full">
                                            <Input
                                              type="file"
                                              accept="audio/*,.mp3,.wav,.ogg,.m4a"
                                              onChange={(e) => setLecturaAudioFile(e.target.files?.[0] || null)}
                                              className="bg-mystic-800/40 border-mystic-700/40 text-cream-100 text-xs h-7 flex-1"
                                              disabled={uploadingLecturaAudio}
                                            />
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="border-violet-400/30 text-violet-300 hover:bg-violet-400/10 h-7 text-xs gap-1"
                                              disabled={uploadingLecturaAudio || !lecturaAudioFile}
                                              onClick={() => handleUploadAudioToEnrollment(enr.id)}
                                            >
                                              {uploadingLecturaAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                              {uploadingLecturaAudio ? "Subiendo..." : "Subir audio"}
                                            </Button>
                                          </div>
                                          {uploadingLecturaAudio && lecturaUploadStep && (
                                            <p className="text-violet-300 text-xs flex items-center gap-1">
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                              {lecturaUploadStep}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Assign enrollment form */}
                      <Card className="bg-mystic-900/40 border-violet-500/20">
                        <CardContent className="p-4 space-y-3">
                          <h5 className="text-violet-300 text-xs font-josefin uppercase tracking-wider">
                            Asignar curso / lectura / mentoría
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-mystic-500 text-xs font-sans">Tipo</label>
                              <Select value={enrollmentForm.type} onValueChange={(v) => { setEnrollmentForm({ ...enrollmentForm, type: v, referenceId: "" }); if (v !== "lectura") setLecturaAudioFile(null); }}>
                                <SelectTrigger className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="curso">Curso</SelectItem>
                                  <SelectItem value="lectura">Lectura</SelectItem>
                                  <SelectItem value="mentoria">Mentoría</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-mystic-500 text-xs font-sans">Título</label>
                              <Input
                                placeholder={enrollmentForm.type === "curso" ? "Se autocompleta al elegir curso" : "Ej: Lectura Akáshica Individual"}
                                value={enrollmentForm.title}
                                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, title: e.target.value })}
                                className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-mystic-500 text-xs font-sans">{enrollmentForm.type === "curso" ? "Curso" : "ID referencia"} {enrollmentForm.type !== "curso" ? "(opcional)" : ""}</label>
                              {enrollmentForm.type === "curso" ? (
                                <Select value={enrollmentForm.referenceId} onValueChange={(v) => {
                                  const course = courseOptions.find(c => c.id === v);
                                  setEnrollmentForm({
                                    ...enrollmentForm,
                                    referenceId: v,
                                    title: course ? course.label : enrollmentForm.title,
                                  });
                                }}>
                                  <SelectTrigger className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm">
                                    <SelectValue placeholder="Seleccioná un curso..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {courseOptions.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  placeholder="id-referencia"
                                  value={enrollmentForm.referenceId}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, referenceId: e.target.value })}
                                  className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                                />
                              )}
                            </div>
                            <div>
                              <label className="text-mystic-500 text-xs font-sans">Notas</label>
                              <Input
                                placeholder="Notas opcionales"
                                value={enrollmentForm.notes}
                                onChange={(e) => setEnrollmentForm({ ...enrollmentForm, notes: e.target.value })}
                                className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                              />
                            </div>
                          </div>
                          {/* Audio upload for lecturas */}
                          {enrollmentForm.type === "lectura" && (
                            <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3 space-y-2">
                              <label className="text-violet-300 text-xs font-josefin uppercase tracking-wider flex items-center gap-1">
                                <Headphones className="w-3.5 h-3.5" />
                                Audio de la lectura
                              </label>
                              <Input
                                type="file"
                                accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                                onChange={(e) => setLecturaAudioFile(e.target.files?.[0] || null)}
                                className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                                disabled={uploadingLecturaAudio}
                              />
                              {lecturaAudioFile && !uploadingLecturaAudio && (
                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300 text-xs font-sans">
                                    {lecturaAudioFile.name} — {(lecturaAudioFile.size / (1024 * 1024)).toFixed(1)} MB
                                  </span>
                                </div>
                              )}
                              {lecturaAudioFile && !uploadingLecturaAudio && (
                                <p className="text-mystic-500 text-xs font-sans">
                                  El alumno podrá escucharlo y descargarlo desde su Aula Virtual
                                </p>
                              )}
                              {/* Expiration date */}
                              <div className="space-y-1">
                                <label className="text-violet-300 text-xs font-josefin uppercase tracking-wider flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Fecha de expiración
                                </label>
                                <Input
                                  type="date"
                                  value={enrollmentForm.expiresAt || ""}
                                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, expiresAt: e.target.value })}
                                  className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                                  min={new Date().toISOString().split('T')[0]}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-mystic-700/50 text-mystic-300 hover:text-cream-100 text-xs h-6"
                                    onClick={() => {
                                      const d = new Date();
                                      d.setMonth(d.getMonth() + 1);
                                      setEnrollmentForm({ ...enrollmentForm, expiresAt: d.toISOString().split('T')[0] });
                                    }}
                                  >
                                    1 mes
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-mystic-700/50 text-mystic-300 hover:text-cream-100 text-xs h-6"
                                    onClick={() => {
                                      const d = new Date();
                                      d.setMonth(d.getMonth() + 2);
                                      setEnrollmentForm({ ...enrollmentForm, expiresAt: d.toISOString().split('T')[0] });
                                    }}
                                  >
                                    2 meses
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-mystic-700/50 text-mystic-300 hover:text-cream-100 text-xs h-6"
                                    onClick={() => {
                                      const d = new Date();
                                      d.setMonth(d.getMonth() + 3);
                                      setEnrollmentForm({ ...enrollmentForm, expiresAt: d.toISOString().split('T')[0] });
                                    }}
                                  >
                                    3 meses
                                  </Button>
                                </div>
                                <p className="text-mystic-500 text-xs font-sans">
                                  Después de esta fecha, el audio se elimina de Cloudflare para no ocupar espacio. El alumno puede descargarlo antes de que expire.
                                </p>
                              </div>
                            </div>
                          )}
                          {lecturaUploadStep && (
                            <div className="flex items-center gap-2 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{lecturaUploadStep}</span>
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={handleAssignEnrollment}
                            disabled={uploadingLecturaAudio}
                            className="bg-violet-500 hover:bg-violet-400 text-white font-josefin"
                          >
                            {uploadingLecturaAudio ? (
                              <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Procesando...</>
                            ) : (
                              "Asignar"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-mystic-900/40 border-mystic-700/40">
                      <CardContent className="p-12 text-center">
                        <GraduationCap className="w-10 h-10 text-mystic-600 mx-auto mb-3" />
                        <p className="text-mystic-400 font-josefin">Seleccioná un alumno para ver sus inscripciones</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CURSO CONTENIDO ═══ */}
          {activeSection === "curso-contenido" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-gold-300 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Contenido de Cursos
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs gap-1"
                  onClick={handleCleanupExpiredLecturas}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpiar lecturas expiradas
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Course selector */}
                <div className="lg:col-span-1">
                  <Card className="bg-mystic-900/40 border-mystic-700/40">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="text-mystic-400 text-xs font-josefin uppercase tracking-wider">
                        Seleccionar curso
                      </h4>

                      {/* Quick course ID buttons */}
                      <div className="space-y-1">
                        {courseOptions.map((course) => (
                          <button
                            key={course.id}
                            onClick={() => fetchCourseContents(course.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-sans ${
                              selectedCourseId === course.id
                                ? "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                                : "hover:bg-mystic-800/60 text-mystic-300"
                            }`}
                          >
                            <GraduationCap className="w-4 h-4 inline mr-2 text-blue-400" />
                            {course.label}
                          </button>
                        ))}
                      </div>

                      <Separator className="bg-mystic-700/40" />

                      {/* Custom course ID input */}
                      <div className="space-y-2">
                        <label className="text-mystic-500 text-xs font-sans">O ingresar ID de curso:</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="mi-curso"
                            value={newCourseId}
                            onChange={(e) => setNewCourseId(e.target.value)}
                            className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10 shrink-0"
                            onClick={() => { if (newCourseId) fetchCourseContents(newCourseId); }}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Course content list + upload */}
                <div className="lg:col-span-2">
                  {selectedCourseId ? (
                    <div className="space-y-4">
                      {/* Course header + upload button */}
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-foreground flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-400" />
                          Contenido: <span className="text-blue-300">{selectedCourseId}</span>
                          <Badge variant="secondary" className="bg-mystic-800/60 text-mystic-300 text-xs ml-1">
                            {courseContents.length}
                          </Badge>
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContentUpload(!showContentUpload)}
                          className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10 font-josefin gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          {showContentUpload ? "Cancelar" : "Subir contenido"}
                        </Button>
                      </div>

                      {/* Upload form */}
                      {showContentUpload && (
                        <Card className="bg-mystic-900/40 border-blue-500/20">
                          <CardContent className="p-4 space-y-3">
                            <h5 className="text-blue-300 text-xs font-josefin uppercase tracking-wider">
                              Subir nuevo contenido
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-mystic-500 text-xs font-sans">Título</label>
                                <Input
                                  placeholder="Ej: Clase 1 - Introducción"
                                  value={contentUploadForm.title}
                                  onChange={(e) => setContentUploadForm({ ...contentUploadForm, title: e.target.value })}
                                  className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-mystic-500 text-xs font-sans">Tipo de archivo</label>
                                <Select value={contentUploadForm.fileType} onValueChange={(v) => setContentUploadForm({ ...contentUploadForm, fileType: v })}>
                                  <SelectTrigger className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="audio">Audio</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="documento">Documento</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-mystic-500 text-xs font-sans">Descripción (opcional)</label>
                                <Input
                                  placeholder="Breve descripción del contenido"
                                  value={contentUploadForm.description}
                                  onChange={(e) => setContentUploadForm({ ...contentUploadForm, description: e.target.value })}
                                  className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-mystic-500 text-xs font-sans">Archivo</label>
                                <Input
                                  type="file"
                                  accept="video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                                  onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                                  className="bg-mystic-800/60 border-mystic-700/50 text-cream-100 text-sm"
                                />
                                {contentFile && (
                                  <p className="text-mystic-400 text-xs mt-1 font-sans">
                                    {(contentFile.size / (1024 * 1024)).toFixed(1)} MB — {contentFile.type || "tipo desconocido"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={handleUploadCourseContent}
                              disabled={uploadingContent || !contentFile || !contentUploadForm.title}
                              className="bg-blue-500 hover:bg-blue-400 text-white font-josefin gap-2"
                            >
                              {uploadingContent ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Subiendo...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Subir al curso
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* Content list */}
                      {courseContents.length === 0 ? (
                        <Card className="bg-mystic-900/40 border-mystic-700/40">
                          <CardContent className="p-8 text-center">
                            <Video className="w-8 h-8 text-mystic-600 mx-auto mb-3" />
                            <p className="text-mystic-400 font-josefin text-sm">Este curso no tiene contenido</p>
                            <p className="text-mystic-500 text-xs font-sans mt-1">Subí videos, audios o documentos para los alumnos</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-2">
                          {courseContents
                            .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map((item: any) => (
                            <Card
                              key={item.id}
                              className={`bg-mystic-900/40 border-mystic-700/40 hover:border-blue-500/20 transition-colors ${
                                !item.active ? "opacity-50" : ""
                              }`}
                            >
                              <CardContent className="p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="shrink-0">
                                    {item.fileType === "video" && <Video className="w-5 h-5 text-blue-400" />}
                                    {item.fileType === "audio" && <Headphones className="w-5 h-5 text-violet-400" />}
                                    {item.fileType === "pdf" && <FileText className="w-5 h-5 text-red-400" />}
                                    {(!item.fileType || item.fileType === "documento") && <FileText className="w-5 h-5 text-amber-400" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-foreground text-sm font-sans truncate">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Badge variant="outline" className="text-xs text-mystic-400 border-mystic-600/40">
                                        {item.fileName?.split(".").pop()?.toUpperCase() || item.fileType}
                                      </Badge>
                                      {item.description && (
                                        <span className="text-mystic-500 text-xs font-sans truncate">{item.description}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-mystic-400 hover:text-foreground h-8 w-8 p-0"
                                    onClick={() => handleToggleContentActive(item.id, item.active)}
                                    title={item.active ? "Ocultar" : "Mostrar"}
                                  >
                                    <Eye className={`w-4 h-4 ${item.active ? "text-emerald-400" : "text-mystic-600"}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                    onClick={() => handleDeleteCourseContent(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="bg-mystic-900/40 border-mystic-700/40">
                      <CardContent className="p-12 text-center">
                        <FolderOpen className="w-10 h-10 text-mystic-600 mx-auto mb-3" />
                        <p className="text-mystic-400 font-josefin">Seleccioná un curso para gestionar su contenido</p>
                        <p className="text-mystic-500 text-xs font-sans mt-1">
                          Elegí un curso existente o creá uno nuevo con un ID personalizado
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="text-center text-xs text-mystic-600 font-josefin py-4">
            <p>Eter Somos — Panel de Administración</p>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
