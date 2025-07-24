import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to MySeniorValet
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your trusted platform for senior living community discovery and family collaboration.
          </p>
          <Button 
            onClick={handleLogin}
            className="w-full py-3 text-lg"
            size="lg"
          >
            Sign In with Replit
          </Button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}