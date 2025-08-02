import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload, Camera, DollarSign, Calendar, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { NavigationHeader } from '@/components/NavigationHeader';
import { LoadingMascot } from '@/components/mascot';
import type { Community } from '@shared/schema';

export default function CommunityContribute() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    contributorName: '',
    contributorEmail: '',
    relationshipToCommunity: '',
    priceInfo: '',
    priceSource: '',
    availabilityInfo: '',
    incentivesInfo: '',
    additionalNotes: '',
    photos: [] as File[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: community, isLoading } = useQuery<Community>({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id && id !== '-1' && !isNaN(Number(id)),
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 5) // Limit to 5 photos
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contributorEmail || !formData.relationshipToCommunity) {
      toast({
        title: "Missing Information",
        description: "Please provide your email and relationship to the community.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('communityId', id || '');
      submitData.append('communityName', community?.name || '');
      submitData.append('contributorName', formData.contributorName);
      submitData.append('contributorEmail', formData.contributorEmail);
      submitData.append('relationshipToCommunity', formData.relationshipToCommunity);
      submitData.append('priceInfo', formData.priceInfo);
      submitData.append('priceSource', formData.priceSource);
      submitData.append('availabilityInfo', formData.availabilityInfo);
      submitData.append('incentivesInfo', formData.incentivesInfo);
      submitData.append('additionalNotes', formData.additionalNotes);
      
      // Append photos
      formData.photos.forEach((photo, index) => {
        submitData.append(`photo${index}`, photo);
      });

      const response = await fetch('/api/community/contribute', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        toast({
          title: "Thank You!",
          description: "Your contribution has been submitted and will be reviewed shortly.",
        });
        
        // Redirect back to community page after 2 seconds
        setTimeout(() => {
          setLocation(`/community/${id}`);
        }, 2000);
      } else {
        throw new Error('Failed to submit contribution');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your contribution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingMascot 
        message="Loading community details..." 
        variant="loading"
        size="lg"
      />
    </div>
  );

  if (!community) return <div>Community not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation(`/community/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {community.name}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Help Improve This Listing
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Share what you know about {community.name} to help families make informed decisions
          </p>
          <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
            <Info className="w-3 h-3 mr-1" />
            All contributions are reviewed for accuracy before publishing
          </Badge>
        </div>

        {/* Contribution Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contributor Information */}
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contributorName">Your Name (Optional)</Label>
                  <Input
                    id="contributorName"
                    value={formData.contributorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contributorName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="contributorEmail">Your Email *</Label>
                  <Input
                    id="contributorEmail"
                    type="email"
                    required
                    value={formData.contributorEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contributorEmail: e.target.value }))}
                    placeholder="john@example.com"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We'll only use this to verify your contribution
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="relationship">Your Relationship to This Community *</Label>
                <Select 
                  value={formData.relationshipToCommunity}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipToCommunity: value }))}
                  required
                >
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select your relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toured">I toured this community</SelectItem>
                    <SelectItem value="family">My family member lives/lived here</SelectItem>
                    <SelectItem value="employee">I work/worked here</SelectItem>
                    <SelectItem value="neighbor">I live nearby</SelectItem>
                    <SelectItem value="professional">I'm a healthcare professional familiar with it</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Information to Share */}
          <Card>
            <CardHeader>
              <CardTitle>Information You Can Share</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share any information you have - every detail helps families
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing Information */}
              <div>
                <Label htmlFor="priceInfo" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing Information
                </Label>
                <Textarea
                  id="priceInfo"
                  value={formData.priceInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceInfo: e.target.value }))}
                  placeholder="e.g., Starting at $3,500/month for assisted living, Memory care is $4,800/month"
                  rows={3}
                />
                {formData.priceInfo && (
                  <div className="mt-2">
                    <Label htmlFor="priceSource">How did you learn about this pricing?</Label>
                    <Input
                      id="priceSource"
                      value={formData.priceSource}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceSource: e.target.value }))}
                      placeholder="e.g., During my tour in March 2024"
                    />
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <Label htmlFor="availability" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Current Availability
                </Label>
                <Textarea
                  id="availability"
                  value={formData.availabilityInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, availabilityInfo: e.target.value }))}
                  placeholder="e.g., They have 2 memory care units available, waitlist for assisted living"
                  rows={2}
                />
              </div>

              {/* Move-in Incentives */}
              <div>
                <Label htmlFor="incentives">Move-in Incentives or Discounts</Label>
                <Textarea
                  id="incentives"
                  value={formData.incentivesInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, incentivesInfo: e.target.value }))}
                  placeholder="e.g., First month free, No community fee for veterans"
                  rows={2}
                />
              </div>

              {/* Photos */}
              <div>
                <Label htmlFor="photos" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photos (Max 5)
                </Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="mb-2"
                />
                {formData.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.photos.map((photo, index) => (
                      <Badge key={index} variant="secondary">
                        {photo.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please only upload photos you took yourself or have permission to share
                </p>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Information</Label>
                <Textarea
                  id="notes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any other details that might help families (staff quality, activities, food, etc.)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submission Guidelines */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Contribution Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Share only accurate, firsthand information</li>
                <li>• Be specific with dates and details when possible</li>
                <li>• Respect resident privacy - don't share personal information</li>
                <li>• Your contribution helps families make informed decisions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/community/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Contribution
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}