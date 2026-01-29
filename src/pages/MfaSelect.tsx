import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MfaSelect = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("email");

  // Mock user data - in real app, this would come from auth context
  const userEmail = "user@example.com";
  const userPhone = "+1 (***) ***-1234";

  const handleContinue = async () => {
    if (!selectedMethod) {
      toast.error("Please select a verification method");
      return;
    }

    setIsLoading(true);

    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`Verification code sent via ${selectedMethod === "email" ? "email" : "SMS"}`);
    navigate("/mfa/verify", { state: { method: selectedMethod } });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Choose how you'd like to receive your verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedMethod}
            onValueChange={setSelectedMethod}
            className="space-y-3"
          >
            {/* Email Option */}
            <div
              className={`relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedMethod === "email"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod("email")}
            >
              <RadioGroupItem value="email" id="email" className="sr-only" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium cursor-pointer"
                >
                  Email Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send code to {userEmail}
                </p>
              </div>
              {selectedMethod === "email" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
            </div>

            {/* Phone Option */}
            <div
              className={`relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all ${
                selectedMethod === "phone"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod("phone")}
            >
              <RadioGroupItem value="phone" id="phone" className="sr-only" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium cursor-pointer"
                >
                  SMS Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send code to {userPhone}
                </p>
              </div>
              {selectedMethod === "phone" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
            </div>
          </RadioGroup>

          <Button
            onClick={handleContinue}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Sending code..." : "Send Verification Code"}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </div>

          {/* Security Note */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground text-center">
              🔒 For your security, you'll need to verify your identity each time you sign in from a new device.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaSelect;
