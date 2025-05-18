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
  },
  "Orbicularis_Oculi": {
    displayName: "Orbicularis Oculi",
    group: "face",
    description: "Muscle surrounding the eye; responsible for closing the eyelids.",
    relatedExercises: ["Facial Yoga", "Eye Squeeze Holds"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 3, z: 6 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Orbicularis_Oris": {
    displayName: "Orbicularis Oris",
    group: "face",
    description: "Circular muscle around the mouth; used in closing and puckering lips.",
    relatedExercises: ["Whistle Holds", "Mouth Resistance Press"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 2.5, z: 6 },
      target: { x: 0, y: 2.5, z: 0 }
    }
  },
  "Corrugator_Supercilii": {
    displayName: "Corrugator Supercilii",
    group: "face",
    description: "Small eyebrow muscle involved in frowning and drawing the eyebrows together.",
    relatedExercises: ["Forehead Resistance Press"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 3, z: 6 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Occipitofrontalis_Frontal": {
    displayName: "Frontalis (Occipitofrontalis - Frontal)",
    group: "face",
    description: "Forehead portion of the occipitofrontalis; raises eyebrows and wrinkles forehead.",
    relatedExercises: ["Eyebrow Raises", "Forehead Holds"],
    antagonists: ["Corrugator_Supercilii"],
    cameraView: {
      position: { x: 0, y: 3.2, z: 6 },
      target: { x: 0, y: 3.2, z: 0 }
    }
  },
  "Depressor_Supercilii": {
    displayName: "Depressor Supercilii",
    group: "face",
    description: "Depresses the medial portion of the eyebrow, aiding in frowning.",
    relatedExercises: [],
    antagonists: ["Occipitofrontalis_Frontal"],
    cameraView: {
      position: { x: 0, y: 3, z: 6 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Eyes": {
    displayName: "Eye Muscles (Group)",
    group: "face",
    description: "Group of muscles responsible for eye movement and focusing.",
    relatedExercises: ["Eye Tracking Drills", "Focus Switching"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 3, z: 6 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Procerus": {
    displayName: "Procerus",
    group: "face",
    description: "Small muscle between the eyes that pulls the skin between the eyebrows downward.",
    relatedExercises: ["Nose Wrinkle Holds"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 3, z: 6 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Auricular_Cartilage": {
    displayName: "Auricular Cartilage Region",
    group: "face",
    description: "Refers to tissue around the ear, part of facial muscle structure.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
      position: { x: 2, y: 3, z: 3 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Occipitofrontalis_Occipital": {
    displayName: "Occipitalis (Occipitofrontalis - Occipital)",
    group: "face",
    description: "Back of the head part of occipitofrontalis; retracts the scalp.",
    relatedExercises: ["Scalp Pull-Back Drill"],
    antagonists: [],
    cameraView: {
      position: { x: 0, y: 3, z: -6 },
      target: { x: 0, y: 3, z: 0 }
    }
  },
  "Depressor_Anguli_Oris": {
    displayName: "Depressor Anguli Oris",
    group: "face",
    description: "Depresses the corners of the mouth, involved in frowning.",
    relatedExercises: [],
    antagonists: ["Zygomaticus_Major"],
    cameraView: {
      position: { x: 0, y: 2.5, z: 6 },
      target: { x: 0, y: 2.5, z: 0 }
    }
  },
  "Mentalis": {
    displayName: "Mentalis",
    group: "face",
    description: "Located on the chin; elevates and protrudes the lower lip.",
    relatedExercises: ["Chin Tension Holds"],
    antagonists: ["Depressor_Labii_Inferioris"],
    cameraView: {
      position: { x: 0, y: 2.4, z: 6 },
      target: { x: 0, y: 2.4, z: 0 }
    }
  },
  "Depressor_Labii_Inferioris": {
    displayName: "Depressor Labii Inferioris",
    group: "face",
    description: "Draws the lower lip downward and laterally.",
    relatedExercises: [],
    antagonists: ["Mentalis"],
    cameraView: {
        position: { x: 0, y: 2.4, z: 6 },
        target: { x: 0, y: 2.4, z: 0 }
    }
    },
    "Depressor_Septi_Nasi": {
    displayName: "Depressor Septi Nasi",
    group: "face",
    description: "Pulls the nasal septum downward; contributes to nostril movement.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Masseter_Deep": {
    displayName: "Deep Masseter",
    group: "face",
    description: "Deep layer of the masseter; assists in jaw closing and chewing.",
    relatedExercises: ["Jaw Clenches"],
    antagonists: ["Digastric"],
    cameraView: {
        position: { x: 1.5, y: 2.5, z: 5 },
        target: { x: 0, y: 2.5, z: 0 }
    }
    },
    "Masseter_Superficial": {
    displayName: "Superficial Masseter",
    group: "face",
    description: "Primary jaw-closing muscle, aids in mastication.",
    relatedExercises: ["Chewing Resistance Drills"],
    antagonists: ["Digastric"],
    cameraView: {
        position: { x: 1.5, y: 2.5, z: 5 },
        target: { x: 0, y: 2.5, z: 0 }
    }
    },
    "Greater_Alar_Cartilage": {
    displayName: "Greater Alar Cartilage",
    group: "face",
    description: "Structure forming part of the nasal tip and nostrils.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Lateral_Nasal_Cartilage": {
    displayName: "Lateral Nasal Cartilage",
    group: "face",
    description: "Cartilaginous part of the nose contributing to nostril support.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Nasalis_Transverese": {
    displayName: "Transverse Nasalis",
    group: "face",
    description: "Compresses the bridge of the nose; works with other nasal muscles.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Septal_Cartilage": {
    displayName: "Nasal Septal Cartilage",
    group: "face",
    description: "Supports the nasal septum, contributes to nose shape and airflow.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Nasalis_Alar": {
    displayName: "Alar Nasalis",
    group: "face",
    description: "Dilates the nostrils, part of the nasal expression system.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Genioglossus": {
    displayName: "Genioglossus",
    group: "face",
    description: "Major tongue muscle, responsible for protruding and depressing the tongue.",
    relatedExercises: ["Tongue Push-Outs"],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.3, z: 6 },
        target: { x: 0, y: 2.3, z: 0 }
    }
    },
    "Zygomaticus_Major": {
    displayName: "Zygomaticus Major",
    group: "face",
    description: "Elevates the corners of the mouth, important for smiling.",
    relatedExercises: ["Smile Holds"],
    antagonists: ["Depressor_Anguli_Oris"],
    cameraView: {
        position: { x: 1.5, y: 2.5, z: 6 },
        target: { x: 0, y: 2.5, z: 0 }
    }
    },
    "Risorius": {
    displayName: "Risorius",
    group: "face",
    description: "Pulls the corners of the mouth laterally; assists with expressions like grinning.",
    relatedExercises: ["Cheek Pull Exercises"],
    antagonists: [],
    cameraView: {
        position: { x: 1.5, y: 2.5, z: 6 },
        target: { x: 0, y: 2.5, z: 0 }
    }
    },
    "Zygomaticus_Minor": {
    displayName: "Zygomaticus Minor",
    group: "face",
    description: "Elevates upper lip to expose teeth; active in smiling.",
    relatedExercises: ["Upper Lip Raises"],
    antagonists: [],
    cameraView: {
        position: { x: 1.5, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Levator_Labii_Superioris": {
    displayName: "Levator Labii Superioris",
    group: "face",
    description: "Raises the upper lip; contributes to snarling or disgust expressions.",
    relatedExercises: ["Lip Lift Holds"],
    antagonists: ["Depressor_Labii_Inferioris"],
    cameraView: {
        position: { x: 1.5, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Levator_Labii_Superioris_Alaeque_Nasi": {
    displayName: "Levator Labii Superioris Alaeque Nasi",
    group: "face",
    description: "Raises the upper lip and dilates the nostrils.",
    relatedExercises: [],
    antagonists: [],
    cameraView: {
        position: { x: 1.5, y: 2.6, z: 6 },
        target: { x: 0, y: 2.6, z: 0 }
    }
    },
    "Buccinator": {
    displayName: "Buccinator",
    group: "face",
    description: "Compresses the cheek; important for chewing and blowing.",
    relatedExercises: ["Cheek Puff Resistance"],
    antagonists: [],
    cameraView: {
        position: { x: 1.5, y: 2.4, z: 6 },
        target: { x: 0, y: 2.4, z: 0 }
    }
    },
    "Temporalis": {
    displayName: "Temporalis",
    group: "face",
    description: "Assists in elevating and retracting the mandible (jaw closing).",
    relatedExercises: ["Jaw Clenches"],
    antagonists: ["Digastric"],
    cameraView: {
        position: { x: 2.5, y: 3, z: 5 },
        target: { x: 0, y: 2.5, z: 0 }
    }
    },
    "Mylohyoid": {
    displayName: "Mylohyoid",
    group: "face",
    description: "Forms the floor of the mouth and assists in tongue movement and swallowing.",
    relatedExercises: ["Swallow Holds"],
    antagonists: [],
    cameraView: {
        position: { x: 0, y: 2.2, z: 6 },
        target: { x: 0, y: 2.2, z: 0 }
    }
    },
    "Digastric": {
    displayName: "Digastric",
    group: "face",
    description: "Depresses the mandible and elevates the hyoid bone during swallowing.",
    relatedExercises: ["Jaw Depression Holds"],
    antagonists: ["Masseter_Superficial"],
    cameraView: {
        position: { x: 0, y: 2.3, z: 6 },
        target: { x: 0, y: 2.3, z: 0 }
    }
    },
"Iliocostalis_Lumborum": {
  displayName: "Left Iliocostalis Lumborum",
  group: "back",
  description: "Part of the erector spinae group, extends and laterally flexes the spine.",
  relatedExercises: ["Back Extensions", "Deadlifts", "Side Bends"],
  antagonists: ["Rectus_Abdominis"],
  cameraView: {
    position: { x: -4, y: 0, z: -6 },
    target: { x: 0, y: 0, z: 0 }
  }
},
"Levator_Scapulae": {
  displayName: "Left Levator Scapulae",
  group: "back",
  description: "Elevates the scapula and helps rotate the neck.",
  relatedExercises: ["Shrugs", "Neck Raises"],
  antagonists: ["Lower Trapezius"],
  cameraView: {
    position: { x: -2, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Longissimus_Thoracis": {
  displayName: "Left Longissimus Thoracis",
  group: "back",
  description: "Extends the thoracic spine and helps with posture.",
  relatedExercises: ["Supermans", "Deadlifts", "Good Mornings"],
  antagonists: ["Rectus_Abdominis"],
  cameraView: {
    position: { x: -4, y: 0, z: -6 },
    target: { x: 0, y: 0, z: 0 }
  }
},
"Omohyoid": {
  displayName: "Left Omohyoid",
  group: "neck",
  description: "Depresses the hyoid bone, aids in swallowing and speech.",
  relatedExercises: ["Neck Flexor Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: 2.5, z: 6 },
    target: { x: 0, y: 2.5, z: 0 }
  }
},
"Pectoralis_Minor": {
  displayName: "Left Pectoralis Minor",
  group: "chest",
  description: "Lies under the pectoralis major; stabilizes and pulls the scapula forward.",
  relatedExercises: ["Push-ups Plus", "Scapular Wall Slides"],
  antagonists: ["Trapezius_02_Middle"],
  cameraView: {
    position: { x: -2, y: 1.5, z: 6 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Psoas_Major": {
  displayName: "Left Psoas Major",
  group: "hip",
  description: "Flexes the hip and trunk; part of the iliopsoas group.",
  relatedExercises: ["Leg Raises", "Hanging Knee Tucks"],
  antagonists: ["Gluteus_Maximus"],
  cameraView: {
    position: { x: -2, y: -1, z: 6 },
    target: { x: 0, y: -1.5, z: 0 }
  }
},
"Psoas_Minor": {
  displayName: "Left Psoas Minor",
  group: "hip",
  description: "Assists in flexing the lumbar spine; sometimes absent in humans.",
  relatedExercises: ["Leg Raises", "Pelvic Tilts"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: -1, z: 6 },
    target: { x: 0, y: -1.5, z: 0 }
  }
},
"Rhomboideus_Major": {
  displayName: "Left Rhomboid Major",
  group: "back",
  description: "Retracts the scapula; works with rhomboid minor.",
  relatedExercises: ["Rows", "Face Pulls", "Scapular Pull-ups"],
  antagonists: ["Pectoralis_Minor"],
  cameraView: {
    position: { x: -3, y: 2, z: -6 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Rhomboideus_Minor": {
  displayName: "Left Rhomboid Minor",
  group: "back",
  description: "Assists rhomboid major in scapular retraction.",
  relatedExercises: ["Rows", "Face Pulls"],
  antagonists: ["Pectoralis_Minor"],
  cameraView: {
    position: { x: -3, y: 2, z: -6 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Scalenus_Medius": {
  displayName: "Left Scalenus Medius",
  group: "neck",
  description: "Lateral neck muscle that elevates the first rib and assists in neck flexion.",
  relatedExercises: ["Neck Isometrics", "Deep Breathing Holds"],
  antagonists: [],
  cameraView: {
    position: { x: -1.5, y: 3, z: 6 },
    target: { x: 0, y: 2.8, z: 0 }
  }
},
"Semispinalis_Capitis_Lateral": {
  displayName: "Left Semispinalis Capitis (Lateral)",
  group: "neck",
  description: "Deep back muscle responsible for head extension and slight rotation.",
  relatedExercises: ["Neck Extensions", "Back-of-Head Isometrics"],
  antagonists: [],
  cameraView: {
    position: { x: -1.5, y: 3.2, z: -6 },
    target: { x: 0, y: 3.2, z: 0 }
  }
},
"Semispinalis_Capitis_Medial": {
  displayName: "Left Semispinalis Capitis (Medial)",
  group: "neck",
  description: "Central portion aiding in extension and postural control of the head.",
  relatedExercises: ["Neck Holds", "Postural Isometrics"],
  antagonists: [],
  cameraView: {
    position: { x: -1.5, y: 3.2, z: -6 },
    target: { x: 0, y: 3.2, z: 0 }
  }
},
"Serratus_Anterior": {
  displayName: "Left Serratus Anterior",
  group: "chest",
  description: "Holds the scapula against the thoracic wall; important for shoulder movement and stability.",
  relatedExercises: ["Push-ups Plus", "Scap Push-ups"],
  antagonists: ["Rhomboideus_Major"],
  cameraView: {
    position: { x: -2.5, y: 1.5, z: 6 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Serratus_Posterior_Inferior": {
  displayName: "Left Serratus Posterior Inferior",
  group: "back",
  description: "Pulls down the lower ribs to aid in forced exhalation.",
  relatedExercises: ["Deep Breathing Holds", "Postural Control Drills"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 0.5, z: -6 },
    target: { x: 0, y: 0.5, z: 0 }
  }
},
"Serratus_Posterior_Superior": {
  displayName: "Left Serratus Posterior Superior",
  group: "back",
  description: "Elevates the upper ribs to assist in breathing.",
  relatedExercises: ["Breathing Drills", "Postural Therapy"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 2.5, z: -6 },
    target: { x: 0, y: 2.5, z: 0 }
  }
},
"Spinalis_Thoracis": {
  displayName: "Left Spinalis Thoracis",
  group: "back",
  description: "Part of the erector spinae group; extends and supports thoracic spine.",
  relatedExercises: ["Supermans", "Deadlifts"],
  antagonists: ["Rectus_Abdominis"],
  cameraView: {
    position: { x: -3.5, y: 0, z: -6 },
    target: { x: 0, y: 0, z: 0 }
  }
},
"Splenius_Capitis": {
  displayName: "Left Splenius Capitis",
  group: "neck",
  description: "Extends and rotates the head and neck.",
  relatedExercises: ["Neck Rotation Holds", "Posture Bracing"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 3.2, z: -6 },
    target: { x: 0, y: 3.2, z: 0 }
  }
},
"Splenius_Cervicis": {
  displayName: "Left Splenius Cervicis",
  group: "neck",
  description: "Extends and rotates the cervical spine.",
  relatedExercises: ["Neck Rotation Holds", "Chin Tucks"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 2.8, z: -6 },
    target: { x: 0, y: 2.8, z: 0 }
  }
},
"Sternocleidomastoid": {
  displayName: "Left Sternocleidomastoid",
  group: "neck",
  description: "Flexes the neck and rotates the head; important for head posture and mobility.",
  relatedExercises: ["Neck Turns", "Chin-to-Chest Holds"],
  antagonists: ["Splenius_Capitis"],
  cameraView: {
    position: { x: -2, y: 3, z: 6 },
    target: { x: 0, y: 3, z: 0 }
  }
},
"Sternohyoid": {
  displayName: "Left Sternohyoid",
  group: "neck",
  description: "Depresses the hyoid bone after swallowing; part of infrahyoid group.",
  relatedExercises: ["Swallow Holds", "Chin Tucks"],
  antagonists: [],
  cameraView: {
    position: { x: -1.5, y: 2.6, z: 6 },
    target: { x: 0, y: 2.6, z: 0 }
  }
},
"Iliocostalis_Lumborum_R": {
  displayName: "Right Iliocostalis Lumborum",
  group: "back",
  description: "Extends and laterally flexes the lumbar spine.",
  relatedExercises: ["Deadlifts", "Side Bends", "Back Extensions"],
  antagonists: ["Rectus_Abdominis_R"],
  cameraView: {
    position: { x: 4, y: 0, z: -6 },
    target: { x: 0, y: 0, z: 0 }
  }
},
"Levator_Scapulae_R": {
  displayName: "Right Levator Scapulae",
  group: "back",
  description: "Elevates the scapula and assists in neck rotation.",
  relatedExercises: ["Shrugs", "Neck Raises"],
  antagonists: ["Trapezius_03_Lower_R"],
  cameraView: {
    position: { x: 2, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Longissimus_Thoracis_R": {
  displayName: "Right Longissimus Thoracis",
  group: "back",
  description: "Extends the thoracic spine and maintains upright posture.",
  relatedExercises: ["Back Extensions", "Deadlifts"],
  antagonists: ["Rectus_Abdominis_R"],
  cameraView: {
    position: { x: 4, y: 0, z: -6 },
    target: { x: 0, y: 0, z: 0 }
  }
},
"Omohyoid_R": {
  displayName: "Right Omohyoid",
  group: "neck",
  description: "Depresses hyoid bone during speech and swallowing.",
  relatedExercises: ["Neck Flexor Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: 2.6, z: 6 },
    target: { x: 0, y: 2.6, z: 0 }
  }
},
"Pectoralis_Minor_R": {
  displayName: "Right Pectoralis Minor",
  group: "chest",
  description: "Draws the scapula forward and downward.",
  relatedExercises: ["Push-ups Plus", "Scapular Wall Slides"],
  antagonists: ["Trapezius_02_Middle_R"],
  cameraView: {
    position: { x: 2, y: 1.5, z: 6 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Psoas_Major_R": {
  displayName: "Right Psoas Major",
  group: "hip",
  description: "Powerful hip flexor and trunk stabilizer.",
  relatedExercises: ["Leg Raises", "Hanging Knee Tucks"],
  antagonists: ["Gluteus_Maximus_R"],
  cameraView: {
    position: { x: 2, y: -1, z: 6 },
    target: { x: 0, y: -1.5, z: 0 }
  }
},
"Psoas_Minor_R": {
  displayName: "Right Psoas Minor",
  group: "hip",
  description: "Weak flexor of lumbar spine; absent in some people.",
  relatedExercises: ["Pelvic Tilts", "Supine Leg Raises"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: -1, z: 6 },
    target: { x: 0, y: -1.5, z: 0 }
  }
},
"Rhomboideus_Major_R": {
  displayName: "Right Rhomboid Major",
  group: "back",
  description: "Retracts scapula and stabilizes shoulder blade.",
  relatedExercises: ["Rows", "Face Pulls", "Scapular Pull-ups"],
  antagonists: ["Pectoralis_Minor_R"],
  cameraView: {
    position: { x: 3, y: 2, z: -6 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Rhomboideus_Minor_R": {
  displayName: "Right Rhomboid Minor",
  group: "back",
  description: "Works with rhomboid major to retract the scapula.",
  relatedExercises: ["Rows", "Face Pulls"],
  antagonists: ["Pectoralis_Minor_R"],
  cameraView: {
    position: { x: 3, y: 2, z: -6 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Scalenus_Medius_R": {
  displayName: "Right Scalenus Medius",
  group: "neck",
  description: "Elevates the first rib and aids in neck flexion.",
  relatedExercises: ["Neck Isometrics", "Breathing Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: 3, z: 6 },
    target: { x: 0, y: 2.8, z: 0 }
  }
},
"Semispinalis_Capitis_Lateral_R": {
  displayName: "Right Semispinalis Capitis (Lateral)",
  group: "neck",
  description: "Extends and rotates the head slightly.",
  relatedExercises: ["Neck Extensions", "Postural Drills"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: 3.2, z: -6 },
    target: { x: 0, y: 3.2, z: 0 }
  }
},
"Semispinalis_Capitis_Medial_R": {
  displayName: "Right Semispinalis Capitis (Medial)",
  group: "neck",
  description: "Central portion of semispinalis; assists in postural control.",
  relatedExercises: ["Neck Extensions", "Chin Tucks"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: 3.2, z: -6 },
    target: { x: 0, y: 3.2, z: 0 }
  }
},
"Serratus_Anterior_R": {
  displayName: "Right Serratus Anterior",
  group: "chest",
  description: "Anchors scapula to the rib cage, enabling arm elevation.",
  relatedExercises: ["Push-ups Plus", "Serratus Punches"],
  antagonists: ["Rhomboideus_Major_R"],
  cameraView: {
    position: { x: 2.5, y: 1.5, z: 6 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Serratus_Posterior_Inferior_R": {
  displayName: "Right Serratus Posterior Inferior",
  group: "back",
  description: "Assists in forced expiration by depressing the ribs.",
  relatedExercises: ["Breathing Exercises", "Postural Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 0.5, z: -6 },
    target: { x: 0, y: 0.5, z: 0 }
  }
},
"Serratus_Posterior_Superior_R": {
  displayName: "Right Serratus Posterior Superior",
  group: "back",
  description: "Elevates the upper ribs for inhalation.",
  relatedExercises: ["Breathing Holds", "Inhalation Drills"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 2.5, z: -6 },
    target: { x: 0, y: 2.5, z: 0 }
  }
},
"Spinalis_Thoracis_R": {
  displayName: "Right Spinalis Thoracis",
  group: "back",
  description: "Part of erector spinae; helps extend the thoracic spine.",
  relatedExercises: ["Deadlifts", "Superman Holds"],
  antagonists: ["Rectus_Abdominis_R"],
  cameraView: {
    position: { x: 3.5, y: 0, z: -6 },
    target: { x: 0, y: 0, z: 0 }
  }
},
"Splenius_Capitis_R": {
  displayName: "Right Splenius Capitis",
  group: "neck",
  description: "Extends and rotates the head and neck.",
  relatedExercises: ["Chin Turns", "Neck Postural Drills"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 3.2, z: -6 },
    target: { x: 0, y: 3.2, z: 0 }
  }
},
"Splenius_Cervicis_R": {
  displayName: "Right Splenius Cervicis",
  group: "neck",
  description: "Rotates and extends cervical spine.",
  relatedExercises: ["Neck Twists", "Posture Control"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 2.8, z: -6 },
    target: { x: 0, y: 2.8, z: 0 }
  }
},
"Sternocleidomastoid_R": {
  displayName: "Right Sternocleidomastoid",
  group: "neck",
  description: "Flexes and rotates the head; helps with neck posture.",
  relatedExercises: ["Chin Tucks", "Lateral Neck Flexion"],
  antagonists: ["Splenius_Capitis_R"],
  cameraView: {
    position: { x: 2, y: 3, z: 6 },
    target: { x: 0, y: 3, z: 0 }
  }
},
"Sternohyoid_R": {
  displayName: "Right Sternohyoid",
  group: "neck",
  description: "Depresses hyoid bone after swallowing.",
  relatedExercises: ["Chin Tucks", "Swallow Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: 2.6, z: 6 },
    target: { x: 0, y: 2.6, z: 0 }
  }
},
"Ischium": {
  displayName: "Ischium Region",
  group: "pelvis",
  description: "Part of the pelvic bone structure; origin for several deep muscles.",
  relatedExercises: [],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3, z: 5 },
    target: { x: 0, y: -3, z: 0 }
  }
},
"Iliococygeus": {
  displayName: "Iliococygeus",
  group: "pelvic_floor",
  description: "Supports pelvic viscera and lifts the pelvic floor.",
  relatedExercises: ["Kegels", "Pelvic Floor Lifts"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3, z: 5 },
    target: { x: 0, y: -3, z: 0 }
  }
},
"Coccygeus": {
  displayName: "Coccygeus",
  group: "pelvic_floor",
  description: "Supports pelvic organs and flexes the coccyx.",
  relatedExercises: ["Pelvic Tilts", "Bridge Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3, z: 5 },
    target: { x: 0, y: -3, z: 0 }
  }
},
"Anal_Sphincter_External_Superficial": {
  displayName: "External Anal Sphincter (Superficial)",
  group: "pelvic_floor",
  description: "Controls voluntary contraction of the anal opening.",
  relatedExercises: ["Kegels", "Sphincter Clenches"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3.5, z: 5 },
    target: { x: 0, y: -3.5, z: 0 }
  }
},
"Pubococcygeus": {
  displayName: "Pubococcygeus",
  group: "pelvic_floor",
  description: "Part of the levator ani group; supports pelvic floor and controls urination.",
  relatedExercises: ["Kegels", "Deep Pelvic Lifts"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3, z: 5 },
    target: { x: 0, y: -3, z: 0 }
  }
},
"Anal_Sphincter_External": {
  displayName: "External Anal Sphincter",
  group: "pelvic_floor",
  description: "Voluntary muscle that closes the anal canal.",
  relatedExercises: ["Sphincter Contractions", "Kegel Variants"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3.5, z: 5 },
    target: { x: 0, y: -3.5, z: 0 }
  }
},
"Puborectalis": {
  displayName: "Puborectalis",
  group: "pelvic_floor",
  description: "Part of the levator ani group; helps maintain continence.",
  relatedExercises: ["Squat and Hold", "Pelvic Floor Contractions"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3.2, z: 5 },
    target: { x: 0, y: -3.2, z: 0 }
  }
},
"Superficial_Transverse_Perineal": {
  displayName: "Superficial Transverse Perineal",
  group: "pelvic_floor",
  description: "Stabilizes the perineal body and supports pelvic organs.",
  relatedExercises: ["Bridge Holds", "Pelvic Contractions"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3.1, z: 5 },
    target: { x: 0, y: -3.1, z: 0 }
  }
},
"Deep_Transverse_Perineal": {
  displayName: "Deep Transverse Perineal",
  group: "pelvic_floor",
  description: "Supports the pelvic floor and helps maintain continence.",
  relatedExercises: ["Kegels", "Pelvic Bracing"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -3.1, z: 5 },
    target: { x: 0, y: -3.1, z: 0 }
  }
},
"Brachialis": {
  displayName: "Left Brachialis",
  group: "arms",
  description: "Lies underneath the biceps; primary elbow flexor.",
  relatedExercises: ["Hammer Curls", "Reverse Curls"],
  antagonists: ["Triceps_Medial_Head"],
  cameraView: {
    position: { x: -2.5, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Corabrachialis": {
  displayName: "Left Coracobrachialis",
  group: "arms",
  description: "Assists in flexion and adduction of the shoulder.",
  relatedExercises: ["Front Raises", "Overhead Press"],
  antagonists: [],
  cameraView: {
    position: { x: -2.5, y: 1.5, z: 5 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Infraspinatus": {
  displayName: "Left Infraspinatus",
  group: "shoulders",
  description: "Part of rotator cuff; externally rotates the shoulder.",
  relatedExercises: ["External Rotations", "Face Pulls"],
  antagonists: ["Subscapularis"],
  cameraView: {
    position: { x: -3, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Subscapularis": {
  displayName: "Left Subscapularis",
  group: "shoulders",
  description: "Part of rotator cuff; internally rotates the arm.",
  relatedExercises: ["Internal Rotations", "Chest Press"],
  antagonists: ["Infraspinatus"],
  cameraView: {
    position: { x: -3, y: 2, z: 5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Supraspinatus": {
  displayName: "Left Supraspinatus",
  group: "shoulders",
  description: "Initiates shoulder abduction; part of rotator cuff.",
  relatedExercises: ["Lateral Raises", "Scaption"],
  antagonists: [],
  cameraView: {
    position: { x: -3, y: 2.5, z: 5 },
    target: { x: 0, y: 2.5, z: 0 }
  }
},
"Teres_Major": {
  displayName: "Left Teres Major",
  group: "shoulders",
  description: "Assists in internal rotation and adduction of the arm.",
  relatedExercises: ["Lat Pulldowns", "Straight Arm Pulldowns"],
  antagonists: [],
  cameraView: {
    position: { x: -3, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Teres_Minor": {
  displayName: "Left Teres Minor",
  group: "shoulders",
  description: "Part of the rotator cuff; assists in external rotation of the arm.",
  relatedExercises: ["Dumbbell Rotations", "Cable External Rotations"],
  antagonists: ["Subscapularis"],
  cameraView: {
    position: { x: -3, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Brachialis_R": {
  displayName: "Right Brachialis",
  group: "arms",
  description: "Primary elbow flexor located under the biceps.",
  relatedExercises: ["Hammer Curls", "Reverse Curls"],
  antagonists: ["Triceps_Medial_Head_R"],
  cameraView: {
    position: { x: 2.5, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Corabrachialis_R": {
  displayName: "Right Coracobrachialis",
  group: "arms",
  description: "Assists in shoulder flexion and adduction.",
  relatedExercises: ["Front Raises", "Overhead Press"],
  antagonists: [],
  cameraView: {
    position: { x: 2.5, y: 1.5, z: 5 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Infraspinatus_R": {
  displayName: "Right Infraspinatus",
  group: "shoulders",
  description: "Part of rotator cuff; externally rotates the shoulder.",
  relatedExercises: ["External Rotations", "Face Pulls"],
  antagonists: ["Subscapularis_R"],
  cameraView: {
    position: { x: 3, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Subscapularis_R": {
  displayName: "Right Subscapularis",
  group: "shoulders",
  description: "Part of rotator cuff; internally rotates the arm.",
  relatedExercises: ["Internal Rotations", "Chest Press"],
  antagonists: ["Infraspinatus_R"],
  cameraView: {
    position: { x: 3, y: 2, z: 5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Supraspinatus_R": {
  displayName: "Right Supraspinatus",
  group: "shoulders",
  description: "Initiates shoulder abduction; part of rotator cuff.",
  relatedExercises: ["Lateral Raises", "Scaption"],
  antagonists: [],
  cameraView: {
    position: { x: 3, y: 2.5, z: 5 },
    target: { x: 0, y: 2.5, z: 0 }
  }
},
"Teres_Major_R": {
  displayName: "Right Teres Major",
  group: "shoulders",
  description: "Assists in internal rotation and adduction of the arm.",
  relatedExercises: ["Lat Pulldowns", "Straight Arm Pulldowns"],
  antagonists: [],
  cameraView: {
    position: { x: 3, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Teres_Minor_R": {
  displayName: "Right Teres Minor",
  group: "shoulders",
  description: "Part of the rotator cuff; assists in external rotation of the arm.",
  relatedExercises: ["Cable Rotations", "Resistance Band ER"],
  antagonists: ["Subscapularis_R"],
  cameraView: {
    position: { x: 3, y: 2, z: -5 },
    target: { x: 0, y: 2, z: 0 }
  }
},
"Extensor_Indicis": {
  displayName: "Left Extensor Indicis",
  group: "forearms",
  description: "Extends the index finger and assists in wrist extension.",
  relatedExercises: ["Reverse Wrist Curls", "Band Finger Extensions"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Carpi_Radialis_Brevis": {
  displayName: "Left Extensor Carpi Radialis Brevis",
  group: "forearms",
  description: "Extends and abducts the wrist.",
  relatedExercises: ["Reverse Wrist Curls", "Grip Extensions"],
  antagonists: ["Flexor_Carpi_Radialis"],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Carpi_Radialis_Longus": {
  displayName: "Left Extensor Carpi Radialis Longus",
  group: "forearms",
  description: "Assists in wrist extension and radial deviation.",
  relatedExercises: ["Wrist Roller", "Reverse Dumbbell Curls"],
  antagonists: ["Flexor_Carpi_Radialis"],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Digitorum": {
  displayName: "Left Extensor Digitorum",
  group: "forearms",
  description: "Extends fingers and assists in wrist extension.",
  relatedExercises: ["Rubber Band Extensions", "Reverse Forearm Curls"],
  antagonists: ["Flexor_Digitorum_Superficialis"],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Digiti_Minimi": {
  displayName: "Left Extensor Digiti Minimi",
  group: "forearms",
  description: "Specifically extends the little finger.",
  relatedExercises: ["Finger Isolation Extensions"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Carpi_Ulnaris": {
  displayName: "Left Extensor Carpi Ulnaris",
  group: "forearms",
  description: "Extends and adducts the wrist.",
  relatedExercises: ["Wrist Roller", "Reverse Wrist Curls"],
  antagonists: ["Flexor_Carpi_Ulnaris"],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Anconeus": {
  displayName: "Left Anconeus",
  group: "forearms",
  description: "Assists in elbow extension and joint stabilization.",
  relatedExercises: ["Tricep Kickbacks", "Press Downs"],
  antagonists: ["Biceps_Brachii"],
  cameraView: {
    position: { x: -2, y: 1, z: -5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Abductor_Pollicis_Longus": {
  displayName: "Left Abductor Pollicis Longus",
  group: "forearms",
  description: "Abducts the thumb and extends it at the carpometacarpal joint.",
  relatedExercises: ["Thumb Extensions", "Wrist Rotations"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Pollicis_Longus": {
  displayName: "Left Extensor Pollicis Longus",
  group: "forearms",
  description: "Extends the thumb at all joints.",
  relatedExercises: ["Thumb Raises", "Rubber Band Work"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Pollicis_Brevis": {
  displayName: "Left Extensor Pollicis Brevis",
  group: "forearms",
  description: "Extends thumb at MCP joint.",
  relatedExercises: ["Thumb Extension Drills"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Abductor_Pollicis_Longus_R": {
  displayName: "Right Abductor Pollicis Longus",
  group: "forearms",
  description: "Abducts the thumb and assists in extension at the wrist.",
  relatedExercises: ["Thumb Lifts", "Wrist Deviation Work"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Anconeus_R": {
  displayName: "Right Anconeus",
  group: "forearms",
  description: "Stabilizes the elbow joint and assists with extension.",
  relatedExercises: ["Tricep Pushdowns", "Pressing Movements"],
  antagonists: ["Biceps_Brachii_R"],
  cameraView: {
    position: { x: 2, y: 1, z: -5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Carpi_Radialis_Brevis_R": {
  displayName: "Right Extensor Carpi Radialis Brevis",
  group: "forearms",
  description: "Extends and abducts the wrist.",
  relatedExercises: ["Reverse Curls", "Wrist Extensions"],
  antagonists: ["Flexor_Carpi_Radialis_R"],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Carpi_Radialis_Longus_R": {
  displayName: "Right Extensor Carpi Radialis Longus",
  group: "forearms",
  description: "Works with brevis to extend and abduct the wrist.",
  relatedExercises: ["Reverse Wrist Roller"],
  antagonists: ["Flexor_Carpi_Radialis_R"],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Carpi_Ulnaris_R": {
  displayName: "Right Extensor Carpi Ulnaris",
  group: "forearms",
  description: "Extends and adducts the wrist.",
  relatedExercises: ["Wrist Roller", "Reverse Wrist Curls"],
  antagonists: ["Flexor_Carpi_Ulnaris_R"],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Digiti_Minimi_R": {
  displayName: "Right Extensor Digiti Minimi",
  group: "forearms",
  description: "Extends the little finger.",
  relatedExercises: ["Finger Extension Bands"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Digitorum_R": {
  displayName: "Right Extensor Digitorum",
  group: "forearms",
  description: "Extends the fingers and assists wrist extension.",
  relatedExercises: ["Rubber Band Finger Work", "Wrist Extensions"],
  antagonists: ["Flexor_Digitorum_Superficialis_R"],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Indicis_R": {
  displayName: "Right Extensor Indicis",
  group: "forearms",
  description: "Extends the index finger and helps with wrist extension.",
  relatedExercises: ["Finger Extension Drills"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Pollicis_Brevis_R": {
  displayName: "Right Extensor Pollicis Brevis",
  group: "forearms",
  description: "Extends the thumb at the MCP joint.",
  relatedExercises: ["Thumb Lifts"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Extensor_Pollicis_Longus_R": {
  displayName: "Right Extensor Pollicis Longus",
  group: "forearms",
  description: "Extends the thumb at the IP and MCP joints.",
  relatedExercises: ["Thumb Extensions"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Flexor_Carpi_Radialis": {
  displayName: "Left Flexor Carpi Radialis",
  group: "forearms",
  description: "Flexes and abducts the wrist.",
  relatedExercises: ["Wrist Curls", "Grip Work"],
  antagonists: ["Extensor_Carpi_Radialis_Longus"],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Flexor_Carpi_Ulnaris": {
  displayName: "Left Flexor Carpi Ulnaris",
  group: "forearms",
  description: "Flexes and adducts the wrist.",
  relatedExercises: ["Wrist Curls", "Wrist Roller"],
  antagonists: ["Extensor_Carpi_Ulnaris"],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Pronator_Teres": {
  displayName: "Left Pronator Teres",
  group: "forearms",
  description: "Pronates the forearm and assists in elbow flexion.",
  relatedExercises: ["Forearm Twists", "Wrist Rotations"],
  antagonists: ["Supinator"],
  cameraView: {
    position: { x: -2, y: 1.5, z: 5 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Palmaris_Longus": {
  displayName: "Left Palmaris Longus",
  group: "forearms",
  description: "Tenses the palmar fascia and flexes the wrist.",
  relatedExercises: ["Wrist Flexion Holds", "Squeeze Grips"],
  antagonists: [],
  cameraView: {
    position: { x: -2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Brachioradialis": {
  displayName: "Left Brachioradialis",
  group: "forearms",
  description: "Flexes the forearm at the elbow, especially in neutral grip.",
  relatedExercises: ["Hammer Curls", "Reverse Curls"],
  antagonists: ["Triceps_Medial_Head"],
  cameraView: {
    position: { x: -2, y: 1.5, z: 5 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Flexor_Digitorum_Superficialis": {
  displayName: "Left Flexor Digitorum Superficialis",
  group: "forearms",
  description: "Flexes the fingers at the PIP joints and assists in wrist flexion.",
  relatedExercises: ["Grip Trainers", "Finger Curls"],
  antagonists: ["Extensor_Digitorum"],
  cameraView: {
    position: { x: -2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Flexor_Digitorum_Profundus": {
  displayName: "Left Flexor Digitorum Profundus",
  group: "forearms",
  description: "Flexes the fingers at DIP joints.",
  relatedExercises: ["Dead Hangs", "Grippers"],
  antagonists: ["Extensor_Digitorum"],
  cameraView: {
    position: { x: -2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Flexor_Pollicis_Longus": {
  displayName: "Left Flexor Pollicis Longus",
  group: "forearms",
  description: "Flexes the thumb at the IP joint.",
  relatedExercises: ["Thumb Grips", "Pinch Holds"],
  antagonists: ["Extensor_Pollicis_Longus"],
  cameraView: {
    position: { x: -2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Pronator_Quadratus": {
  displayName: "Left Pronator Quadratus",
  group: "forearms",
  description: "Deep muscle that pronates the forearm.",
  relatedExercises: ["Forearm Twists", "Band Pronation"],
  antagonists: ["Supinator"],
  cameraView: {
    position: { x: -2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Brachioradialis_R": {
  displayName: "Right Brachioradialis",
  group: "forearms",
  description: "Assists in elbow flexion in neutral grip.",
  relatedExercises: ["Hammer Curls", "Reverse Curls"],
  antagonists: ["Triceps_Medial_Head_R"],
  cameraView: {
    position: { x: 2, y: 1.5, z: 5 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Flexor_Carpi_Radialis_R": {
  displayName: "Right Flexor Carpi Radialis",
  group: "forearms",
  description: "Flexes and abducts the wrist.",
  relatedExercises: ["Wrist Curls", "Grip Work"],
  antagonists: ["Extensor_Carpi_Radialis_Longus_R"],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Flexor_Carpi_Ulnaris_R": {
  displayName: "Right Flexor Carpi Ulnaris",
  group: "forearms",
  description: "Flexes and adducts the wrist.",
  relatedExercises: ["Wrist Curls", "Wrist Roller"],
  antagonists: ["Extensor_Carpi_Ulnaris_R"],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Flexor_Digitorum_Profundus_R": {
  displayName: "Right Flexor Digitorum Profundus",
  group: "forearms",
  description: "Flexes distal phalanges and aids in grip strength.",
  relatedExercises: ["Dead Hangs", "Grippers"],
  antagonists: ["Extensor_Digitorum_R"],
  cameraView: {
    position: { x: 2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Flexor_Digitorum_Superficialis_R": {
  displayName: "Right Flexor Digitorum Superficialis",
  group: "forearms",
  description: "Flexes fingers at PIP joints, supports wrist flexion.",
  relatedExercises: ["Grip Trainers", "Finger Curls"],
  antagonists: ["Extensor_Digitorum_R"],
  cameraView: {
    position: { x: 2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Flexor_Pollicis_Longus_R": {
  displayName: "Right Flexor Pollicis Longus",
  group: "forearms",
  description: "Flexes thumb at all joints.",
  relatedExercises: ["Thumb Grips", "Pinch Holds"],
  antagonists: ["Extensor_Pollicis_Longus_R"],
  cameraView: {
    position: { x: 2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Palmaris_Longus_R": {
  displayName: "Right Palmaris Longus",
  group: "forearms",
  description: "Tenses palmar fascia and assists with wrist flexion.",
  relatedExercises: ["Palm Squeezes", "Wrist Flexor Holds"],
  antagonists: [],
  cameraView: {
    position: { x: 2, y: 1, z: 5 },
    target: { x: 0, y: 1, z: 0 }
  }
},
"Pronator_Quadratus_R": {
  displayName: "Right Pronator Quadratus",
  group: "forearms",
  description: "Deep muscle that pronates the forearm.",
  relatedExercises: ["Band Pronation", "Rotation Isometrics"],
  antagonists: ["Supinator_R"],
  cameraView: {
    position: { x: 2, y: 1.2, z: 5 },
    target: { x: 0, y: 1.2, z: 0 }
  }
},
"Pronator_Teres_R": {
  displayName: "Right Pronator Teres",
  group: "forearms",
  description: "Pronates the forearm and assists in elbow flexion.",
  relatedExercises: ["Forearm Twists", "Pronation Band Drills"],
  antagonists: ["Supinator_R"],
  cameraView: {
    position: { x: 2, y: 1.5, z: 5 },
    target: { x: 0, y: 1.5, z: 0 }
  }
},
"Adductor_Brevis": {
  displayName: "Left Adductor Brevis",
  group: "legs",
  description: "Adducts and flexes the thigh at the hip joint.",
  relatedExercises: ["Adductor Machine", "Sumo Squats"],
  antagonists: ["Gluteus_Medius"],
  cameraView: {
    position: { x: -1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Adductor_Longus": {
  displayName: "Left Adductor Longus",
  group: "legs",
  description: "Adducts the thigh and stabilizes pelvis during walking.",
  relatedExercises: ["Side Lunges", "Adductor Squeezes"],
  antagonists: ["Gluteus_Medius"],
  cameraView: {
    position: { x: -1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Adductor_Magnus": {
  displayName: "Left Adductor Magnus",
  group: "legs",
  description: "Large hip adductor; contributes to hip extension and adduction.",
  relatedExercises: ["Cable Adduction", "Wide-Stance Squats"],
  antagonists: ["Gluteus_Medius", "Gluteus_Maximus"],
  cameraView: {
    position: { x: -1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Gracilis": {
  displayName: "Left Gracilis",
  group: "legs",
  description: "Thin muscle aiding in hip adduction and knee flexion.",
  relatedExercises: ["Adduction Machine", "Resistance Band Pulls"],
  antagonists: ["Gluteus_Medius"],
  cameraView: {
    position: { x: -1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Iliacus": {
  displayName: "Left Iliacus",
  group: "hip",
  description: "Flexes the thigh at the hip joint; part of the iliopsoas.",
  relatedExercises: ["Leg Raises", "Sit-ups"],
  antagonists: ["Gluteus_Maximus"],
  cameraView: {
    position: { x: -2, y: -1.5, z: 6 },
    target: { x: 0, y: -1.5, z: 0 }
  }
},
"Illiotibial_Tract": {
  displayName: "Left Iliotibial Tract (IT Band)",
  group: "legs",
  description: "Long fibrous reinforcement of fascia, aids in hip and knee stability.",
  relatedExercises: ["Side-Lying Leg Raises", "Hip Hikes"],
  antagonists: [],
  cameraView: {
    position: { x: -1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Pectineus": {
  displayName: "Left Pectineus",
  group: "legs",
  description: "Assists in hip adduction and flexion.",
  relatedExercises: ["Side Lunges", "Adduction Resistance Bands"],
  antagonists: ["Gluteus_Medius"],
  cameraView: {
    position: { x: -1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Sartorius_R": {
  displayName: "Right Sartorius",
  group: "legs",
  description: "Longest muscle; assists in hip and knee flexion, abduction and lateral rotation.",
  relatedExercises: ["Step-ups", "Hip Flexor Drills"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Tensor_Fascia_Lata_R": {
  displayName: "Right Tensor Fascia Latae (TFL)",
  group: "legs",
  description: "Tenses the IT band; stabilizes hip and knee during movement.",
  relatedExercises: ["Banded Side Walks", "Lateral Raises"],
  antagonists: [],
  cameraView: {
    position: { x: 1.5, y: -1.5, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Tibialis_Anterior_R": {
  displayName: "Right Tibialis Anterior",
  group: "legs",
  description: "Dorsiflexes the ankle and stabilizes the foot arch.",
  relatedExercises: ["Toe Raises", "Ankle Band Flexion"],
  antagonists: ["Gastrocnemius_Lateral_Medial_R"],
  cameraView: {
    position: { x: 1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Extensor_Digitorum_Longus_R": {
  displayName: "Right Extensor Digitorum Longus",
  group: "legs",
  description: "Extends the toes and helps lift the foot.",
  relatedExercises: ["Toe Raises", "Toe Band Extensions"],
  antagonists: ["Flexor_Digitorum_Longus_R"],
  cameraView: {
    position: { x: 1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Extensor_Hallucis_Longus_R": {
  displayName: "Right Extensor Hallucis Longus",
  group: "legs",
  description: "Extends the big toe and dorsiflexes the foot.",
  relatedExercises: ["Toe Taps", "Big Toe Extensions"],
  antagonists: ["Flexor_Hallucis_Longus_R"],
  cameraView: {
    position: { x: 1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Fibularis_Brevis_R": {
  displayName: "Right Fibularis (Peroneus) Brevis",
  group: "legs",
  description: "Everts the foot and assists in plantarflexion.",
  relatedExercises: ["Band Eversion", "Ankle Mobility Drills"],
  antagonists: ["Tibialis_Anterior_R"],
  cameraView: {
    position: { x: 1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Fibularis_Longus_R": {
  displayName: "Right Fibularis (Peroneus) Longus",
  group: "legs",
  description: "Everts the foot and supports arch during walking.",
  relatedExercises: ["Balance Drills", "Side Band Steps"],
  antagonists: ["Tibialis_Anterior_R"],
  cameraView: {
    position: { x: 1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Flexor_Digitorum_Longus_R": {
  displayName: "Right Flexor Digitorum Longus",
  group: "legs",
  description: "Flexes the lateral four toes and helps plantarflex the foot.",
  relatedExercises: ["Toe Grips", "Towel Curls"],
  antagonists: ["Extensor_Digitorum_Longus_R"],
  cameraView: {
    position: { x: 1.5, y: -2.5, z: 6 },
    target: { x: 0, y: -2.5, z: 0 }
  }
},
"Flexor_Hallucis_Longus_R": {
  displayName: "Right Flexor Hallucis Longus",
  group: "legs",
  description: "Flexes the big toe and supports foot during toe-off phase.",
  relatedExercises: ["Big Toe Curls", "Toe Press Holds"],
  antagonists: ["Extensor_Hallucis_Longus_R"],
  cameraView: {
    position: { x: 1.5, y: -2.5, z: 6 },
    target: { x: 0, y: -2.5, z: 0 }
  }
},
"Patellar_Ligament_R": {
  displayName: "Right Patellar Ligament (Structure)",
  group: "legs",
  description: "Connects the kneecap to the tibia, vital for knee extension.",
  relatedExercises: ["Leg Extensions", "Knee Strengthening"],
  antagonists: [],
  cameraView: {
    position: { x: 0, y: -1.2, z: 6 },
    target: { x: 0, y: -1.2, z: 0 }
  }
},
"Flexor_Digitorum_Longus": {
  displayName: "Left Flexor Digitorum Longus",
  group: "legs",
  description: "Flexes the lateral four toes and assists with plantarflexion.",
  relatedExercises: ["Toe Curls", "Towel Grabs"],
  antagonists: ["Extensor_Digitorum_Longus"],
  cameraView: {
    position: { x: -1.5, y: -2.5, z: 6 },
    target: { x: 0, y: -2.5, z: 0 }
  }
},
"Flexor_Hallucis_Longus": {
  displayName: "Left Flexor Hallucis Longus",
  group: "legs",
  description: "Flexes the big toe and supports push-off during walking.",
  relatedExercises: ["Toe Presses", "Big Toe Curls"],
  antagonists: ["Extensor_Hallucis_Longus"],
  cameraView: {
    position: { x: -1.5, y: -2.5, z: 6 },
    target: { x: 0, y: -2.5, z: 0 }
  }
},
"Tibialis_Anterior": {
  displayName: "Left Tibialis Anterior",
  group: "legs",
  description: "Dorsiflexes and inverts the foot; supports ankle stability.",
  relatedExercises: ["Toe Raises", "Resistance Band Dorsiflexion"],
  antagonists: ["Gastrocnemius_Lateral_Medial"],
  cameraView: {
    position: { x: -1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Extensor_Hallucis_Longus": {
  displayName: "Left Extensor Hallucis Longus",
  group: "legs",
  description: "Extends the big toe and aids in dorsiflexion.",
  relatedExercises: ["Big Toe Raises", "Toe Band Lifts"],
  antagonists: ["Flexor_Hallucis_Longus"],
  cameraView: {
    position: { x: -1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Extensor_Digitorum_Longus": {
  displayName: "Left Extensor Digitorum Longus",
  group: "legs",
  description: "Extends the toes and dorsiflexes the foot.",
  relatedExercises: ["Toe Raises", "Foot Band Extensions"],
  antagonists: ["Flexor_Digitorum_Longus"],
  cameraView: {
    position: { x: -1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Fibularis_Brevis": {
  displayName: "Left Fibularis (Peroneus) Brevis",
  group: "legs",
  description: "Everts the foot and supports balance during motion.",
  relatedExercises: ["Ankle Rolls", "Band Eversion"],
  antagonists: ["Tibialis_Anterior"],
  cameraView: {
    position: { x: -1.5, y: -2, z: 6 },
    target: { x: 0, y: -2, z: 0 }
  }
},
"Fibularis_Longus": {
  displayName: "Left Fibularis (Peroneus) Longus",
  group: "legs",
  description: "Everts the foot and supports arch during gait.",
  relatedExercises: ["Banded Eversions", "Lateral Walks"],
  antagonists: ["Tibialis_Anterior"],
  cameraView: {
    position: { x: -1.5, y: -2, z: 6 },
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