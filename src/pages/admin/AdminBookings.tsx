import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Search,
    Calendar,
    Clock,
    User,
    Car,
    Wrench,
    MoreHorizontal,
    Plus,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Play,
    FileText,
} from "lucide-react";
import { toast } from "sonner";
import { serviceBookings, jobCards } from "@/data/adminMockData";
import { ServiceBooking, JobCard, BookingStatus } from "@/types/admin";

// Status colors
const getBookingStatusColor = (status: string) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Confirmed': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

const getJobCardStatusColor = (status: string) => {
    switch (status) {
        case 'Open': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Invoiced': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

// Calendar Day Component  
const CalendarDay = ({
    date,
    bookings,
    isToday
}: {
    date: Date;
    bookings: ServiceBooking[];
    isToday: boolean;
}) => {
    const dayBookings = bookings.filter(b => b.date === date.toISOString().split('T')[0]);

    return (
        <div className={`min-h-[100px] p-2 border border-border rounded-lg ${isToday ? 'bg-primary/5 border-primary/30' : ''}`}>
            <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                {date.getDate()}
            </div>
            <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                    <div
                        key={booking.id}
                        className={`text-xs p-1 rounded truncate ${getBookingStatusColor(booking.status)}`}
                    >
                        {booking.timeSlot} - {booking.customerName.split(' ')[0]}
                    </div>
                ))}
                {dayBookings.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{dayBookings.length - 3} more</p>
                )}
            </div>
        </div>
    );
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState<ServiceBooking[]>(serviceBookings);
    const [jobs, setJobs] = useState<JobCard[]>(jobCards);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
    const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);

    // Stats
    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todaysBookings = bookings.filter(b => b.date === '2025-01-20').length; // Mock today
        const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
        const inProgress = jobs.filter(j => j.status === 'In Progress').length;
        const completedToday = jobs.filter(j => j.status === 'Completed' && j.completedAt?.startsWith('2025-01-20')).length;
        return { todaysBookings, pendingBookings, inProgress, completedToday };
    }, [bookings, jobs]);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        let filtered = [...bookings];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (booking) =>
                    booking.customerName.toLowerCase().includes(query) ||
                    booking.vehicleInfo.toLowerCase().includes(query) ||
                    booking.id.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((booking) => booking.status === statusFilter);
        }

        return filtered;
    }, [bookings, searchQuery, statusFilter]);

    // Calendar data
    const calendarDays = useMemo(() => {
        const today = new Date();
        const days: Date[] = [];

        // Start from Sunday of current week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }

        return days;
    }, []);

    // Handlers
    const handleViewBooking = (booking: ServiceBooking) => {
        setSelectedBooking(booking);
        setIsBookingModalOpen(true);
    };

    const handleViewJob = (job: JobCard) => {
        setSelectedJob(job);
        setIsJobModalOpen(true);
    };

    const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
        setBookings(bookings.map(b =>
            b.id === bookingId ? { ...b, status: newStatus } : b
        ));
        toast.success(`Booking status updated to ${newStatus}`);
    };

    const handleCreateJobCard = (booking: ServiceBooking) => {
        toast.success(`Job card created for booking ${booking.id}`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Service Bookings</h1>
                        <p className="text-muted-foreground">Manage workshop appointments and job cards</p>
                    </div>
                    <Button className="bg-gradient-flame hover:opacity-90">
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todaysBookings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{stats.pendingBookings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Wrench className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.completedToday}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="list">
                    <TabsList>
                        <TabsTrigger value="list">Booking List</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                        <TabsTrigger value="jobcards">Job Cards</TabsTrigger>
                    </TabsList>

                    {/* Booking List Tab */}
                    <TabsContent value="list" className="space-y-4 mt-4">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by customer name, vehicle, or booking ID..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bookings Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Booking ID</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Vehicle</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Mechanic</TableHead>
                                                <TableHead className="w-12">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBookings.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                        No bookings found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredBookings.map((booking) => (
                                                    <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                                                        <TableCell className="font-mono text-xs font-medium">
                                                            {booking.id}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{booking.customerName}</p>
                                                                <p className="text-xs text-muted-foreground">{booking.customerPhone}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Car className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{booking.vehicleInfo}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{booking.serviceType}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="text-sm font-medium">{booking.date}</p>
                                                                <p className="text-xs text-muted-foreground">{booking.timeSlot}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getBookingStatusColor(booking.status)}>
                                                                {booking.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm">{booking.assignedMechanic || "—"}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit Booking
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    {booking.status === 'Pending' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleUpdateBookingStatus(booking.id, 'Confirmed')}
                                                                        >
                                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                            Confirm
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {booking.status === 'Confirmed' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleCreateJobCard(booking)}
                                                                        >
                                                                            <FileText className="mr-2 h-4 w-4" />
                                                                            Create Job Card
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => handleUpdateBookingStatus(booking.id, 'Cancelled')}
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Cancel Booking
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
                    </TabsContent>

                    {/* Calendar View Tab */}
                    <TabsContent value="calendar" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>This Week</CardTitle>
                                <CardDescription>Service appointments for the current week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-muted-foreground pb-2">
                                            {day}
                                        </div>
                                    ))}
                                    {calendarDays.map((date, index) => (
                                        <CalendarDay
                                            key={index}
                                            date={date}
                                            bookings={bookings}
                                            isToday={date.toDateString() === new Date().toDateString()}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Job Cards Tab */}
                    <TabsContent value="jobcards" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Job Cards</CardTitle>
                                <CardDescription>Workshop job cards and service progress</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Job Card ID</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Vehicle</TableHead>
                                                <TableHead>Mechanic</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Total Cost</TableHead>
                                                <TableHead className="w-12">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jobs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        No job cards found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                jobs.map((job) => (
                                                    <TableRow
                                                        key={job.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => handleViewJob(job)}
                                                    >
                                                        <TableCell className="font-mono text-xs font-medium">
                                                            {job.id}
                                                        </TableCell>
                                                        <TableCell>{job.customerName}</TableCell>
                                                        <TableCell>{job.vehicleInfo}</TableCell>
                                                        <TableCell>{job.assignedMechanic}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getJobCardStatusColor(job.status)}>
                                                                {job.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            ₹{job.totalCost.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleViewJob(job)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit Job Card
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        Generate Invoice
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
                    </TabsContent>
                </Tabs>

                {/* Booking Detail Modal */}
                <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedBooking && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Booking {selectedBooking.id}
                                        <Badge className={getBookingStatusColor(selectedBooking.status)}>
                                            {selectedBooking.status}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedBooking.date} at {selectedBooking.timeSlot}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Customer & Vehicle Info */}
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Customer
                                            </h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="font-medium">{selectedBooking.customerName}</p>
                                                <p className="text-sm text-muted-foreground">{selectedBooking.customerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Car className="h-4 w-4" />
                                                Vehicle
                                            </h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="font-medium">{selectedBooking.vehicleMake} {selectedBooking.vehicleModel}</p>
                                                <p className="text-sm text-muted-foreground">{selectedBooking.vehicleYear}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Wrench className="h-4 w-4" />
                                            Services Requested
                                        </h4>
                                        <div className="p-4 rounded-lg border border-border">
                                            <Badge variant="secondary" className="mb-2">{selectedBooking.serviceType}</Badge>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedBooking.services.map((service, index) => (
                                                    <Badge key={index} variant="outline">{service}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estimated Cost & Mechanic */}
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="p-4 rounded-lg border border-border">
                                            <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                            <p className="text-2xl font-bold">₹{selectedBooking.estimatedCost?.toLocaleString() || "—"}</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-border">
                                            <p className="text-sm text-muted-foreground">Assigned Mechanic</p>
                                            <p className="text-xl font-medium">{selectedBooking.assignedMechanic || "Not assigned"}</p>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {selectedBooking.notes && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Notes</h4>
                                            <div className="p-4 rounded-lg border border-border bg-muted/30">
                                                <p className="text-sm">{selectedBooking.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                                        Close
                                    </Button>
                                    {selectedBooking.status === 'Pending' && (
                                        <Button
                                            className="bg-gradient-flame hover:opacity-90"
                                            onClick={() => {
                                                handleUpdateBookingStatus(selectedBooking.id, 'Confirmed');
                                                setIsBookingModalOpen(false);
                                            }}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Confirm Booking
                                        </Button>
                                    )}
                                    {selectedBooking.status === 'Confirmed' && (
                                        <Button
                                            className="bg-gradient-flame hover:opacity-90"
                                            onClick={() => {
                                                handleCreateJobCard(selectedBooking);
                                                setIsBookingModalOpen(false);
                                            }}
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Create Job Card
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Job Card Detail Modal */}
                <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        {selectedJob && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Job Card {selectedJob.id}
                                        <Badge className={getJobCardStatusColor(selectedJob.status)}>
                                            {selectedJob.status}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedJob.customerName} • {selectedJob.vehicleInfo}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Info Grid */}
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="p-4 rounded-lg border border-border text-center">
                                            <User className="h-5 w-5 mx-auto mb-2 text-primary" />
                                            <p className="text-sm text-muted-foreground">Mechanic</p>
                                            <p className="font-medium">{selectedJob.assignedMechanic}</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-border text-center">
                                            <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                                            <p className="text-sm text-muted-foreground">Labor Hours</p>
                                            <p className="font-medium">{selectedJob.laborHours} hrs</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-border text-center">
                                            <Wrench className="h-5 w-5 mx-auto mb-2 text-primary" />
                                            <p className="text-sm text-muted-foreground">Services</p>
                                            <p className="font-medium">{selectedJob.services.length}</p>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Services</h4>
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Service</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead className="text-right">Price</TableHead>
                                                        <TableHead className="text-center">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedJob.services.map((service, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">{service.name}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">{service.description}</TableCell>
                                                            <TableCell className="text-right">₹{service.price.toLocaleString()}</TableCell>
                                                            <TableCell className="text-center">
                                                                {service.completed ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                                                ) : (
                                                                    <Clock className="h-4 w-4 text-yellow-500 mx-auto" />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Parts Used */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Parts Used</h4>
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Part</TableHead>
                                                        <TableHead>SKU</TableHead>
                                                        <TableHead className="text-center">Qty</TableHead>
                                                        <TableHead className="text-right">Unit Price</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedJob.partsUsed.map((part, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">{part.productName}</TableCell>
                                                            <TableCell className="font-mono text-xs">{part.sku}</TableCell>
                                                            <TableCell className="text-center">{part.quantity}</TableCell>
                                                            <TableCell className="text-right">₹{part.unitPrice.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right font-medium">₹{part.total.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Cost Summary */}
                                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">Labor Cost</span>
                                            <span>₹{selectedJob.laborCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-muted-foreground">Parts Cost</span>
                                            <span>₹{selectedJob.partsCost.toLocaleString()}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between py-2 font-bold text-lg">
                                            <span>Total</span>
                                            <span>₹{selectedJob.totalCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsJobModalOpen(false)}>
                                        Close
                                    </Button>
                                    <Button className="bg-gradient-flame hover:opacity-90">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Invoice
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminBookings;
