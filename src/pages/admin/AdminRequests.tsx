import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    ArrowLeft,
    User,
    Calendar,
    Phone,
} from "lucide-react";
import { productRequests } from "@/data/adminMockData";

// ============================================================
// Request Card Component
// ============================================================
interface RequestCardProps {
    productName: string;
    requestedBy: string;
    userPhone: string;
    requestDate: string;
    status: string;
    loading?: boolean;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "Pending":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        case "Approved":
            return "bg-green-500/20 text-green-400 border-green-500/50";
        case "Rejected":
            return "bg-red-500/20 text-red-400 border-red-500/50";
        default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
};

const RequestCard = ({
    productName,
    requestedBy,
    userPhone,
    requestDate,
    status,
    loading,
}: RequestCardProps) => {
    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-border hover:border-primary/30">
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                ) : (
                    <>
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 bg-purple-500/10">
                            <MessageSquare className="h-6 w-6 text-purple-500" />
                        </div>

                        {/* Product Name */}
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2">{productName}</h3>

                        {/* Requested By */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            <span>{requestedBy}</span>
                        </div>

                        {/* Mobile Number */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-primary">{userPhone}</span>
                        </div>

                        {/* Request Date */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Calendar className="h-4 w-4" />
                            <span>{requestDate}</span>
                        </div>

                        {/* Status Badge */}
                        <Badge className={getStatusColor(status)}>{status}</Badge>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 opacity-30" />
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================
// Product Requests Page
// ============================================================
const AdminRequests = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const requests = productRequests;
    const pendingCount = requests.filter((r) => r.status === "Pending").length;

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Link to="/admin">
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Product Requests</h1>
                        <p className="text-muted-foreground mt-1">Products requested by users</p>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex items-center gap-2 p-4 rounded-lg border border-purple-500/50 bg-purple-500/5">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <span className="text-purple-400 font-medium">
                        {requests.length} total requests • {pendingCount} pending
                    </span>
                </div>

                {/* Request Cards Grid */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <RequestCard
                                    key={i}
                                    productName=""
                                    requestedBy=""
                                    userPhone=""
                                    requestDate=""
                                    status=""
                                    loading={true}
                                />
                            ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-lg">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Product Requests</h3>
                        <p className="text-muted-foreground">No product requests from users at the moment</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {requests.map((request) => (
                            <RequestCard
                                key={request.id}
                                productName={request.productName}
                                requestedBy={request.requestedBy}
                                userPhone={request.userPhone}
                                requestDate={request.requestDate}
                                status={request.status}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminRequests;
