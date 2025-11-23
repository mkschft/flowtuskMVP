"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Loader2, Check, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type UserProfile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    preferences: {
        theme: string;
        defaultExportFormat: string;
        emailNotifications: boolean;
    };
    usage_stats: {
        conversationsCreated: number;
        exportsGenerated: number;
        lastActiveAt: string | null;
    };
    created_at: string;
    updated_at: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userEmail, setUserEmail] = useState<string>("");
    const [fullName, setFullName] = useState("");
    const [theme, setTheme] = useState("system");
    const [defaultExportFormat, setDefaultExportFormat] = useState("google-slides");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setUserEmail(data.user.email || "");
                setFullName(data.profile.full_name || "");
                setTheme(data.profile.preferences?.theme || "system");
                setDefaultExportFormat(data.profile.preferences?.defaultExportFormat || "google-slides");
                setEmailNotifications(data.profile.preferences?.emailNotifications ?? true);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    preferences: {
                        theme,
                        defaultExportFormat,
                        emailNotifications
                    }
                })
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Mock user object for sidebar
    const sidebarUser = {
        email: userEmail,
        user_metadata: { full_name: fullName }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-[260px] shrink-0 h-full">
                <AppSidebar
                    user={sidebarUser}
                    onNewConversation={() => router.push('/app')}
                />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-[300px]">
                    <AppSidebar
                        user={sidebarUser}
                        onNewConversation={() => router.push('/app')}
                        onCloseMobileDrawer={() => setSidebarOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center p-4 border-b shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold">Profile Settings</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold">Profile Settings</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your account settings and preferences
                            </p>
                        </div>

                        {/* Profile Card */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Account Information</h2>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                                        {userEmail?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground mb-1">Profile Picture</p>
                                        <p className="text-sm">Using default avatar</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            value={userEmail}
                                            disabled
                                            className="bg-muted"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Preferences Card */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-6">Preferences</h3>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="theme" className="mb-2 block">Theme</Label>
                                    <Select value={theme} onValueChange={setTheme}>
                                        <SelectTrigger id="theme">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="exportFormat" className="mb-2 block">Default Export Format</Label>
                                    <Select value={defaultExportFormat} onValueChange={setDefaultExportFormat}>
                                        <SelectTrigger id="exportFormat">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="google-slides">Google Slides</SelectItem>
                                            <SelectItem value="linkedin">LinkedIn Post</SelectItem>
                                            <SelectItem value="plain-text">Plain Text</SelectItem>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <Label htmlFor="notifications" className="font-medium">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates about your account
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="notifications"
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Usage Stats Card */}
                        {profile?.usage_stats && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-2xl font-bold">{profile.usage_stats.conversationsCreated || 0}</p>
                                        <p className="text-sm text-muted-foreground">Conversations Created</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-2xl font-bold">{profile.usage_stats.exportsGenerated || 0}</p>
                                        <p className="text-sm text-muted-foreground">Exports Generated</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Account Actions Card */}
                        <Card className="p-6 border-destructive/20">
                            <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                            alert('Account deletion feature coming soon');
                                        }
                                    }}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </Card>

                        {/* Save Button */}
                        <div className="sticky bottom-6">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full shadow-lg"
                                size="lg"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : saved ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
