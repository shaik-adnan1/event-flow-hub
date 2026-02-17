import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogOut, Pencil, Trash2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreateEventDialog from "@/components/CreateEventDialog";
import ManageManagersDialog from "@/components/ManageManagersDialog";
import EditEventDialog from "@/components/EditEventDialog";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  time?: string;
  venue: string;
  status: string;
  description?: string;
  attendeeCount?: number;
  assignedManagerId?: string;
}

const generateDummyEvents = (): Event[] => {
  const names = [
    "Annual Tech Conference", "Product Launch Event", "Team Building Retreat",
    "Marketing Summit", "Developer Hackathon", "Leadership Workshop",
    "Customer Appreciation Gala", "Innovation Expo", "Sales Kickoff",
    "Board Meeting", "Charity Fundraiser", "Networking Mixer",
    "Design Thinking Workshop", "Quarterly Review", "Holiday Party",
    "Onboarding Orientation", "AI & ML Symposium", "Cloud Migration Seminar",
    "Cybersecurity Forum", "Investor Day", "Product Demo Day",
    "Wellness Fair", "Startup Pitch Night", "Data Analytics Summit",
    "Agile Training", "UX Research Day", "Partner Conference",
    "Town Hall Meeting", "Sustainability Forum", "Women in Tech Summit",
  ];
  const types = ["Corporate", "Public", "Private", "Workshop", "Conference"];
  const venues = ["Convention Center", "Grand Hotel Ballroom", "Mountain Resort", "Tech Hub", "Downtown Arena", "City Hall", "University Auditorium"];
  const statuses = ["pending", "in-progress", "completed", "deleted", "in-progress", "pending", "pending", "completed"];

  return names.map((name, i) => ({
    id: String(i + 1),
    name,
    type: types[i % types.length],
    date: `2025-${String(Math.floor(i / 3) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    time: `${String(9 + (i % 10)).padStart(2, "0")}:00`,
    venue: venues[i % venues.length],
    status: statuses[i % statuses.length],
    attendeeCount: 50 + i * 30,
  }));
};

const ITEMS_PER_PAGE = 8;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(generateDummyEvents);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleLogout = () => navigate("/login");

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, status: "deleted" } : e));
      toast.success(`Event "${selectedEvent.name}" marked as deleted`);
    }
    setDeleteDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-muted text-muted-foreground";
      case "in-progress": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "completed": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "deleted": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Filtering logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (searchQuery && !event.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== "all" && event.status !== statusFilter) return false;
      if (dateFrom && event.date < dateFrom) return false;
      if (dateTo && event.date > dateTo) return false;
      return true;
    });
  }, [events, searchQuery, statusFilter, dateFrom, dateTo]);

  // Accordion grouping
  const ongoingEvents = filteredEvents.filter(e => e.status === "in-progress");
  const upcomingEvents = filteredEvents.filter(e => e.status !== "deleted");
  const deletedEvents = filteredEvents.filter(e => e.status === "deleted");

  // Pagination for upcoming (largest group)
  const totalPages = Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE);
  const paginatedUpcoming = upcomingEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const renderEventRow = (event: Event) => (
    <div
      key={event.id}
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
      onClick={() => navigate(`/admin/events/${event.id}`)}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{event.name}</h3>
        <p className="text-sm text-muted-foreground">
          {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          {event.time && ` at ${event.time}`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">📍 {event.venue}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(event.status)}>
          {event.status.replace("-", " ")}
        </Badge>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(event); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} />
          </PaginationItem>
          {pages.map(page => {
            if (totalPages > 7 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>;
              }
              return null;
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink href="#" isActive={page === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">EventFlow Admin</h1>
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{events.filter(e => e.status !== "deleted").length}</CardTitle>
              <CardDescription>Active Events</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{events.filter(e => e.status === "completed").length}</CardTitle>
              <CardDescription>Completed Events</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <CreateEventDialog />
          <ManageManagersDialog />
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event name..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" placeholder="From date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} />
              <div className="flex gap-2">
                <Input type="date" placeholder="To date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="flex-1" />
                <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
                  ✕
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accordion Sections */}
        <Accordion type="multiple" defaultValue={["ongoing", "upcoming"]} className="space-y-4">
          {/* Ongoing Events */}
          <AccordionItem value="ongoing" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Ongoing Events</span>
                <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">{ongoingEvents.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {ongoingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No ongoing events found.</p>
              ) : (
                <div className="space-y-3 pb-2">{ongoingEvents.map(renderEventRow)}</div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Upcoming Events */}
          <AccordionItem value="upcoming" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Upcoming Events</span>
                <Badge variant="secondary">{upcomingEvents.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {paginatedUpcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No upcoming events found.</p>
              ) : (
                <>
                  <div className="space-y-3 pb-2">{paginatedUpcoming.map(renderEventRow)}</div>
                  {renderPagination()}
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Deleted Events */}
          <AccordionItem value="deleted" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Deleted Events</span>
                <Badge className="bg-destructive/10 text-destructive">{deletedEvents.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {deletedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No deleted events.</p>
              ) : (
                <div className="space-y-3 pb-2">{deletedEvents.map(renderEventRow)}</div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <EditEventDialog event={selectedEvent} open={editDialogOpen} onOpenChange={setEditDialogOpen} onEventUpdated={handleEventUpdated} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
