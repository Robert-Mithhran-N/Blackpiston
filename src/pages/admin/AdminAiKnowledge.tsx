import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Brain,
    Plus,
    Pencil,
    Trash2,
    Search,
    MessageSquare,
    FileText,
    HelpCircle,
    Store,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ── API helpers ──

const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes("localhost")) return envUrl;
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
};

const API_BASE = getApiBaseUrl();

function getAdminToken(): string | null {
    try {
        const raw = localStorage.getItem("blackpiston_admin_auth");
        if (raw) {
            const parsed = JSON.parse(raw);
            return parsed?.token || null;
        }
    } catch {}
    return null;
}

function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getAdminToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

// ── Types ──

interface KnowledgeEntry {
    id: string;
    category: "FAQ" | "POLICY" | "CUSTOM" | "STORE_INFO";
    question: string;
    answer: string;
    tags: string[];
    isActive: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

const CATEGORY_CONFIG = {
    FAQ: { label: "FAQ", icon: HelpCircle, color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
    POLICY: { label: "Policy", icon: FileText, color: "bg-purple-500/20 text-purple-400 border-purple-500/50" },
    CUSTOM: { label: "Custom", icon: MessageSquare, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" },
    STORE_INFO: { label: "Store Info", icon: Store, color: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
};

// ── Component ──

const AdminAiKnowledge = () => {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        category: "FAQ" as KnowledgeEntry["category"],
        question: "",
        answer: "",
        tags: "",
        isActive: true,
        priority: 0,
    });

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== "ALL") params.set("category", filter);
            if (searchQuery) params.set("search", searchQuery);

            const res = await fetch(`${API_BASE}/admin/ai/knowledge?${params}`, {
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setEntries(data.entries || []);
        } catch (err) {
            toast.error("Failed to load knowledge entries");
        } finally {
            setLoading(false);
        }
    }, [filter, searchQuery]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const openCreate = () => {
        setEditingEntry(null);
        setForm({ category: "FAQ", question: "", answer: "", tags: "", isActive: true, priority: 0 });
        setShowDialog(true);
    };

    const openEdit = (entry: KnowledgeEntry) => {
        setEditingEntry(entry);
        setForm({
            category: entry.category,
            question: entry.question,
            answer: entry.answer,
            tags: entry.tags.join(", "),
            isActive: entry.isActive,
            priority: entry.priority,
        });
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!form.question.trim() || !form.answer.trim()) {
            toast.error("Question and answer are required");
            return;
        }

        setSaving(true);
        try {
            const body = {
                category: form.category,
                question: form.question.trim(),
                answer: form.answer.trim(),
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                isActive: form.isActive,
                priority: form.priority,
            };

            const url = editingEntry
                ? `${API_BASE}/admin/ai/knowledge/${editingEntry.id}`
                : `${API_BASE}/admin/ai/knowledge`;

            const res = await fetch(url, {
                method: editingEntry ? "PUT" : "POST",
                headers: getHeaders(),
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success(editingEntry ? "Entry updated" : "Entry created");
            setShowDialog(false);
            fetchEntries();
        } catch (err) {
            toast.error("Failed to save entry");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this knowledge entry?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/ai/knowledge/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Entry deleted");
            fetchEntries();
        } catch (err) {
            toast.error("Failed to delete entry");
        }
    };

    const filteredEntries = entries;

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 space-y-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Brain className="w-7 h-7 text-amber-500" />
                            AI Knowledge Base
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage FAQs, policies, and custom answers for the AI assistant
                        </p>
                    </div>
                    <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="FAQ">FAQ</SelectItem>
                            <SelectItem value="POLICY">Policy</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                            <SelectItem value="STORE_INFO">Store Info</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["FAQ", "POLICY", "CUSTOM", "STORE_INFO"] as const).map(cat => {
                        const config = CATEGORY_CONFIG[cat];
                        const Icon = config.icon;
                        const count = entries.filter(e => e.category === cat).length;
                        return (
                            <Card key={cat} className="bg-card/50 border-border/50">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color.split(" ")[0]}`}>
                                        <Icon className={`w-5 h-5 ${config.color.split(" ")[1]}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{count}</p>
                                        <p className="text-xs text-muted-foreground">{config.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Entries List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-muted-foreground">No knowledge entries found</p>
                        <Button onClick={openCreate} variant="outline" className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Create your first entry
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredEntries.map(entry => {
                            const config = CATEGORY_CONFIG[entry.category];
                            return (
                                <Card key={entry.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className={config.color}>
                                                        {config.label}
                                                    </Badge>
                                                    {!entry.isActive && (
                                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                    {entry.priority > 0 && (
                                                        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/30">
                                                            Priority: {entry.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground mb-1 truncate">
                                                    {entry.question}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {entry.answer}
                                                </p>
                                                {entry.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {entry.tags.slice(0, 5).map((tag, i) => (
                                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(entry)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(entry.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Create/Edit Dialog ── */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-amber-500" />
                            {editingEntry ? "Edit Knowledge Entry" : "Add Knowledge Entry"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                            <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v as any }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FAQ">FAQ</SelectItem>
                                    <SelectItem value="POLICY">Policy</SelectItem>
                                    <SelectItem value="CUSTOM">Custom</SelectItem>
                                    <SelectItem value="STORE_INFO">Store Info</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Question / Title</label>
                            <input
                                type="text"
                                value={form.question}
                                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                                placeholder="e.g., What is your return policy?"
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Answer</label>
                            <textarea
                                value={form.answer}
                                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                                placeholder="The answer the AI will use..."
                                rows={5}
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                placeholder="e.g., returns, refund, exchange"
                                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Priority</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={form.priority}
                                    onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
                                    className="w-20 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-5">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                    className="rounded border-border"
                                />
                                <label htmlFor="isActive" className="text-sm text-foreground">Active</label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                        >
                            {saving ? "Saving..." : editingEntry ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminAiKnowledge;
