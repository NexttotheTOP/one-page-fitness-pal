import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

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
        title: "Success",
        description: "Workout details updated successfully",
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

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Edit Workout Details</h2>
        <p className="text-sm text-muted-foreground">
          Update your workout name and description
        </p>
        <Separator className="bg-purple-200 dark:bg-purple-900/50" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">
            Workout Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workout name"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter workout description"
            className="h-32 w-full resize-none"
          />
        </div>

        <div className="flex justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 min-w-[100px]"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
} 