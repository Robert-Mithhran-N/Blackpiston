import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Store,
    Upload,
    Image,
    Mail,
    Phone,
    MapPin,
    Clock,
    Globe,
    Calendar,
    AlertTriangle,
    Power,
    Save,
    RotateCcw,
    Sun,
    Moon,
} from "lucide-react";
import { toast } from "sonner";

// Types for settings
interface StoreSettings {
    storeName: string;
    logoLight: string | null;
    logoDark: string | null;
    favicon: string | null;
    tagline: string;
    description: string;
    businessEmail: string;
    supportPhone: string;
    address: {
        line1: string;
        line2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    businessHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    defaultLanguage: string;
    defaultTimezone: string;
    dateFormat: string;
    timeFormat: string;
    maintenanceMode: boolean;
    storeStatus: 'live' | 'temporarily_closed';
}

// Initial mock settings
const initialSettings: StoreSettings = {
    storeName: "BlackPiston Garage",
    logoLight: null,
    logoDark: null,
    favicon: null,
    tagline: "Premium Motorcycle Gear & Workshop Services",
    description: "Your one-stop destination for premium motorcycle riding gear, accessories, and professional workshop services. We offer the finest selection of helmets, jackets, gloves, boots, and more from top brands worldwide.",
    businessEmail: "hello@blackpiston.com",
    supportPhone: "+91 98765 43210",
    address: {
        line1: "123 Race Street",
        line2: "Motor Hub Complex",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
    },
    businessHours: {
        monday: { open: "09:00", close: "20:00", closed: false },
        tuesday: { open: "09:00", close: "20:00", closed: false },
        wednesday: { open: "09:00", close: "20:00", closed: false },
        thursday: { open: "09:00", close: "20:00", closed: false },
        friday: { open: "09:00", close: "20:00", closed: false },
        saturday: { open: "10:00", close: "18:00", closed: false },
        sunday: { open: "10:00", close: "16:00", closed: true },
    },
    defaultLanguage: "en",
    defaultTimezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    maintenanceMode: false,
    storeStatus: 'live',
};

// Options
const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "kn", label: "Kannada" },
    { value: "te", label: "Telugu" },
];

const timezoneOptions = [
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
    { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
    { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
];

const dateFormatOptions = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2025)" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2025)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-12-31)" },
    { value: "DD MMM YYYY", label: "DD MMM YYYY (31 Dec 2025)" },
];

const timeFormatOptions = [
    { value: "12h", label: "12-hour (2:30 PM)" },
    { value: "24h", label: "24-hour (14:30)" },
];

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

