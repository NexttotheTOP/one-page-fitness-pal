// Define interfaces for type safety
interface Coordinates {
  x: number;
  y: number;
  z: number;
}

interface CameraView {
  position: Coordinates;
  target: Coordinates;
}

interface MuscleInfo {
  displayName: string;
  group: string;
  description: string;
  relatedExercises: string[];
  antagonists: string[];
  cameraView: CameraView;
}

export const muscleMap: Record<string, MuscleInfo> = {
  // Arms - Biceps
  "Biceps_Brachii": {
    displayName: "Left Biceps",
    group: "arms",
    description: "Primary function is elbow flexion and forearm supination",
    relatedExercises: ["Bicep Curls", "Chin-ups", "Hammer Curls", "Concentration Curls"],
    antagonists: ["Triceps_Medial_Head", "Triceps_Lateral_Long_Heads"],
    cameraView: {
      position: { x: 0, y: 0, z: 7 },  // Left side view, slightly elevated
      target: { x: 0, y: 0, z: 0 }     // Focus on left bicep
    }
  },
  "Biceps_Brachii_R": {
    displayName: "Right Biceps",
    group: "arms",
    description: "Primary function is elbow flexion and forearm supination",
    relatedExercises: ["Bicep Curls", "Chin-ups", "Hammer Curls", "Concentration Curls"],
    antagonists: ["Triceps_Medial_Head_R", "Triceps_Lateral_Long_Heads_R"],
    cameraView: {
      position: { x: 3, y: 1, z: 5 },   // Right side view, slightly elevated
      target: { x: 1, y: 1, z: 0 }      // Focus on right bicep
    }
  },

  // Arms - Triceps
  "Triceps_Medial_Head": {
    displayName: "Left Triceps (Medial)",
    group: "arms",
    description: "Inner head of the triceps, active in all forms of elbow extension",
    relatedExercises: ["Tricep Pushdowns", "Overhead Extensions", "Close-grip Bench Press"],
    antagonists: ["Biceps_Brachii"],
    cameraView: {
      position: { x: -3, y: 1, z: -5 },  // Behind left arm
      target: { x: -1, y: 1, z: 0 }      // Focus on left tricep
    }
  },
  "Triceps_Medial_Head_R": {
    displayName: "Right Triceps (Medial)",
    group: "arms",
    description: "Inner head of the triceps, active in all forms of elbow extension",
    relatedExercises: ["Tricep Pushdowns", "Overhead Extensions", "Close-grip Bench Press"],
    antagonists: ["Biceps_Brachii_R"],
    cameraView: {
      position: { x: 3, y: 1, z: -5 },   // Behind right arm
      target: { x: 1, y: 1, z: 0 }       // Focus on right tricep
    }
  },
  "Triceps_Lateral_Long_Heads": {
    displayName: "Left Triceps (Lateral/Long)",
    group: "arms",
    description: "Outer and long heads of the triceps, important for overhead pressing movements",
    relatedExercises: ["Skull Crushers", "Dips", "Overhead Extensions"],
    antagonists: ["Biceps_Brachii"],
    cameraView: {
      position: { x: -3, y: 1, z: -5 },  // Behind left arm
      target: { x: -1, y: 1, z: 0 }      // Focus on left tricep
    }
  },
  "Triceps_Lateral_Long_Heads_R": {
    displayName: "Right Triceps (Lateral/Long)",
    group: "arms",
    description: "Outer and long heads of the triceps, important for overhead pressing movements",
    relatedExercises: ["Skull Crushers", "Dips", "Overhead Extensions"],
    antagonists: ["Biceps_Brachii_R"],
    cameraView: {
      position: { x: 3, y: 1, z: -5 },   // Behind right arm
      target: { x: 1, y: 1, z: 0 }       // Focus on right tricep
    }
  },

  // Shoulders - Deltoids
  "Deltoid_Anterior": {
    displayName: "Left Front Deltoid",
    group: "shoulders",
    description: "Front shoulder muscle, important for pressing and forward arm raises",
    relatedExercises: ["Overhead Press", "Front Raises", "Bench Press"],
    antagonists: ["Deltoid_Posterior"],
    cameraView: {
      position: { x: -3, y: 2, z: 5 },   // Front-left view, higher up
      target: { x: -1, y: 2, z: 0 }      // Focus on left front delt
    }
  },
  "Deltoid_Anterior_R": {
    displayName: "Right Front Deltoid",
    group: "shoulders",
    description: "Front shoulder muscle, important for pressing and forward arm raises",
    relatedExercises: ["Overhead Press", "Front Raises", "Bench Press"],
    antagonists: ["Deltoid_Posterior_R"],
    cameraView: {
      position: { x: 3, y: 2, z: 5 },    // Front-right view, higher up
      target: { x: 1, y: 2, z: 0 }       // Focus on right front delt
    }
  },
  "Deltoid_Middle": {
    displayName: "Left Middle Deltoid",
    group: "shoulders",
    description: "Middle shoulder muscle, responsible for lateral arm movement",
    relatedExercises: ["Lateral Raises", "Upright Rows", "Arnold Press"],
    antagonists: [],
    cameraView: {
      position: { x: -5, y: 2, z: 0 },   // Direct left side view
      target: { x: -1, y: 2, z: 0 }      // Focus on left middle delt
    }
  },
  "Deltoid_Middle_R": {
    displayName: "Right Middle Deltoid",
    group: "shoulders",
    description: "Middle shoulder muscle, responsible for lateral arm movement",
    relatedExercises: ["Lateral Raises", "Upright Rows", "Arnold Press"],
    antagonists: [],
    cameraView: {
      position: { x: 5, y: 2, z: 0 },    // Direct right side view
      target: { x: 1, y: 2, z: 0 }       // Focus on right middle delt
    }
  },
  "Deltoid_Posterior": {
    displayName: "Left Rear Deltoid",
    group: "shoulders",
    description: "Rear shoulder muscle, important for posture and pulling movements",
    relatedExercises: ["Reverse Flyes", "Face Pulls", "Bent-over Rows"],
    antagonists: ["Deltoid_Anterior"],
    cameraView: {
      position: { x: -3, y: 2, z: -5 },  // Back-left view
      target: { x: -1, y: 2, z: 0 }      // Focus on left rear delt
    }
  },
  "Deltoid_Posterior_R": {
    displayName: "Right Rear Deltoid",
    group: "shoulders",
    description: "Rear shoulder muscle, important for posture and pulling movements",
    relatedExercises: ["Reverse Flyes", "Face Pulls", "Bent-over Rows"],
    antagonists: ["Deltoid_Anterior_R"],
    cameraView: {
      position: { x: 3, y: 2, z: -5 },   // Back-right view
      target: { x: 1, y: 2, z: 0 }       // Focus on right rear delt
    }
  },

  // Chest - Pectoralis (using actual mesh names)
  "Pectoralis_Major_01_Clavicular": {
    displayName: "Upper Chest (Clavicular Head)",
    group: "chest",
    description: "Upper portion of the pectoralis major, responsible for flexion and adduction of the humerus. Activated most in incline pressing movements.",
    relatedExercises: ["Incline Bench Press", "Incline Dumbbell Press", "Low-to-High Cable Flyes"],
    antagonists: ["Latissimus_Dorsi", "Trapezius_02_Middle"],
    cameraView: {
      position: { x: 0, y: 1, z: 7 }, // Front view for chest
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Pectoralis_Major_02_Sternocostal": {
    displayName: "Middle Chest (Sternocostal Head)",
    group: "chest",
    description: "Middle and largest part of the pectoralis major, responsible for horizontal adduction and internal rotation of the arm. Activated in flat pressing movements.",
    relatedExercises: ["Flat Bench Press", "Push-ups", "Dumbbell Flyes", "Cable Crossovers"],
    antagonists: ["Latissimus_Dorsi", "Trapezius_02_Middle"],
    cameraView: {
      position: { x: 0, y: 1, z: 7 }, // Front view for chest
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Pectoralis_Major_03_Abdominal": {
    displayName: "Lower Chest (Abdominal Head)",
    group: "chest",
    description: "Lower fibers of the pectoralis major, assist in downward and inward movement of the arm. Activated in decline pressing and dips.",
    relatedExercises: ["Decline Bench Press", "Dips", "Decline Push-ups"],
    antagonists: ["Latissimus_Dorsi", "Trapezius_03_Lower"],
    cameraView: {
      position: { x: 0, y: 0, z: 7 }, // Lower front view for chest
      target: { x: 0, y: 0, z: 0 }
    }
  },

  // Back - Latissimus Dorsi
  "Latissimus_Dorsi": {
    displayName: "Left Latissimus Dorsi",
    group: "back",
    description: "Large back muscle responsible for arm adduction and internal rotation",
    relatedExercises: ["Pull-ups", "Lat Pulldowns", "Rows", "T-Bar Rows"],
    antagonists: ["Deltoid_Anterior"],
    cameraView: {
      position: { x: -4, y: 1, z: -6 },  // Behind left side
      target: { x: -1, y: 1, z: 0 }      // Focus on left lat
    }
  },
  "Latissimus_Dorsi_R": {
    displayName: "Right Latissimus Dorsi",
    group: "back",
    description: "Large back muscle responsible for arm adduction and internal rotation",
    relatedExercises: ["Pull-ups", "Lat Pulldowns", "Rows", "T-Bar Rows"],
    antagonists: ["Deltoid_Anterior_R"],
    cameraView: {
      position: { x: 4, y: 1, z: -6 },  // Behind right side
      target: { x: 1, y: 1, z: 0 }      // Focus on right lat
    }
  },

  // Core - Abdominals
  "Rectus_Abdominis": {
    displayName: "Left Rectus Abdominis",
    group: "core",
    description: "The 'six-pack' muscle, responsible for trunk flexion",
    relatedExercises: ["Crunches", "Leg Raises", "Planks", "Ab Rollouts"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 1, z: 6 },    // Direct front view
      target: { x: 0, y: 0, z: 0 }       // Focus on abs
    }
  },
  "Rectus_Abdominis_R": {
    displayName: "Right Rectus Abdominis",
    group: "core",
    description: "The 'six-pack' muscle, responsible for trunk flexion",
    relatedExercises: ["Crunches", "Leg Raises", "Planks", "Ab Rollouts"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 1, z: 6 },    // Direct front view
      target: { x: 0, y: 0, z: 0 }       // Focus on abs
    }
  },
  "External_Oblique": {
    displayName: "Left External Oblique",
    group: "core",
    description: "Side abdominal muscles, important for trunk rotation and lateral flexion",
    relatedExercises: ["Russian Twists", "Side Planks", "Woodchoppers"],
    antagonists: [],
    cameraView: {
      position: { x: 6, y: 1, z: 0 },     // Side view for obliques
      target: { x: 0, y: 0, z: 0 }
    }
  },
  "External_Oblique_R": {
    displayName: "Right External Oblique",
    group: "core",
    description: "Side abdominal muscles, important for trunk rotation and lateral flexion",
    relatedExercises: ["Russian Twists", "Side Planks", "Woodchoppers"],
    antagonists: [],
    cameraView: {
      position: { x: 6, y: 1, z: 0 },     // Side view for obliques
      target: { x: 0, y: 0, z: 0 }
    }
  },

  // Back - Trapezius
  "Trapezius_01_Upper": {
    displayName: "Left Upper Trapezius",
    group: "back",
    description: "Upper portion of the trapezius, elevates the scapula",
    relatedExercises: ["Shrugs", "Upright Rows", "Face Pulls"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Trapezius_01_Upper_R": {
    displayName: "Right Upper Trapezius",
    group: "back",
    description: "Upper portion of the trapezius, elevates the scapula",
    relatedExercises: ["Shrugs", "Upright Rows", "Face Pulls"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Trapezius_02_Middle": {
    displayName: "Left Middle Trapezius",
    group: "back",
    description: "Middle fibers of the trapezius, retract the scapula",
    relatedExercises: ["Rows", "Face Pulls", "Reverse Flyes"],
    antagonists: ["Pectoralis_Major"],
    cameraView: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Trapezius_02_Middle_R": {
    displayName: "Right Middle Trapezius",
    group: "back",
    description: "Middle fibers of the trapezius, retract the scapula",
    relatedExercises: ["Rows", "Face Pulls", "Reverse Flyes"],
    antagonists: ["Pectoralis_Major_R"],
    cameraView: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Trapezius_03_Lower": {
    displayName: "Left Lower Trapezius",
    group: "back",
    description: "Lower fibers of the trapezius, depress the scapula",
    relatedExercises: ["Y-Raises", "Prone Trap Raises", "Pull-ups"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    }
  },
  "Trapezius_03_Lower_R": {
    displayName: "Right Lower Trapezius",
    group: "back",
    description: "Lower fibers of the trapezius, depress the scapula",
    relatedExercises: ["Y-Raises", "Prone Trap Raises", "Pull-ups"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    }
  },

  // Legs - Gastrocnemius
  "Gastrocnemius_Lateral_Medial": {
    displayName: "Left Gastrocnemius",
    group: "legs",
    description: "Large calf muscle visible from the surface, primary ankle plantarflexor",
    relatedExercises: ["Standing Calf Raises", "Jump Rope", "Box Jumps"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for calves
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gastrocnemius_Lateral_Medial_R": {
    displayName: "Right Gastrocnemius",
    group: "legs",
    description: "Large calf muscle visible from the surface, primary ankle plantarflexor",
    relatedExercises: ["Standing Calf Raises", "Jump Rope", "Box Jumps"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for calves
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Soleus": {
    displayName: "Left Soleus",
    group: "legs",
    description: "Deep calf muscle beneath the gastrocnemius, important for walking and standing",
    relatedExercises: ["Seated Calf Raises", "Calf Press", "Donkey Calf Raises"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for calves
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Soleus_R": {
    displayName: "Right Soleus",
    group: "legs",
    description: "Deep calf muscle beneath the gastrocnemius, important for walking and standing",
    relatedExercises: ["Seated Calf Raises", "Calf Press", "Donkey Calf Raises"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for calves
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Rectus_Femoris": {
    displayName: "Left Rectus Femoris",
    group: "legs",
    description: "Front thigh muscle that crosses the hip and knee joints",
    relatedExercises: ["Squats", "Leg Extensions", "Lunges"],
    antagonists: ["Biceps_Femoris_Long_Head", "Semitendinosus", "Semimembranosus"],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Rectus_Femoris_R": {
    displayName: "Right Rectus Femoris",
    group: "legs",
    description: "Front thigh muscle that crosses the hip and knee joints",
    relatedExercises: ["Squats", "Leg Extensions", "Lunges"],
    antagonists: ["Biceps_Femoris_Long_Head_R", "Semitendinosus_R", "Semimembranosus_R"],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Vastus_Lateralis": {
    displayName: "Left Vastus Lateralis",
    group: "legs",
    description: "Largest part of the quadriceps on the outer thigh",
    relatedExercises: ["Squats", "Leg Press", "Step-ups"],
    antagonists: ["Biceps_Femoris_Short_Head"],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Vastus_Lateralis_R": {
    displayName: "Right Vastus Lateralis",
    group: "legs",
    description: "Largest part of the quadriceps on the outer thigh",
    relatedExercises: ["Squats", "Leg Press", "Step-ups"],
    antagonists: ["Biceps_Femoris_Short_Head_R"],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Vastus_Medialis": {
    displayName: "Left Vastus Medialis",
    group: "legs",
    description: "Teardrop-shaped muscle on the inner thigh, crucial for knee stability",
    relatedExercises: ["Bulgarian Split Squats", "Leg Extensions", "Hack Squats"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Vastus_Medialis_R": {
    displayName: "Right Vastus Medialis",
    group: "legs",
    description: "Teardrop-shaped muscle on the inner thigh, crucial for knee stability",
    relatedExercises: ["Bulgarian Split Squats", "Leg Extensions", "Hack Squats"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Vastus_Intermedius": {
    displayName: "Left Vastus Intermedius",
    group: "legs",
    description: "Deep quadriceps muscle located between vastus lateralis and vastus medialis",
    relatedExercises: ["Squats", "Leg Press", "Lunges"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Vastus_Intermedius_R": {
    displayName: "Right Vastus Intermedius",
    group: "legs",
    description: "Deep quadriceps muscle located between vastus lateralis and vastus medialis",
    relatedExercises: ["Squats", "Leg Press", "Lunges"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Biceps_Femoris_Long_Head": {
    displayName: "Left Biceps Femoris (Long Head)",
    group: "legs",
    description: "Outer hamstring muscle, involved in knee flexion and hip extension",
    relatedExercises: ["Leg Curls", "Romanian Deadlifts", "Good Mornings"],
    antagonists: ["Rectus_Femoris"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Biceps_Femoris_Long_Head_R": {
    displayName: "Right Biceps Femoris (Long Head)",
    group: "legs",
    description: "Outer hamstring muscle, involved in knee flexion and hip extension",
    relatedExercises: ["Leg Curls", "Romanian Deadlifts", "Good Mornings"],
    antagonists: ["Rectus_Femoris_R"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Biceps_Femoris_Short_Head": {
    displayName: "Left Biceps Femoris (Short Head)",
    group: "legs",
    description: "Part of the outer hamstring, primarily involved in knee flexion",
    relatedExercises: ["Seated Leg Curls", "Nordic Hamstring Curls"],
    antagonists: ["Vastus_Lateralis"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Biceps_Femoris_Short_Head_R": {
    displayName: "Right Biceps Femoris (Short Head)",
    group: "legs",
    description: "Part of the outer hamstring, primarily involved in knee flexion",
    relatedExercises: ["Seated Leg Curls", "Nordic Hamstring Curls"],
    antagonists: ["Vastus_Lateralis_R"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Semitendinosus": {
    displayName: "Left Semitendinosus",
    group: "legs",
    description: "Inner hamstring muscle, important for knee and hip stability",
    relatedExercises: ["Leg Curls", "Glute-Ham Raises", "Deadlifts"],
    antagonists: ["Rectus_Femoris"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Semitendinosus_R": {
    displayName: "Right Semitendinosus",
    group: "legs",
    description: "Inner hamstring muscle, important for knee and hip stability",
    relatedExercises: ["Leg Curls", "Glute-Ham Raises", "Deadlifts"],
    antagonists: ["Rectus_Femoris_R"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Semimembranosus": {
    displayName: "Left Semimembranosus",
    group: "legs",
    description: "Deep inner hamstring muscle, involved in knee flexion and internal rotation",
    relatedExercises: ["Stiff-Leg Deadlifts", "Seated Leg Curls", "Good Mornings"],
    antagonists: ["Rectus_Femoris"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Semimembranosus_R": {
    displayName: "Right Semimembranosus",
    group: "legs",
    description: "Deep inner hamstring muscle, involved in knee flexion and internal rotation",
    relatedExercises: ["Stiff-Leg Deadlifts", "Seated Leg Curls", "Good Mornings"],
    antagonists: ["Rectus_Femoris_R"],
    cameraView: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gluteus_Maximus": {
    displayName: "Left Gluteus Maximus",
    group: "glutes",
    description: "Largest gluteal muscle, primary function is hip extension",
    relatedExercises: ["Squats", "Hip Thrusts", "Deadlifts", "Glute Bridges"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for glutes
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gluteus_Maximus_R": {
    displayName: "Right Gluteus Maximus",
    group: "glutes",
    description: "Largest gluteal muscle, primary function is hip extension",
    relatedExercises: ["Squats", "Hip Thrusts", "Deadlifts", "Glute Bridges"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for glutes
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gluteus_Medius": {
    displayName: "Left Gluteus Medius",
    group: "glutes",
    description: "Responsible for hip abduction and rotation, important for gait stability",
    relatedExercises: ["Clamshells", "Side Lying Hip Abductions", "Banded Lateral Walks"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for glutes
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gluteus_Medius_R": {
    displayName: "Right Gluteus Medius",
    group: "glutes",
    description: "Responsible for hip abduction and rotation, important for gait stability",
    relatedExercises: ["Clamshells", "Side Lying Hip Abductions", "Banded Lateral Walks"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for glutes
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gluteus_Minimus": {
    displayName: "Left Gluteus Minimus",
    group: "glutes",
    description: "Smallest gluteal muscle, assists with hip internal rotation and abduction",
    relatedExercises: ["Side Leg Raises", "Hip Abduction Machine", "Fire Hydrants"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for glutes
      target: { x: 0, y: -2, z: 0 }
    }
  },
  "Gluteus_Minimus_R": {
    displayName: "Right Gluteus Minimus",
    group: "glutes",
    description: "Smallest gluteal muscle, assists with hip internal rotation and abduction",
    relatedExercises: ["Side Leg Raises", "Hip Abduction Machine", "Fire Hydrants"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: -1, z: 7 },    // Front view for glutes
      target: { x: 0, y: -2, z: 0 }
    }
  }
};

// Add group views
export const groupViews: Record<string, Record<string, CameraView>> = {
  arms: {
    front: {
      position: { x: 0, y: 1, z: 7 },     // Front view for arms
      target: { x: 0, y: 1, z: 0 }
    },
    side: {
      position: { x: 5, y: 1, z: 0 },     // Side view for arms
      target: { x: 0, y: 1, z: 0 }
    },
    back: {
      position: { x: 0, y: 1, z: -7 },    // Back view for triceps
      target: { x: 0, y: 1, z: 0 }
    }
  },
  shoulders: {
    front: {
      position: { x: 0, y: 2, z: 7 },     // Front view for deltoids
      target: { x: 0, y: 2, z: 0 }
    },
    top: {
      position: { x: 0, y: 5, z: 3 },     // Top-down view for all deltoids
      target: { x: 0, y: 2, z: 0 }
    }
  },
  back: {
    rear: {
      position: { x: 0, y: 2, z: -7 },    // Back view for lats and traps
      target: { x: 0, y: 1, z: 0 }
    },
    angle: {
      position: { x: 5, y: 2, z: -5 },    // Angled view for back muscles
      target: { x: 0, y: 1, z: 0 }
    }
  },
  core: {
    front: {
      position: { x: 0, y: 1, z: 6 },     // Front view for abs
      target: { x: 0, y: 0, z: 0 }
    },
    side: {
      position: { x: 6, y: 1, z: 0 },     // Side view for obliques
      target: { x: 0, y: 0, z: 0 }
    }
  },
  legs: {
    front: {
      position: { x: 0, y: -1, z: 7 },    // Front view for quads
      target: { x: 0, y: -2, z: 0 }
    },
    back: {
      position: { x: 0, y: -1, z: -7 },   // Back view for hamstrings
      target: { x: 0, y: -2, z: 0 }
    },
    side: {
      position: { x: 7, y: -1, z: 0 },    // Side view for full leg
      target: { x: 0, y: -2, z: 0 }
    }
  },
  chest: {
    front: {
      position: { x: 0, y: 1, z: 7 },     // Direct front view for chest
      target: { x: 0, y: 0, z: 0 }
    },
    angle: {
      position: { x: 4, y: 1, z: 5 },     // Angled view for better depth perception
      target: { x: 0, y: 0, z: 0 }
    },
    side: {
      position: { x: 7, y: 1, z: 0 },     // Side view for chest thickness
      target: { x: 0, y: 0, z: 0 }
    }
  }
};

// Helper function to focus camera on a specific muscle
export function getMuscleView(muscleName: string): CameraView | null {
  const muscle = muscleMap[muscleName];
  return muscle ? muscle.cameraView : null;
}

// Get all muscles in a specific group with their camera views
export function getMusclesByGroup(groupName: string): { muscleName: string; view: CameraView }[] {
  return Object.entries(muscleMap)
    .filter(([_, data]) => data.group === groupName)
    .map(([key, data]) => ({
      muscleName: key,
      view: data.cameraView
    }));
}

// Get antagonist muscles with their camera views
export function getAntagonistsWithViews(muscleName: string): { muscleName: string; view: CameraView }[] {
  const muscle = muscleMap[muscleName];
  if (!muscle) return [];
  
  return muscle.antagonists
    .map(antagonist => ({
      muscleName: antagonist,
      view: muscleMap[antagonist]?.cameraView
    }))
    .filter((item): item is { muscleName: string; view: CameraView } => item.view !== undefined);
}

// Get all exercises for a muscle
export function getExercisesForMuscle(muscleName: string): string[] {
  return muscleMap[muscleName]?.relatedExercises || [];
}

// Get unique list of all muscle groups
export function getAllMuscleGroups(): string[] {
  return Array.from(new Set(Object.values(muscleMap).map(muscle => muscle.group)));
}

// Get camera view for a muscle group
export function getGroupView(groupName: string, viewType: string = 'front'): CameraView | null {
  return groupViews[groupName]?.[viewType] || null;
}

// Get best view for multiple muscles
export function getBestViewForMuscles(muscleNames: string[]): CameraView | null {
  if (!muscleNames.length) return null;

  // Get the group of the first muscle
  const primaryGroup = muscleMap[muscleNames[0]]?.group;
  
  // Check if all muscles are from the same group
  const allSameGroup = muscleNames.every(name => muscleMap[name]?.group === primaryGroup);
  
  if (allSameGroup && groupViews[primaryGroup]) {
    // If all muscles are from the same group, use the group view
    return groupViews[primaryGroup].front;
  } else {
    // For mixed groups, use a default overview position
    return {
      position: { x: 0, y: 1, z: 8 },  // Further back to see more
      target: { x: 0, y: 0, z: 0 }
    };
  }
} 