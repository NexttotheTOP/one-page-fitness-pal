export const muscleMap = {
  // Arms - Biceps
  "Biceps_Brachii": {
    displayName: "Left Biceps",
    group: "arms",
    description: "Primary function is elbow flexion and forearm supination",
    relatedExercises: ["Bicep Curls", "Chin-ups", "Hammer Curls", "Concentration Curls"],
    antagonists: ["Triceps_Medial_Head", "Triceps_Lateral_Long_Heads"],
    cameraView: {
      position: { x: -3, y: 1, z: 5 },  // Left side view, slightly elevated
      target: { x: -1, y: 1, z: 0 }     // Focus on left bicep
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

  // Legs - Quadriceps
  "Rectus_Femoris": {
    displayName: "Left Rectus Femoris",
    group: "legs",
    description: "Front thigh muscle that crosses the hip and knee joints",
    relatedExercises: ["Squats", "Leg Extensions", "Lunges"],
    antagonists: ["Biceps_Femoris_Long_Head", "Semitendinosus", "Semimembranosus"]
  },
  "Rectus_Femoris_R": {
    displayName: "Right Rectus Femoris",
    group: "legs",
    description: "Front thigh muscle that crosses the hip and knee joints",
    relatedExercises: ["Squats", "Leg Extensions", "Lunges"],
    antagonists: ["Biceps_Femoris_Long_Head_R", "Semitendinosus_R", "Semimembranosus_R"]
  },
  "Vastus_Lateralis": {
    displayName: "Left Vastus Lateralis",
    group: "legs",
    description: "Largest part of the quadriceps on the outer thigh",
    relatedExercises: ["Squats", "Leg Press", "Step-ups"],
    antagonists: ["Biceps_Femoris_Short_Head"]
  },
  "Vastus_Lateralis_R": {
    displayName: "Right Vastus Lateralis",
    group: "legs",
    description: "Largest part of the quadriceps on the outer thigh",
    relatedExercises: ["Squats", "Leg Press", "Step-ups"],
    antagonists: ["Biceps_Femoris_Short_Head_R"]
  },
  "Vastus_Medialis": {
    displayName: "Left Vastus Medialis",
    group: "legs",
    description: "Teardrop-shaped muscle on the inner thigh, crucial for knee stability",
    relatedExercises: ["Bulgarian Split Squats", "Leg Extensions", "Hack Squats"],
    antagonists: []
  },
  "Vastus_Medialis_R": {
    displayName: "Right Vastus Medialis",
    group: "legs",
    description: "Teardrop-shaped muscle on the inner thigh, crucial for knee stability",
    relatedExercises: ["Bulgarian Split Squats", "Leg Extensions", "Hack Squats"],
    antagonists: []
  },
  "Vastus_Intermedius": {
    displayName: "Left Vastus Intermedius",
    group: "legs",
    description: "Deep quadriceps muscle located between vastus lateralis and vastus medialis",
    relatedExercises: ["Squats", "Leg Press", "Lunges"],
    antagonists: []
  },
  "Vastus_Intermedius_R": {
    displayName: "Right Vastus Intermedius",
    group: "legs",
    description: "Deep quadriceps muscle located between vastus lateralis and vastus medialis",
    relatedExercises: ["Squats", "Leg Press", "Lunges"],
    antagonists: []
  },

  // Legs - Hamstrings
  "Biceps_Femoris_Long_Head": {
    displayName: "Left Biceps Femoris (Long Head)",
    group: "legs",
    description: "Outer hamstring muscle, involved in knee flexion and hip extension",
    relatedExercises: ["Leg Curls", "Romanian Deadlifts", "Good Mornings"],
    antagonists: ["Rectus_Femoris"]
  },
  "Biceps_Femoris_Long_Head_R": {
    displayName: "Right Biceps Femoris (Long Head)",
    group: "legs",
    description: "Outer hamstring muscle, involved in knee flexion and hip extension",
    relatedExercises: ["Leg Curls", "Romanian Deadlifts", "Good Mornings"],
    antagonists: ["Rectus_Femoris_R"]
  },
  "Biceps_Femoris_Short_Head": {
    displayName: "Left Biceps Femoris (Short Head)",
    group: "legs",
    description: "Part of the outer hamstring, primarily involved in knee flexion",
    relatedExercises: ["Seated Leg Curls", "Nordic Hamstring Curls"],
    antagonists: ["Vastus_Lateralis"]
  },
  "Biceps_Femoris_Short_Head_R": {
    displayName: "Right Biceps Femoris (Short Head)",
    group: "legs",
    description: "Part of the outer hamstring, primarily involved in knee flexion",
    relatedExercises: ["Seated Leg Curls", "Nordic Hamstring Curls"],
    antagonists: ["Vastus_Lateralis_R"]
  },
  "Semitendinosus": {
    displayName: "Left Semitendinosus",
    group: "legs",
    description: "Inner hamstring muscle, important for knee and hip stability",
    relatedExercises: ["Leg Curls", "Glute-Ham Raises", "Deadlifts"],
    antagonists: ["Rectus_Femoris"]
  },
  "Semitendinosus_R": {
    displayName: "Right Semitendinosus",
    group: "legs",
    description: "Inner hamstring muscle, important for knee and hip stability",
    relatedExercises: ["Leg Curls", "Glute-Ham Raises", "Deadlifts"],
    antagonists: ["Rectus_Femoris_R"]
  },
  "Semimembranosus": {
    displayName: "Left Semimembranosus",
    group: "legs",
    description: "Deep inner hamstring muscle, involved in knee flexion and internal rotation",
    relatedExercises: ["Stiff-Leg Deadlifts", "Seated Leg Curls", "Good Mornings"],
    antagonists: ["Rectus_Femoris"]
  },
  "Semimembranosus_R": {
    displayName: "Right Semimembranosus",
    group: "legs",
    description: "Deep inner hamstring muscle, involved in knee flexion and internal rotation",
    relatedExercises: ["Stiff-Leg Deadlifts", "Seated Leg Curls", "Good Mornings"],
    antagonists: ["Rectus_Femoris_R"]
  },

  // Glutes
  "Gluteus_Maximus": {
    displayName: "Left Gluteus Maximus",
    group: "glutes",
    description: "Largest gluteal muscle, primary function is hip extension",
    relatedExercises: ["Squats", "Hip Thrusts", "Deadlifts", "Glute Bridges"],
    antagonists: []
  },
  "Gluteus_Maximus_R": {
    displayName: "Right Gluteus Maximus",
    group: "glutes",
    description: "Largest gluteal muscle, primary function is hip extension",
    relatedExercises: ["Squats", "Hip Thrusts", "Deadlifts", "Glute Bridges"],
    antagonists: []
  },
  "Gluteus_Medius": {
    displayName: "Left Gluteus Medius",
    group: "glutes",
    description: "Responsible for hip abduction and rotation, important for gait stability",
    relatedExercises: ["Clamshells", "Side Lying Hip Abductions", "Banded Lateral Walks"],
    antagonists: []
  },
  "Gluteus_Medius_R": {
    displayName: "Right Gluteus Medius",
    group: "glutes",
    description: "Responsible for hip abduction and rotation, important for gait stability",
    relatedExercises: ["Clamshells", "Side Lying Hip Abductions", "Banded Lateral Walks"],
    antagonists: []
  },
  "Gluteus_Minimus": {
    displayName: "Left Gluteus Minimus",
    group: "glutes",
    description: "Smallest gluteal muscle, assists with hip internal rotation and abduction",
    relatedExercises: ["Side Leg Raises", "Hip Abduction Machine", "Fire Hydrants"],
    antagonists: []
  },
  "Gluteus_Minimus_R": {
    displayName: "Right Gluteus Minimus",
    group: "glutes",
    description: "Smallest gluteal muscle, assists with hip internal rotation and abduction",
    relatedExercises: ["Side Leg Raises", "Hip Abduction Machine", "Fire Hydrants"],
    antagonists: []
  },

  // Core - Abdominals
  "Rectus_Abdominis": {
    displayName: "Left Rectus Abdominis",
    group: "core",
    description: "The 'six-pack' muscle, responsible for trunk flexion",
    relatedExercises: ["Crunches", "Leg Raises", "Planks", "Ab Rollouts"],
    antagonists: []
  },
  "Rectus_Abdominis_R": {
    displayName: "Right Rectus Abdominis",
    group: "core",
    description: "The 'six-pack' muscle, responsible for trunk flexion",
    relatedExercises: ["Crunches", "Leg Raises", "Planks", "Ab Rollouts"],
    antagonists: []
  },
  "External_Oblique": {
    displayName: "Left External Oblique",
    group: "core",
    description: "Side abdominal muscles, important for trunk rotation and lateral flexion",
    relatedExercises: ["Russian Twists", "Side Planks", "Woodchoppers"],
    antagonists: []
  },
  "External_Oblique_R": {
    displayName: "Right External Oblique",
    group: "core",
    description: "Side abdominal muscles, important for trunk rotation and lateral flexion",
    relatedExercises: ["Russian Twists", "Side Planks", "Woodchoppers"],
    antagonists: []
  },

  // Back - Latissimus Dorsi
  "Latissimus_Dorsi": {
    displayName: "Left Latissimus Dorsi",
    group: "back",
    description: "Large back muscle responsible for arm adduction and internal rotation",
    relatedExercises: ["Pull-ups", "Lat Pulldowns", "Rows", "T-Bar Rows"],
    antagonists: ["Deltoid_Anterior"]
  },
  "Latissimus_Dorsi_R": {
    displayName: "Right Latissimus Dorsi",
    group: "back",
    description: "Large back muscle responsible for arm adduction and internal rotation",
    relatedExercises: ["Pull-ups", "Lat Pulldowns", "Rows", "T-Bar Rows"],
    antagonists: ["Deltoid_Anterior_R"]
  },

  // Back - Trapezius
  "Trapezius_01_Upper": {
    displayName: "Left Upper Trapezius",
    group: "back",
    description: "Upper portion of the trapezius, elevates the scapula",
    relatedExercises: ["Shrugs", "Upright Rows", "Face Pulls"],
    antagonists: []
  },
  "Trapezius_01_Upper_R": {
    displayName: "Right Upper Trapezius",
    group: "back",
    description: "Upper portion of the trapezius, elevates the scapula",
    relatedExercises: ["Shrugs", "Upright Rows", "Face Pulls"],
    antagonists: []
  },
  "Trapezius_02_Middle": {
    displayName: "Left Middle Trapezius",
    group: "back",
    description: "Middle fibers of the trapezius, retract the scapula",
    relatedExercises: ["Rows", "Face Pulls", "Reverse Flyes"],
    antagonists: ["Pectoralis_Major"]
  },
  "Trapezius_02_Middle_R": {
    displayName: "Right Middle Trapezius",
    group: "back",
    description: "Middle fibers of the trapezius, retract the scapula",
    relatedExercises: ["Rows", "Face Pulls", "Reverse Flyes"],
    antagonists: ["Pectoralis_Major_R"]
  },
  "Trapezius_03_Lower": {
    displayName: "Left Lower Trapezius",
    group: "back",
    description: "Lower fibers of the trapezius, depress the scapula",
    relatedExercises: ["Y-Raises", "Prone Trap Raises", "Pull-ups"],
    antagonists: []
  },
  "Trapezius_03_Lower_R": {
    displayName: "Right Lower Trapezius",
    group: "back",
    description: "Lower fibers of the trapezius, depress the scapula",
    relatedExercises: ["Y-Raises", "Prone Trap Raises", "Pull-ups"],
    antagonists: []
  },

  // Legs - Calves
  "Gastrocnemius_Lateral_Medial": {
    displayName: "Left Gastrocnemius",
    group: "legs",
    description: "Large calf muscle visible from the surface, primary ankle plantarflexor",
    relatedExercises: ["Standing Calf Raises", "Jump Rope", "Box Jumps"],
    antagonists: []
  },
  "Gastrocnemius_Lateral_Medial_R": {
    displayName: "Right Gastrocnemius",
    group: "legs",
    description: "Large calf muscle visible from the surface, primary ankle plantarflexor",
    relatedExercises: ["Standing Calf Raises", "Jump Rope", "Box Jumps"],
    antagonists: []
  },
  "Soleus": {
    displayName: "Left Soleus",
    group: "legs",
    description: "Deep calf muscle beneath the gastrocnemius, important for walking and standing",
    relatedExercises: ["Seated Calf Raises", "Calf Press", "Donkey Calf Raises"],
    antagonists: []
  },
  "Soleus_R": {
    displayName: "Right Soleus",
    group: "legs",
    description: "Deep calf muscle beneath the gastrocnemius, important for walking and standing",
    relatedExercises: ["Seated Calf Raises", "Calf Press", "Donkey Calf Raises"],
    antagonists: []
  }
};

// Reverse mapping function to get all technical model identifiers for a general muscle group
export const getMusclesByGroup = (groupName) => {
  return Object.entries(muscleMap)
    .filter(([_, data]) => data.group === groupName)
    .map(([key, _]) => key);
};

// Get all muscles that are antagonists to the given muscle
export const getAntagonists = (muscleName) => {
  if (!muscleMap[muscleName]) return [];
  return muscleMap[muscleName].antagonists;
};

// Get all exercises for a given muscle
export const getExercisesForMuscle = (muscleName) => {
  if (!muscleMap[muscleName]) return [];
  return muscleMap[muscleName].relatedExercises;
};

// Get unique list of all muscle groups
export const getAllMuscleGroups = () => {
  const groups = new Set();
  Object.values(muscleMap).forEach(muscle => {
    groups.add(muscle.group);
  });
  return [...groups];
};

// Add group views
export const groupViews = {
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
  }
};

// Get camera view for a specific muscle
export function getMuscleView(muscleName) {
  const muscle = muscleMap[muscleName];
  return muscle ? muscle.cameraView : null;
}

// Get camera view for a muscle group
export function getGroupView(groupName, viewType = 'front') {
  return groupViews[groupName]?.[viewType] || null;
}

// Get best view for multiple muscles
export function getBestViewForMuscles(muscleNames) {
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