import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import FitnessProfileForm, { type FitnessProfileData } from '@/components/profile/FitnessProfileForm';
import { getUserFitnessProfile, createFitnessProfile, updateFitnessProfile, getOrCreateThreadId } from '@/lib/profile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Info, FileImage, Loader2, Brain, ScanLine, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { uploadBodyImage, getUserBodyImages, deleteBodyImage } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { analyzeBodyComposition } from '@/lib/api';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BodyImage {
  id: string;
  url?: string; // signed URL for display, optional in case it fails
  storagePath: string; // relative path in bucket for deletion
  date: Date;
  type: 'front' | 'side' | 'back';
}

const FitnessProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<FitnessProfileData | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Image upload related states
  const [images, setImages] = useState<BodyImage[]>([]);
  const [activeTab, setActiveTab] = useState<'front' | 'side' | 'back'>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // New state for body composition section
  const [isBodySectionOpen, setIsBodySectionOpen] = useState(false);

  // Add a new state for the analysis section
  const [isAnalysisSectionOpen, setIsAnalysisSectionOpen] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);

      try {
        // Fetch profile
        const profile = await getUserFitnessProfile(user.id);
        setHasProfile(!!profile);
        if (profile) {
          const { id, user_id, thread_id, created_at, updated_at, ...profileData } = profile;
          setProfileData(profileData);
          setThreadId(thread_id);
          setProfileId(id);
          // Fetch body images from backend
          const imgs = await getUserBodyImages(user.id, id);
          // For each image, generate a signed URL for display and store storagePath
          const imagesWithUrls = await Promise.all(
            imgs.map(async (img) => {
              let path = img.url;
              if (path.startsWith('https://')) {
                const url = new URL(path);
                path = url.pathname.split('/body-images/')[1];
              }
              if (path.startsWith('body-images/')) {
                path = path.replace('body-images/', '');
              }
              const { data: signedUrlData } = await supabase
                .storage
                .from('body-images')
                .createSignedUrl(path, 60 * 60); // 1 hour expiry
              return {
                id: img.id,
                url: signedUrlData?.signedUrl,
                storagePath: path,
                date: new Date(img.uploaded_at),
                type: img.type
              };
            })
          );
          setImages(imagesWithUrls);
        } else {
          // If no profile exists, ensure we have a thread_id
          const newThreadId = await getOrCreateThreadId(user.id);
          setThreadId(newThreadId);
          setProfileId(null);
          setImages([]);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load your fitness profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleProfileSubmit = async (data: FitnessProfileData) => {
    if (!user) return;

    try {
      if (hasProfile) {
        // Update existing profile
        await updateFitnessProfile(user.id, data);
      } else {
        // Create new profile
        await createFitnessProfile(user.id, data);
      }
      
      setHasProfile(true);
      setProfileData(data);
      toast({
        title: "Success",
        description: "Your fitness profile has been saved.",
        variant: "success",
      });

      // If we have all types of images, we can optionally analyze the body composition
      const hasAllTypes = images.some(img => img.type === 'front') && 
                         images.some(img => img.type === 'side') && 
                         images.some(img => img.type === 'back');
      
      if (hasAllTypes && profileId && !analysisResult) {
        // Maybe add a small delay to not overwhelm the user with too many things at once
        setTimeout(() => {
          toast({
            title: "Body Analysis",
            description: "Your body photos are ready for analysis. Generate a fitness overview to include body analysis.",
            variant: "success",
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your fitness profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Image handling functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    // File type validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !profileId) {
      toast({
        title: "Profile not loaded",
        description: "Please wait for your profile to load before uploading.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dbImage = await uploadBodyImage(user.id, profileId, file, activeTab);
      let path = dbImage.url;
      if (path.startsWith('https://')) {
        const url = new URL(path);
        path = url.pathname.split('/body-images/')[1];
      }
      if (path.startsWith('body-images/')) {
        path = path.replace('body-images/', '');
      }
      const { data: signedUrlData } = await supabase
        .storage
        .from('body-images')
        .createSignedUrl(path, 60 * 60); // 1 hour expiry
      setImages(prev => {
        const filtered = prev.filter(img => img.type !== activeTab);
        return [
          ...filtered,
          {
            id: dbImage.id,
            url: signedUrlData?.signedUrl,
            storagePath: path,
            date: new Date(dbImage.uploaded_at),
            type: dbImage.type
          }
        ];
      });
      toast({
        title: "Success",
        description: `${activeTab} view image uploaded successfully.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = async (id: string, storagePath: string) => {
    try {
      await deleteBodyImage(id, storagePath);
      setImages(prev => prev.filter(img => img.id !== id));
      toast({
        title: "Deleted",
        description: "Image deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Analyze body images function - refactored to be called by other functions
  const analyzeBodyImages = async () => {
    if (!user || !profileId || !profileData) {
      toast({
        title: "Missing Data",
        description: "Please ensure your profile is loaded and saved before analyzing.",
        variant: "destructive",
      });
      return null;
    }

    // Check if at least one image of each type exists
    const hasFront = images.some(img => img.type === 'front');
    const hasSide = images.some(img => img.type === 'side');
    const hasBack = images.some(img => img.type === 'back');

    if (!hasFront || !hasSide || !hasBack) {
      toast({
        title: "Missing Images",
        description: "Please ensure at least one front, side, and back image is uploaded for analysis.",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Collect all storage paths, grouped by type
    const frontImagePaths = images.filter(img => img.type === 'front').map(img => img.storagePath);
    const sideImagePaths = images.filter(img => img.type === 'side').map(img => img.storagePath);
    const backImagePaths = images.filter(img => img.type === 'back').map(img => img.storagePath);

    try {
      const result = await analyzeBodyComposition({
        userId: user.id,
        profileId: profileId,
        profileData: profileData,
        imagePaths: {
          front: frontImagePaths,
          side: sideImagePaths,
          back: backImagePaths,
        },
      });
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Your body composition analysis is ready.",
      });
      return result;
    } catch (error: any) {
      console.error('Error analyzing body composition:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during analysis. Please try again.",
        variant: "destructive",
      });
      setAnalysisResult("Error: Could not generate analysis.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Current image for the active tab
  const currentImage = images.find(img => img.type === activeTab);

  // Set page title
  useEffect(() => {
    document.title = "Fitness Profile";
    return () => {
      document.title = "One Page Fitness Pal"; // Reset title on unmount
    };
  }, []);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="fitness-container py-6">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </div>
    );
  }

  const hasAllImageTypes = 
    images.some(img => img.type === 'front') &&
    images.some(img => img.type === 'side') &&
    images.some(img => img.type === 'back');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-fitness-charcoal mb-3">Your Fitness Profile</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your profile information is stored in our AI's global memory and used across the app to provide personalized 
            recommendations. When you request workouts or nutrition advice, we'll consider these details automatically.
          </p>
        </div>
        
        {/* Info badge about profile usage in workout generation */}
        <div className="mb-6 flex items-center p-3 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100 max-w-2xl mx-auto">
          <Info className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          <span><strong>TIP:</strong> When you create workouts, we will always use your profile overview and our findings.</span>
        </div>
        
        {/* Body Image Upload Section */}
        <div className="mb-8">
          <Card className="overflow-hidden border-0 shadow-md">
            <Collapsible open={isBodySectionOpen} onOpenChange={setIsBodySectionOpen}>
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 to-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-fitness-charcoal flex items-center gap-2">
                      <ScanLine className="h-5 w-5 text-fitness-purple" />
                      Body Composition Tracking
                    </CardTitle>
                    <CardDescription>
                      Upload images to track your progress and get AI-powered body composition insights
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Upload front, side, and back images to get better analysis. Images are securely stored and only used for your personal fitness tracking.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 transition-all hover:bg-black/5"
                      >
                        {isBodySectionOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'front' | 'side' | 'back')}>
                    <TabsList className="grid grid-cols-3 mb-8">
                      <TabsTrigger value="front">Front View</TabsTrigger>
                      <TabsTrigger value="side">Side View</TabsTrigger>
                      <TabsTrigger value="back">Back View</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="front" className="mt-0">
                      <ImageUploadArea 
                        image={currentImage}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                        onRemove={(id) => {
                          const img = images.find(i => i.id === id);
                          if (img) removeImage(img.id, img.storagePath);
                        }}
                        isDragging={isDragging}
                        title="Front View"
                      />
                    </TabsContent>
                    
                    <TabsContent value="side" className="mt-0">
                      <ImageUploadArea 
                        image={currentImage}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                        onRemove={(id) => {
                          const img = images.find(i => i.id === id);
                          if (img) removeImage(img.id, img.storagePath);
                        }}
                        isDragging={isDragging}
                        title="Side View"
                      />
                    </TabsContent>
                    
                    <TabsContent value="back" className="mt-0">
                      <ImageUploadArea 
                        image={currentImage}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                        onRemove={(id) => {
                          const img = images.find(i => i.id === id);
                          if (img) removeImage(img.id, img.storagePath);
                        }}
                        isDragging={isDragging}
                        title="Back View"
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {/* Info text to connect body photos with profile generation */}
                  {hasAllImageTypes ? (
                    <div className="mt-6 flex items-center p-3 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100">
                      <Info className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                      <p>
                        Body photos will be automatically analyzed when you generate your fitness profile overview.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center p-3 bg-amber-50 rounded-md text-sm text-amber-700 border border-amber-100">
                      <Info className="h-4 w-4 mr-2 flex-shrink-0 text-amber-500" />
                      <p>
                        <strong>Please upload all three views (front, side, and back).</strong> Complete uploads are 
                        required for body composition analysis to be included in your fitness profile overview.
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Analysis Result Section */}
        {analysisResult && (
          <div className="mb-8">
            <Card className="overflow-hidden border-0 shadow-md">
              <Collapsible open={isAnalysisSectionOpen} onOpenChange={setIsAnalysisSectionOpen}>
                <CardHeader className="bg-gradient-to-r from-blue-100 to-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg text-fitness-charcoal flex items-center gap-2">
                        <ScanLine className="h-5 w-5 text-blue-600" />
                        Body Composition Analysis
                      </CardTitle>
                      <CardDescription className="text-sm">
                        AI-powered assessment based on your uploaded photos and profile information
                      </CardDescription>
                    </div>
                    
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 transition-all hover:bg-black/5"
                      >
                        {isAnalysisSectionOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                
                <CollapsibleContent>
                  <CardContent className="p-6">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin text-fitness-purple mb-4" />
                        <p className="text-muted-foreground">Analyzing your images and profile data...</p>
                        <p className="text-xs text-muted-foreground mt-2">This might take a minute</p>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <Markdown remarkPlugins={[remarkGfm]}>{analysisResult}</Markdown>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        )}
        
        {/* Fitness Profile Form */}
        <FitnessProfileForm 
          onSubmit={handleProfileSubmit} 
          initiallyExpanded={true}
          initialData={profileData || undefined}
          className="shadow-md border-0"
          imagePaths={
            images.length > 0 
              ? {
                  front: images.filter(img => img.type === 'front').map(img => img.storagePath),
                  side: images.filter(img => img.type === 'side').map(img => img.storagePath),
                  back: images.filter(img => img.type === 'back').map(img => img.storagePath),
                }
              : undefined
          }
        />
      </main>
    </div>
  );
};

// Helper component for the image upload area
interface ImageUploadAreaProps {
  image?: BodyImage;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onRemove: (id: string) => void;
  isDragging: boolean;
  title: string;
}

const ImageUploadArea = ({ 
  image, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onClick,
  onRemove,
  isDragging,
  title
}: ImageUploadAreaProps) => {
  if (image?.url) {
    return (
      <div className="relative h-80 w-full">
        <img 
          src={image.url} 
          alt={`${title} body image`}
          className="w-full h-full object-contain rounded-lg bg-gray-100"
          onError={(e) => {
            e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute top-0 right-0 p-2 flex gap-2">
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full w-8 h-8 opacity-90 hover:opacity-100 transition-opacity"
            onClick={() => onRemove(image.id)}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full w-8 h-8 opacity-90 hover:opacity-100 transition-opacity"
            onClick={onClick}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-3 text-white rounded-b-lg">
          <p className="text-sm font-medium">Uploaded on {image.date.toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-80 transition-colors cursor-pointer",
        isDragging 
          ? "border-fitness-purple bg-fitness-purple/5" 
          : "border-gray-200 hover:border-fitness-purple/50 hover:bg-gray-50"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3 text-center p-8">
        <div className="p-3 rounded-full bg-fitness-purple/10 text-fitness-purple">
          <Camera className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-medium text-fitness-charcoal mb-1">Upload {title}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Drag and drop or click to upload a clear, well-lit {title.toLowerCase()} image
          </p>
        </div>
        <Button variant="outline" className="mt-2 bg-white">
          <FileImage className="h-4 w-4 mr-2" />
          Select Image
        </Button>
      </div>
    </div>
  );
};

export default FitnessProfile; 