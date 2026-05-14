import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    HelpCircle,
    Clock,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    MoreHorizontal,
    Eye,
    User,
    Send,
    Paperclip,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { supportTickets } from "@/data/adminMockData";
import { SupportTicket, TicketStatus, TicketPriority } from "@/types/admin";

// Status colors
const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case 'Open': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Waiting on Customer': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        case 'Resolved': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

// Priority colors
const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
        case 'Urgent': return 'bg-red-500/20 text-red-400 border-red-500/50';
        case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Low': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

const AdminSupport = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>(supportTickets);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");

    // Stats
    const stats = useMemo(() => {
        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'Open').length;
        const inProgress = tickets.filter(t => t.status === 'In Progress').length;
        const urgent = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Closed' && t.status !== 'Resolved').length;
        return { total, open, inProgress, urgent };
    }, [tickets]);

    // Filter tickets
    const filteredTickets = useMemo(() => {
        let filtered = [...tickets];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (ticket) =>
                    ticket.id.toLowerCase().includes(query) ||
                    ticket.subject.toLowerCase().includes(query) ||
                    ticket.customerName.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((ticket) => ticket.status === statusFilter);
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
        }

        // Sort by priority and date
        filtered.sort((a, b) => {
            const priorityOrder: Record<TicketPriority, number> = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return filtered;
    }, [tickets, searchQuery, statusFilter, priorityFilter]);

    // Handlers
    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsDetailOpen(true);
        setReplyMessage("");
    };

    const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
        setTickets(tickets.map(t =>
            t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : t
        ));
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        toast.success(`Ticket status updated to ${newStatus}`);
    };

    const handleAssignTicket = (ticketId: string, agent: string) => {
        setTickets(tickets.map(t =>
            t.id === ticketId ? { ...t, assignedTo: agent } : t
        ));
        toast.success(`Ticket assigned to ${agent}`);
    };

    const handleSendReply = () => {
        if (!replyMessage.trim() || !selectedTicket) return;

        const newMessage = {
            id: `MSG-${Date.now()}`,
            sender: 'Admin',
            senderType: 'Admin' as const,
            message: replyMessage,
            timestamp: new Date().toISOString(),
        };

        setTickets(tickets.map(t =>
            t.id === selectedTicket.id
                ? { ...t, messages: [...t.messages, newMessage], status: 'Waiting on Customer' as TicketStatus }
                : t
        ));

        setSelectedTicket({
            ...selectedTicket,
            messages: [...selectedTicket.messages, newMessage],
            status: 'Waiting on Customer',
        });

        setReplyMessage("");
        toast.success("Reply sent");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
                        <p className="text-muted-foreground">Manage customer support requests</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <MessageSquare className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{stats.urgent}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by ticket ID, subject, or customer..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Waiting on Customer">Waiting on Customer</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTickets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No tickets found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTickets.map((ticket) => (
                                            <TableRow
                                                key={ticket.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleViewTicket(ticket)}
                                            >
                                                <TableCell>
                                                    <div>
                                                        <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
                                                        <p className="font-medium truncate max-w-[200px]">{ticket.subject}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        to={`/admin/customers/${ticket.customerId}`}
                                                        className="text-primary hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {ticket.customerName}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{ticket.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ticket.assignedTo || <span className="text-muted-foreground">Unassigned</span>}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {ticket.updatedAt}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Ticket
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleAssignTicket(ticket.id, 'Arun Krishnan')}>
                                                                <User className="mr-2 h-4 w-4" />
                                                                Assign to Me
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'In Progress')}>
                                                                <Clock className="mr-2 h-4 w-4" />
                                                                Mark In Progress
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'Resolved')}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                Mark Resolved
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Ticket Detail Modal */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                        {selectedTicket && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-sm text-muted-foreground">{selectedTicket.id}</span>
                                        <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                                        <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                                    </DialogTitle>
                                    <DialogDescription className="text-lg font-medium text-foreground">
                                        {selectedTicket.subject}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex-1 overflow-hidden flex flex-col">
                                    {/* Ticket Meta */}
                                    <div className="grid gap-4 sm:grid-cols-3 pb-4 border-b border-border">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Customer</p>
                                            <Link
                                                to={`/admin/customers/${selectedTicket.customerId}`}
                                                className="text-primary hover:underline inline-flex items-center gap-1"
                                            >
                                                {selectedTicket.customerName}
                                                <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Category</p>
                                            <p className="font-medium">{selectedTicket.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Assigned To</p>
                                            <p className="font-medium">{selectedTicket.assignedTo || "Unassigned"}</p>
                                        </div>
                                    </div>

                                    {/* Related Info */}
                                    {(selectedTicket.orderId || selectedTicket.productId) && (
                                        <div className="py-4 border-b border-border flex gap-4 flex-wrap">
                                            {selectedTicket.orderId && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Related Order:</span>
                                                    <Link to="/admin/orders" className="text-primary hover:underline font-mono text-sm">
                                                        {selectedTicket.orderId}
                                                    </Link>
                                                </div>
                                            )}
                                            {selectedTicket.productId && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Related Product:</span>
                                                    <Link to="/admin/products" className="text-primary hover:underline font-mono text-sm">
                                                        {selectedTicket.productId}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Messages */}
                                    <ScrollArea className="flex-1 py-4">
                                        <div className="space-y-4 pr-4">
                                            {selectedTicket.messages.map((message) => {
                                                const isAdmin = message.senderType === 'Admin';
                                                return (
                                                    <div
                                                        key={message.id}
                                                        className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className={isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                                                {message.sender[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`flex-1 max-w-[80%] ${isAdmin ? 'items-end' : ''}`}>
                                                            <div className={`rounded-lg p-3 ${isAdmin ? 'bg-primary/10 ml-auto' : 'bg-muted'}`}>
                                                                <p className="text-sm">{message.message}</p>
                                                            </div>
                                                            <div className={`flex gap-2 mt-1 text-xs text-muted-foreground ${isAdmin ? 'justify-end' : ''}`}>
                                                                <span>{message.sender}</span>
                                                                <span>•</span>
                                                                <span>{new Date(message.timestamp).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>

                                    {/* Reply Box */}
                                    {selectedTicket.status !== 'Closed' && (
                                        <div className="pt-4 border-t border-border">
                                            <div className="flex gap-2">
                                                <Textarea
                                                    placeholder="Type your reply..."
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <Button variant="ghost" size="sm">
                                                    <Paperclip className="h-4 w-4 mr-2" />
                                                    Attach
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={selectedTicket.status}
                                                        onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value as TicketStatus)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Open">Open</SelectItem>
                                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                                            <SelectItem value="Waiting on Customer">Waiting on Customer</SelectItem>
                                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                                            <SelectItem value="Closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        className="bg-gradient-flame hover:opacity-90"
                                                        onClick={handleSendReply}
                                                        disabled={!replyMessage.trim()}
                                                    >
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send Reply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminSupport;
