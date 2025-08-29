import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import errorThinkerImage from '@assets/generated_images/Simple_dark_orange_Thinker_f91fea90.png';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full relative">
      {/* Background Image */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={errorThinkerImage}
          alt="The Thinker contemplating in cosmic space"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="h-16 w-16 text-orange-500" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Page Not Found</h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Like The Thinker pondering life's mysteries, we're contemplating where this page went...
            </p>
            
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
