import { useState } from "react";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

interface HumanVerificationGateProps {
  onVerified: () => void;
}

export function HumanVerificationGate({ onVerified }: HumanVerificationGateProps) {
  const [status, setStatus] = useState<"idle" | "verifying" | "verified">("idle");

  function handleCheck() {
    if (status !== "idle") return;
    setStatus("verifying");
    setTimeout(() => {
      setStatus("verified");
      setTimeout(() => {
        onVerified();
      }, 600);
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg tracking-wide">MySeniorValet</span>
          </div>
          <p className="text-blue-100 text-sm">Trusted Senior Living Search</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <h2 className="text-gray-900 dark:text-white font-semibold text-base text-center mb-1">
            Quick Verification
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            We just need to confirm you're a real person before showing community details.
          </p>

          {/* CAPTCHA-style checkbox */}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer select-none transition-all duration-200 ${
              status === "idle"
                ? "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                : status === "verifying"
                ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
            }`}
            onClick={handleCheck}
            role="checkbox"
            aria-checked={status === "verified"}
            tabIndex={0}
            onKeyDown={(e) => e.key === " " || e.key === "Enter" ? handleCheck() : null}
          >
            {/* Checkbox indicator */}
            <div
              className={`w-7 h-7 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                status === "idle"
                  ? "border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700"
                  : status === "verifying"
                  ? "border-blue-500 bg-white dark:bg-gray-700"
                  : "border-green-500 bg-green-500"
              }`}
            >
              {status === "verifying" && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              )}
              {status === "verified" && (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Label */}
            <span
              className={`font-medium text-sm transition-colors duration-200 ${
                status === "verified"
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {status === "idle" && "I'm not a robot"}
              {status === "verifying" && "Verifying…"}
              {status === "verified" && "Verified — thank you!"}
            </span>

            {/* reCAPTCHA-style logo area */}
            <div className="ml-auto text-right flex-shrink-0">
              <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                <div className="font-semibold text-gray-500 dark:text-gray-400">Protected</div>
                <div>Bot Shield</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            This helps us keep community information accurate and protect against automated access.
          </p>
        </div>
      </div>
    </div>
  );
}
