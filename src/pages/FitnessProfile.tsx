import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import FitnessProfileForm, { type FitnessProfileData } from '@/components/profile/FitnessProfileForm';
import { getUserFitnessProfile, createFitnessProfile, updateFitnessProfile, getOrCreateThreadId } from '@/lib/profile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Info, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BodyImage {
  id: string;
  url: string;
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
  
  // Image upload related states
  const [images, setImages] = useState<BodyImage[]>([]);
  const [activeTab, setActiveTab] = useState<'front' | 'side' | 'back'>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        } else {
          // If no profile exists, ensure we have a thread_id
          const newThreadId = await getOrCreateThreadId(user.id);
          setThreadId(newThreadId);
        }
        
        // TODO: Fetch body images from backend
        // For now, we'll just use placeholder data
        setImages([
          // Example image - in real implementation these would come from the backend
          // {
          //   id: 'img1',
          //   url: 'https://via.placeholder.com/300x400',
          //   date: new Date(),
          //   type: 'front'
          // }
        ]);
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
      });
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

  const handleImageUpload = (file: File) => {
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

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file);
    
    // Add image to state
    const newImage: BodyImage = {
      id: `img-${Date.now()}`,
      url: imageUrl,
      date: new Date(),
      type: activeTab
    };
    
    // Replace existing image of same type if exists
    setImages(prev => {
      const filtered = prev.filter(img => img.type !== activeTab);
      return [...filtered, newImage];
    });

    // TODO: Upload image to backend
    toast({
      title: "Success",
      description: `${activeTab} view image uploaded successfully.`,
    });
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

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    // TODO: Remove image from backend
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-6">
        <h2 className="text-2xl font-bold text-fitness-charcoal mb-6">Your Fitness Profile</h2>
        
        {/* Body Image Upload Section */}
        <div className="mb-8">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 to-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg text-fitness-charcoal">Body Composition Tracking</CardTitle>
                  <CardDescription>
                    Upload images to track your progress and get AI-powered body composition insights
                  </CardDescription>
                </div>
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
              </div>
            </CardHeader>
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
                    onRemove={removeImage}
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
                    onRemove={removeImage}
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
                    onRemove={removeImage}
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
            </CardContent>
          </Card>
        </div>
        
        {/* Fitness Profile Form */}
        <FitnessProfileForm 
          onSubmit={handleProfileSubmit} 
          initiallyExpanded={true}
          initialData={profileData || undefined}
          threadId={threadId || undefined}
          className="shadow-md border-0"
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
  if (image) {
    return (
      <div className="relative h-80 w-full">
        <img 
          src={image.url} 
          alt={`${title} body image`}
          className="w-full h-full object-contain rounded-lg"
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