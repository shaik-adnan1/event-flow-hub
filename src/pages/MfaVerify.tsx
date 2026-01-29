import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Shield, Mail, Phone, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const MfaVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Get the method from navigation state, default to email
  const method = location.state?.method || "email";
  const isEmail = method === "email";

  // Mock data
  const destination = isEmail ? "user@example.com" : "+1 (***) ***-1234";

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock verification - in real app, verify against backend
    if (otp === "123456") {
      toast.success("Verification successful!");
      navigate("/admin"); // Redirect to dashboard after successful MFA
    } else {
      toast.error("Invalid verification code. Please try again.");
      setOtp("");
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendCooldown(60);

    // Simulate resending code
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(`New verification code sent via ${isEmail ? "email" : "SMS"}`);
  };

  const handleChangeMethod = () => {
    navigate("/mfa");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              {isEmail ? (
                <Mail className="h-8 w-8 text-primary" />
              ) : (
                <Phone className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{destination}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>

          {/* Resend Code */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendCode}
              disabled={!canResend}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${!canResend ? "" : "animate-none"}`} />
              {canResend ? "Resend Code" : `Resend in ${resendCooldown}s`}
            </Button>
          </div>

          {/* Change Method */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleChangeMethod}
            >
              <ArrowLeft className="h-4 w-4" />
              Use a different verification method
            </Button>
          </div>

          {/* Help Text */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Having trouble?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your {isEmail ? "spam/junk folder" : "SMS inbox"}</li>
              <li>• Make sure your {isEmail ? "email" : "phone number"} is correct</li>
              <li>• Wait a few minutes and try resending</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>

          {/* Security Info */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Code expires in 10 minutes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaVerify;
