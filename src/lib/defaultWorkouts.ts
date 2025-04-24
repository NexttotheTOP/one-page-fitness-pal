export const defaultWorkouts = [
  {
    name: "Push Day",
    description: "Focus on all pushing movements for chest, shoulders, and triceps",
    exercises: [
      {
        name: "Bench Press",
        sets: 4,
        reps: 8,
        notes: "Keep elbows at 45 degrees",
        order: 1,
        category: "strength",
        description: "A compound exercise targeting chest muscles. Keep elbows at 45 degrees.",
        muscle_groups: ["Chest", "Triceps", "Front Deltoids"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell and Bench"
      },
      {
        name: "Overhead Press",
        sets: 3,
        reps: 10,
        notes: "Keep core tight",
        order: 2,
        category: "strength",
        description: "A shoulder press movement. Keep core tight throughout the movement.",
        muscle_groups: ["Shoulders", "Triceps"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell"
      },
      {
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: 12,
        notes: "Control the descent",
        order: 3,
        category: "strength",
        description: "An upper chest focused pressing movement. Control the descent.",
        muscle_groups: ["Upper Chest", "Front Deltoids", "Triceps"],
        difficulty_level: "intermediate",
        equipment_needed: "Dumbbells and Incline Bench"
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: 15,
        notes: "Keep slight bend in elbows",
        order: 4,
        category: "strength",
        description: "An isolation exercise for shoulder width. Keep slight bend in elbows.",
        muscle_groups: ["Side Deltoids"],
        difficulty_level: "beginner",
        equipment_needed: "Dumbbells"
      },
      {
        name: "Tricep Pushdowns",
        sets: 3,
        reps: 12,
        notes: "Keep elbows close to body",
        order: 5,
        category: "strength",
        description: "An isolation exercise for triceps. Keep elbows close to body.",
        muscle_groups: ["Triceps"],
        difficulty_level: "beginner",
        equipment_needed: "Cable Machine"
      }
    ]
  },
  {
    name: "Pull Day",
    description: "Focus on all pulling movements for back and biceps",
    exercises: [
      {
        name: "Barbell Rows",
        sets: 4,
        reps: 8,
        notes: "Keep back straight, pull to lower chest",
        order: 1,
        category: "strength",
        description: "A compound back exercise. Keep back straight and pull to lower chest.",
        muscle_groups: ["Back", "Biceps", "Rear Deltoids"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell"
      },
      {
        name: "Pull-ups",
        sets: 3,
        reps: 8,
        notes: "Full range of motion",
        order: 2,
        category: "strength",
        description: "A bodyweight back exercise. Focus on full range of motion.",
        muscle_groups: ["Back", "Biceps", "Forearms"],
        difficulty_level: "advanced",
        equipment_needed: "Pull-up Bar"
      },
      {
        name: "Face Pulls",
        sets: 3,
        reps: 15,
        notes: "Focus on rear deltoids",
        order: 3,
        category: "strength",
        description: "A rear deltoid and upper back exercise. Focus on rear deltoids.",
        muscle_groups: ["Rear Deltoids", "Upper Back"],
        difficulty_level: "beginner",
        equipment_needed: "Cable Machine"
      },
      {
        name: "Barbell Curls",
        sets: 3,
        reps: 12,
        notes: "Keep elbows stationary",
        order: 4,
        category: "strength",
        description: "A bicep isolation exercise. Keep elbows stationary.",
        muscle_groups: ["Biceps"],
        difficulty_level: "beginner",
        equipment_needed: "Barbell"
      },
      {
        name: "Hammer Curls",
        sets: 3,
        reps: 12,
        notes: "Work both biceps and forearms",
        order: 5,
        category: "strength",
        description: "A bicep and forearm exercise. Works both biceps and forearms.",
        muscle_groups: ["Biceps", "Forearms"],
        difficulty_level: "beginner",
        equipment_needed: "Dumbbells"
      }
    ]
  },
  {
    name: "Legs Day",
    description: "Complete lower body strength workout focusing on major muscle groups",
    exercises: [
      {
        name: "Squats",
        sets: 4,
        reps: 8,
        notes: "Keep chest up, break parallel",
        order: 1,
        category: "strength",
        description: "A compound lower body exercise. Keep chest up and break parallel.",
        muscle_groups: ["Quadriceps", "Glutes", "Hamstrings"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell and Squat Rack"
      },
      {
        name: "Romanian Deadlifts",
        sets: 4,
        reps: 10,
        notes: "Feel the hamstring stretch",
        order: 2,
        category: "strength",
        description: "A hip-hinge movement. Feel the hamstring stretch.",
        muscle_groups: ["Hamstrings", "Lower Back", "Glutes"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell"
      },
      {
        name: "Bulgarian Split Squats",
        sets: 3,
        reps: 12,
        notes: "Keep front knee aligned",
        order: 3,
        category: "strength",
        description: "A unilateral leg exercise. Keep front knee aligned.",
        muscle_groups: ["Quadriceps", "Glutes", "Hamstrings"],
        difficulty_level: "intermediate",
        equipment_needed: "Dumbbells and Bench"
      },
      {
        name: "Leg Press",
        sets: 3,
        reps: 12,
        notes: "Don't lock out knees",
        order: 4,
        category: "strength",
        description: "A machine-based leg exercise. Do not lock out knees.",
        muscle_groups: ["Quadriceps", "Glutes", "Hamstrings"],
        difficulty_level: "beginner",
        equipment_needed: "Leg Press Machine"
      },
      {
        name: "Calf Raises",
        sets: 4,
        reps: 15,
        notes: "Full range of motion",
        order: 5,
        category: "strength",
        description: "An isolation exercise for calves. Use full range of motion.",
        muscle_groups: ["Calves"],
        difficulty_level: "beginner",
        equipment_needed: "Step Platform"
      }
    ]
  },
  {
    name: "Upper Body",
    description: "Complete upper body workout combining push and pull movements",
    exercises: [
      {
        name: "Bench Press",
        sets: 4,
        reps: 8,
        notes: "Control the weight throughout",
        order: 1,
        category: "strength",
        description: "A compound chest exercise. Control the weight throughout the movement.",
        muscle_groups: ["Chest", "Triceps", "Front Deltoids"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell and Bench"
      },
      {
        name: "Bent Over Rows",
        sets: 4,
        reps: 8,
        notes: "Squeeze shoulder blades together",
        order: 2,
        category: "strength",
        description: "A compound back exercise. Squeeze shoulder blades together at peak contraction.",
        muscle_groups: ["Back", "Biceps", "Rear Deltoids"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell"
      },
      {
        name: "Overhead Press",
        sets: 3,
        reps: 10,
        notes: "Keep core engaged",
        order: 3,
        category: "strength",
        description: "A compound shoulder exercise. Keep core engaged throughout movement.",
        muscle_groups: ["Shoulders", "Triceps"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell"
      },
      {
        name: "Lat Pulldowns",
        sets: 3,
        reps: 12,
        notes: "Full stretch at top",
        order: 4,
        category: "strength",
        description: "A back exercise targeting lat muscles. Get full stretch at top of movement.",
        muscle_groups: ["Back", "Biceps"],
        difficulty_level: "beginner",
        equipment_needed: "Cable Machine"
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: 15,
        notes: "Control the movement",
        order: 5,
        category: "strength",
        description: "An isolation exercise for shoulder width. Control the movement throughout.",
        muscle_groups: ["Side Deltoids"],
        difficulty_level: "beginner",
        equipment_needed: "Dumbbells"
      },
      {
        name: "Tricep Pushdowns",
        sets: 3,
        reps: 12,
        notes: "Keep elbows at sides",
        order: 6,
        category: "strength",
        description: "An isolation exercise for triceps. Keep elbows close to body throughout movement.",
        muscle_groups: ["Triceps"],
        difficulty_level: "beginner",
        equipment_needed: "Cable Machine"
      },
      {
        name: "Bicep Curls",
        sets: 3,
        reps: 12,
        notes: "Full range of motion",
        order: 7,
        category: "strength",
        description: "An isolation exercise for biceps. Use full range of motion.",
        muscle_groups: ["Biceps"],
        difficulty_level: "beginner",
        equipment_needed: "Dumbbells"
      }
    ]
  },
  {
    name: "Lower Body",
    description: "Complete lower body workout focusing on strength and hypertrophy",
    exercises: [
      {
        name: "Back Squats",
        sets: 4,
        reps: 8,
        notes: "Drive through heels",
        order: 1,
        category: "strength",
        description: "A compound lower body exercise. Drive through heels and maintain proper form.",
        muscle_groups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell and Squat Rack"
      },
      {
        name: "Deadlifts",
        sets: 4,
        reps: 8,
        notes: "Keep bar close to body",
        order: 2,
        category: "strength",
        description: "A compound full-body exercise. Keep bar close to body throughout movement.",
        muscle_groups: ["Hamstrings", "Lower Back", "Glutes", "Traps"],
        difficulty_level: "intermediate",
        equipment_needed: "Barbell"
      },
      {
        name: "Walking Lunges",
        sets: 3,
        reps: 12,
        notes: "Step with purpose",
        order: 3,
        category: "strength",
        description: "A unilateral leg exercise. Step with purpose and maintain balance.",
        muscle_groups: ["Quadriceps", "Glutes", "Hamstrings"],
        difficulty_level: "intermediate",
        equipment_needed: "Dumbbells"
      },
      {
        name: "Leg Extensions",
        sets: 3,
        reps: 15,
        notes: "Focus on quad contraction",
        order: 4,
        category: "strength",
        description: "An isolation exercise for quadriceps. Focus on controlled quad contraction.",
        muscle_groups: ["Quadriceps"],
        difficulty_level: "beginner",
        equipment_needed: "Leg Extension Machine"
      },
      {
        name: "Leg Curls",
        sets: 3,
        reps: 15,
        notes: "Control the negative",
        order: 5,
        category: "strength",
        description: "An isolation exercise for hamstrings. Control the negative portion of movement.",
        muscle_groups: ["Hamstrings"],
        difficulty_level: "beginner",
        equipment_needed: "Leg Curl Machine"
      },
      {
        name: "Standing Calf Raises",
        sets: 4,
        reps: 15,
        notes: "Pause at top and bottom",
        order: 6,
        category: "strength",
        description: "An isolation exercise for calves. Pause at top and bottom of movement.",
        muscle_groups: ["Calves"],
        difficulty_level: "beginner",
        equipment_needed: "Smith Machine or Calf Raise Machine"
      }
    ]
  },
  {
    name: "Core Day",
    description: "Comprehensive core workout targeting abs, obliques, and lower back",
    exercises: [
      {
        name: "Planks",
        sets: 3,
        reps: 60,
        notes: "Hold for 60 seconds, maintain straight line",
        order: 1,
        category: "strength",
        description: "A core stabilization exercise. Hold position maintaining straight line.",
        muscle_groups: ["Core", "Shoulders"],
        difficulty_level: "beginner",
        equipment_needed: "None"
      },
      {
        name: "Russian Twists",
        sets: 3,
        reps: 20,
        notes: "Control the rotation",
        order: 2,
        category: "strength",
        description: "A rotational core exercise. Control the rotation.",
        muscle_groups: ["Core", "Obliques"],
        difficulty_level: "beginner",
        equipment_needed: "Weight Plate"
      },
      {
        name: "Dead Bugs",
        sets: 3,
        reps: 12,
        notes: "Keep lower back pressed to ground",
        order: 3,
        category: "strength",
        description: "A core stability exercise. Keep lower back pressed to ground.",
        muscle_groups: ["Core", "Lower Back"],
        difficulty_level: "beginner",
        equipment_needed: "None"
      },
      {
        name: "Cable Woodchoppers",
        sets: 3,
        reps: 15,
        notes: "Rotate from core, not arms",
        order: 4,
        category: "strength",
        description: "A rotational core movement. Rotate from core, not arms.",
        muscle_groups: ["Core", "Obliques"],
        difficulty_level: "intermediate",
        equipment_needed: "Cable Machine"
      },
      {
        name: "Back Extensions",
        sets: 3,
        reps: 12,
        notes: "Focus on lower back engagement",
        order: 5,
        category: "strength",
        description: "A lower back strengthening exercise. Focus on lower back engagement.",
        muscle_groups: ["Lower Back", "Glutes"],
        difficulty_level: "beginner",
        equipment_needed: "Back Extension Bench"
      },
      {
        name: "Hanging Leg Raises",
        sets: 3,
        reps: 12,
        notes: "Control the movement",
        order: 6,
        category: "strength",
        description: "An advanced core exercise. Control the movement.",
        muscle_groups: ["Core", "Hip Flexors"],
        difficulty_level: "advanced",
        equipment_needed: "Pull-up Bar"
      }
    ]
  }
]; 