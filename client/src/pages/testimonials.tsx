import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, User, MapPin, Clock, MessageSquare, Heart } from "lucide-react";
import { Link } from "wouter";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function Testimonials() {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    communityName: '',
    rating: 5,
    title: '',
    testimonial: '',
    allowContact: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically submit to your backend
    console.log('Testimonial submitted:', formData);
    alert('Thank you for your testimonial! It will be reviewed and published shortly.');
    setShowSubmissionForm(false);
    setFormData({
      name: '',
      email: '',
      location: '',
      communityName: '',
      rating: 5,
      title: '',
      testimonial: '',
      allowContact: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <NavigationHeader 
        title="Success Stories" 
        subtitle="Real families sharing their MySeniorValet experience"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Call to Action */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span>Share Your Story</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Have you used MySeniorValet to find a senior living community? We'd love to hear about your experience! Your story could help other families navigating this important decision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setShowSubmissionForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Share Your Experience
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">
                  Use Tour Tracker for Review
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        {showSubmissionForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Share Your MySeniorValet Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="First Name or Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Community Name (if applicable)</label>
                    <Input
                      value={formData.communityName}
                      onChange={(e) => setFormData({...formData, communityName: e.target.value})}
                      placeholder="Community you found or visited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Your Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className={`p-1 ${star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Brief headline for your experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Your Experience</label>
                  <Textarea
                    value={formData.testimonial}
                    onChange={(e) => setFormData({...formData, testimonial: e.target.value})}
                    required
                    rows={4}
                    placeholder="Tell us about your experience using MySeniorValet..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowContact"
                    checked={formData.allowContact}
                    onChange={(e) => setFormData({...formData, allowContact: e.target.checked})}
                  />
                  <label htmlFor="allowContact" className="text-sm">
                    I'm willing to be contacted by other families with questions about my experience
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Submit Testimonial
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowSubmissionForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Coming Soon - Testimonials */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <span>Community Reviews Coming Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We're building a comprehensive review system that will allow families to share detailed experiences about specific communities. This will include:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <Badge variant="secondary">📊</Badge>
                <span>Tour tracker integration - share your visit experience</span>
              </li>
              <li className="flex items-center space-x-2">
                <Badge variant="secondary">⭐</Badge>
                <span>Detailed ratings for amenities, staff, food, and activities</span>
              </li>
              <li className="flex items-center space-x-2">
                <Badge variant="secondary">📝</Badge>
                <span>Written reviews with photos from your visits</span>
              </li>
              <li className="flex items-center space-x-2">
                <Badge variant="secondary">✅</Badge>
                <span>Admin approval process to ensure authentic reviews</span>
              </li>
              <li className="flex items-center space-x-2">
                <Badge variant="secondary">🤝</Badge>
                <span>Community-specific review pages</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Sample Testimonial Structure */}
        <Card className="mb-8 opacity-60">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Your testimonial will appear here</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Your Location</span>
                  <Clock className="w-4 h-4" />
                  <span>Review Date</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-blue-200 mb-2" />
            <p className="text-gray-700 italic">
              "Your experience story will appear here after admin approval. We're excited to share authentic family experiences with other users searching for senior living options."
            </p>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Ready to start your senior living search?
          </p>
          <Link href="/map-search">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Explore Communities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}