// File upload component
const FileUploadBox = ({
    label,
    value,
    onChange,
    icon: Icon,
    hint
}: {
    label: string;
    value: string | null;
    onChange: (file: string | null) => void;
    icon: React.ElementType;
    hint?: string;
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In real implementation, this would upload the file
            // For now, we'll just use a placeholder URL
            const fakeUrl = URL.createObjectURL(file);
            onChange(fakeUrl);
            toast.success(`${label} uploaded successfully`);
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                {value ? (
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            <img src={value} alt={label} className="h-full w-full object-contain" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Image uploaded</p>
                            <p className="text-xs text-muted-foreground">{hint}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onChange(null)}>
                            Remove
                        </Button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Click to upload</p>
                            <p className="text-xs text-muted-foreground">{hint || "PNG, JPG up to 2MB"}</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                )}
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [hasChanges, setHasChanges] = useState(false);

    // Update settings
    const updateSettings = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    // Update address
    const updateAddress = (field: keyof StoreSettings['address'], value: string) => {
        setSettings(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
        setHasChanges(true);
    };

    // Update business hours
    const updateBusinessHours = (
        day: keyof StoreSettings['businessHours'],
        field: 'open' | 'close' | 'closed',
        value: string | boolean
    ) => {
        setSettings(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: { ...prev.businessHours[day], [field]: value }
            }
        }));
        setHasChanges(true);
    };

    // Save settings
    const handleSave = () => {
        // In real implementation, this would call an API
        toast.success("Settings saved successfully");
        setHasChanges(false);
    };

    // Reset to defaults
    const handleReset = () => {
        setSettings(initialSettings);
        setHasChanges(false);
        toast.info("Settings reset to defaults");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
                        <p className="text-muted-foreground">Configure your store identity and preferences</p>
                    </div>
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" disabled={!hasChanges}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Reset Settings?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will discard all unsaved changes and reset settings to their default values.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button
                            className="bg-gradient-flame hover:opacity-90"
                            onClick={handleSave}
                            disabled={!hasChanges}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="flex gap-4 flex-wrap">
                    <Card className={`flex-1 min-w-[200px] ${settings.maintenanceMode ? 'border-yellow-500/50' : 'border-green-500/50'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${settings.maintenanceMode ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                                    <AlertTriangle className={`h-5 w-5 ${settings.maintenanceMode ? 'text-yellow-500' : 'text-green-500'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Maintenance Mode</p>
                                    <p className="text-xs text-muted-foreground">{settings.maintenanceMode ? 'Store is under maintenance' : 'Store is operational'}</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => updateSettings('maintenanceMode', checked)}
                            />
                        </CardContent>
                    </Card>

                    <Card className={`flex-1 min-w-[200px] ${settings.storeStatus === 'live' ? 'border-green-500/50' : 'border-red-500/50'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${settings.storeStatus === 'live' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    <Power className={`h-5 w-5 ${settings.storeStatus === 'live' ? 'text-green-500' : 'text-red-500'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Store Status</p>
                                    <Badge className={settings.storeStatus === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                        {settings.storeStatus === 'live' ? 'Live' : 'Temporarily Closed'}
                                    </Badge>
                                </div>
                            </div>
                            <Select
                                value={settings.storeStatus}
                                onValueChange={(value: 'live' | 'temporarily_closed') => updateSettings('storeStatus', value)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="temporarily_closed">Temporarily Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                {/* Store Identity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            Store Identity
                        </CardTitle>
                        <CardDescription>Basic information about your store</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">Store Name</Label>
                                <Input
                                    id="storeName"
                                    value={settings.storeName}
                                    onChange={(e) => updateSettings('storeName', e.target.value)}
                                    placeholder="Enter store name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tagline">Tagline</Label>
                                <Input
                                    id="tagline"
                                    value={settings.tagline}
                                    onChange={(e) => updateSettings('tagline', e.target.value)}
                                    placeholder="Enter tagline"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Store Description</Label>
                            <Textarea
                                id="description"
                                value={settings.description}
                                onChange={(e) => updateSettings('description', e.target.value)}
                                placeholder="Describe your store"
                                rows={3}
                            />
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-3">
                            <FileUploadBox
                                label="Logo (Light Mode)"
                                value={settings.logoLight}
                                onChange={(val) => updateSettings('logoLight', val)}
                                icon={Sun}
                                hint="For dark backgrounds"
                            />
                            <FileUploadBox
                                label="Logo (Dark Mode)"
                                value={settings.logoDark}
                                onChange={(val) => updateSettings('logoDark', val)}
                                icon={Moon}
                                hint="For light backgrounds"
                            />
                            <FileUploadBox
                                label="Favicon"
                                value={settings.favicon}
                                onChange={(val) => updateSettings('favicon', val)}
                                icon={Image}
                                hint="32x32px recommended"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                        <CardDescription>How customers can reach you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="businessEmail">Business Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="businessEmail"
                                        type="email"
                                        value={settings.businessEmail}
                                        onChange={(e) => updateSettings('businessEmail', e.target.value)}
                                        placeholder="hello@example.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supportPhone">Support Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="supportPhone"
                                        value={settings.supportPhone}
                                        onChange={(e) => updateSettings('supportPhone', e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Label>Physical Address (for invoices)</Label>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="addressLine1">Address Line 1</Label>
                                    <Input
                                        id="addressLine1"
                                        value={settings.address.line1}
                                        onChange={(e) => updateAddress('line1', e.target.value)}
                                        placeholder="Street address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="addressLine2">Address Line 2</Label>
                                    <Input
                                        id="addressLine2"
                                        value={settings.address.line2}
                                        onChange={(e) => updateAddress('line2', e.target.value)}
                                        placeholder="Apartment, suite, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={settings.address.city}
                                        onChange={(e) => updateAddress('city', e.target.value)}
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={settings.address.state}
                                        onChange={(e) => updateAddress('state', e.target.value)}
                                        placeholder="State"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        value={settings.address.postalCode}
                                        onChange={(e) => updateAddress('postalCode', e.target.value)}
                                        placeholder="Postal code"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={settings.address.country}
                                        onChange={(e) => updateAddress('country', e.target.value)}
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Hours */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Business Hours
                        </CardTitle>
                        <CardDescription>Set your store operating hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {daysOfWeek.map((day) => (
                                <div key={day} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                                    <div className="w-28">
                                        <p className="font-medium capitalize">{day}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={!settings.businessHours[day].closed}
                                            onCheckedChange={(checked) => updateBusinessHours(day, 'closed', !checked)}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {settings.businessHours[day].closed ? 'Closed' : 'Open'}
                                        </span>
                                    </div>
                                    {!settings.businessHours[day].closed && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Input
                                                type="time"
                                                value={settings.businessHours[day].open}
                                                onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                                                className="w-32"
                                            />
                                            <span className="text-muted-foreground">to</span>
                                            <Input
                                                type="time"
                                                value={settings.businessHours[day].close}
                                                onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                                                className="w-32"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Regional Settings
                        </CardTitle>
                        <CardDescription>Language, timezone, and format preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="language">Default Language</Label>
                                <Select
                                    value={settings.defaultLanguage}
                                    onValueChange={(value) => updateSettings('defaultLanguage', value)}
                                >
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languageOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Default Timezone</Label>
                                <Select
                                    value={settings.defaultTimezone}
                                    onValueChange={(value) => updateSettings('defaultTimezone', value)}
                                >
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezoneOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateFormat">Date Format</Label>
                                <Select
                                    value={settings.dateFormat}
                                    onValueChange={(value) => updateSettings('dateFormat', value)}
                                >
                                    <SelectTrigger id="dateFormat">
                                        <SelectValue placeholder="Select date format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dateFormatOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeFormat">Time Format</Label>
                                <Select
                                    value={settings.timeFormat}
                                    onValueChange={(value) => updateSettings('timeFormat', value)}
                                >
                                    <SelectTrigger id="timeFormat">
                                        <SelectValue placeholder="Select time format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeFormatOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Floating Save Button for Mobile */}
                {hasChanges && (
                    <div className="fixed bottom-6 right-6 md:hidden">
                        <Button
                            size="lg"
                            className="bg-gradient-flame hover:opacity-90 shadow-lg"
                            onClick={handleSave}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
