import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface EditWorkoutDetailsFormProps {
  workoutId: string;
  initialName: string;
  initialDescription: string;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function EditWorkoutDetailsForm({
  workoutId,
  initialName,
  initialDescription,
  onSave,
  onCancel,
}: EditWorkoutDetailsFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("workout_plans")
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workoutId);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Workout details updated successfully!",
        variant: "success",
      });

      onSave(name, description);
    } catch (error) {
      console.error("Error updating workout details:", error);
      toast({
        title: "Error",
        description: "Failed to update workout details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    toast({
      title: "Canceled",
      description: "No changes were made to the workout.",
      variant: "success",
    });
    onCancel();
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-fitness-purple" />
          <h2 className="text-xl font-bold text-fitness-charcoal">Edit Workout Details</h2>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Update your workout name and description to better reflect your training goals
        </p>
        
        <Separator className="bg-gradient-to-r from-fitness-purple/30 to-transparent h-px" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-fitness-charcoal flex items-center gap-1.5">
            Workout Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workout name"
            required
            className="w-full transition-all focus-visible:ring-fitness-purple/20 focus-visible:border-fitness-purple/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-fitness-charcoal flex items-center gap-1.5">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your workout (goals, intensity, etc.)"
            className="h-32 w-full resize-none transition-all focus-visible:ring-fitness-purple/20 focus-visible:border-fitness-purple/80"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-fitness-purple hover:bg-fitness-purple/90 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 