import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, UpdateProfile } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/profile"],
  });

  const [formData, setFormData] = useState<UpdateProfile>({
    name: "",
    dateOfBirth: "",
    weight: "",
    height: "",
    family: "",
    relationshipStatus: "",
    ambition: "",
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        dateOfBirth: user.dateOfBirth || "",
        weight: user.weight || "",
        height: user.height || "",
        family: user.family || "",
        relationshipStatus: user.relationshipStatus || "",
        ambition: user.ambition || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const relationshipOptions = [
    { value: "single", label: "Single" },
    { value: "relationship", label: "In a Relationship" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-neutral-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-64"></div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-24"></div>
                  <div className="h-10 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800">Profile</h2>
          <p className="text-neutral-600">Manage your personal information</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <Card>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Physical Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                Physical Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="text"
                    placeholder="e.g., 70 kg or 154 lbs"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="text"
                    placeholder="e.g., 170 cm or 5'7&quot;"
                    value={formData.height || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                Personal Information
              </h3>
              
              <div>
                <Label htmlFor="relationshipStatus">Relationship Status</Label>
                <Select 
                  value={formData.relationshipStatus || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship status" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="family">Family</Label>
                <Textarea
                  id="family"
                  rows={3}
                  placeholder="Tell us about your family (e.g., parents, siblings, children, pets...)"
                  value={formData.family || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, family: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="ambition">Goals & Ambitions</Label>
                <Textarea
                  id="ambition"
                  rows={4}
                  placeholder="What are your goals, dreams, and ambitions? What motivates you?"
                  value={formData.ambition || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, ambition: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0 pt-6 border-t border-neutral-200">
              <div className="flex space-x-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  <i className="fas fa-save mr-2"></i>
                  {updateMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    if (user) {
                      setFormData({
                        name: user.name || "",
                        dateOfBirth: user.dateOfBirth || "",
                        weight: user.weight || "",
                        height: user.height || "",
                        family: user.family || "",
                        relationshipStatus: user.relationshipStatus || "",
                        ambition: user.ambition || "",
                      });
                    }
                  }}
                >
                  <i className="fas fa-undo mr-2"></i>Reset
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-600">Username:</span>
              <span className="text-sm text-neutral-800">{user?.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-600">Member since:</span>
              <span className="text-sm text-neutral-800">
                {user ? new Date().toLocaleDateString() : "Unknown"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}