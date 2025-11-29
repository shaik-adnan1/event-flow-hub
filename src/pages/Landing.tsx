import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">EventFlow</h1>
          </div>
          <Button onClick={() => navigate("/login")} variant="default">
            Login
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-foreground">
          Streamline Your Event Management
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A comprehensive platform for coordinating events, managing tasks, and collaborating with your team—all in one place.
        </p>
        <Button size="lg" onClick={() => navigate("/login")} className="text-lg px-8">
          Get Started
        </Button>
      </section>

      {/* About Section */}
      <section id="about" className="bg-accent py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">About EventFlow</h3>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6">
              EventFlow is a cloud-based event management platform designed to help organizations coordinate complex events with ease. 
              Our platform brings together admins, event managers, and stakeholders in a unified workspace.
            </p>
            <p className="text-lg text-muted-foreground">
              With role-based access control, real-time task tracking, and seamless communication tools, EventFlow ensures 
              every event runs smoothly from planning to execution.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Our Services</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create, assign, and track events with detailed scheduling and resource allocation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Task Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor task progress with real-time status updates and RAG indicators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Onboard staff, vendors, and workers with role-based permissions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Enterprise-grade security with encrypted data and role-based access control.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-card py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Contact Us</h3>
          <Card>
            <CardContent className="pt-6">
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground"
                    placeholder="Tell us about your event needs..."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 EventFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
