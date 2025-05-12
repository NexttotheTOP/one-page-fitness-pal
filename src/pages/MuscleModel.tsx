import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, Info, Maximize, Minimize, Play, Pause, RotateCcw, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { muscleMap, getMuscleView, getGroupView } from '@/lib/muscleMap';
import { useModelStore } from '@/lib/modelStore';

// Path to your 3D model
const MODEL_PATH = '/models/muscle-model.glb';

// TypeScript interface for Model props
interface ModelProps {
  animationFrame: number;
  selectedMuscles: string[];
  setSelectedMuscles: (names: string[]) => void;
}

function Model({ animationFrame = 0, selectedMuscles, setSelectedMuscles }: ModelProps) {
  const groupRef = useRef<any>(null);
  const { scene, animations, nodes } = useGLTF(MODEL_PATH);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (scene) {
      try {
        scene.scale.set(2, 2, 2);
        // Position the model with feet at the bottom
        // Move it down on the Y axis
        scene.position.set(0, -1.75, 0);
        
        // First reset ALL colors to original
        scene.traverse((object) => {
          if (object.isMesh) {
            // Clone the material if it hasn't been cloned yet
            if (!object.userData._originalMaterial) {
              object.userData._originalMaterial = object.material.clone();
              object.material = object.material.clone();
            }
            // Store the original color ONCE
            if (!object.userData._originalColor) {
              object.userData._originalColor = object.material.color.clone();
            }
            // Store the original emissive ONCE (if the material supports it)
            if (object.material.emissive && !object.userData._originalEmissive) {
              object.userData._originalEmissive = object.material.emissive.clone();
            }

            // ALWAYS reset to original color first
            if (object.userData._originalColor) {
                object.material.color.copy(object.userData._originalColor);
            }
            
            // Reset to original emissive
            if (object.material.emissive && object.userData._originalEmissive !== undefined) {
              object.material.emissive.set(object.userData._originalEmissive);
            }

            // Set pointer cursor
            object.cursor = 'pointer';
          }
        });
        
        // Then highlight only the selected muscles if one is selected
        if (selectedMuscles && selectedMuscles.length > 0) {
          scene.traverse((object) => {
            if (object.isMesh && selectedMuscles.includes(object.name)) {
              object.material.color.set('#FFD600'); // bright yellow
              if (object.material.emissive) {
                object.material.emissive.set('#FFD600');
              }
            }
          });
        }
        
        // Apply animation frame if needed
        if (animations && animations.length > 0) {
          // Animation logic could be added here
          // This would control the shrinking muscle animation (frames 1-50)
        }
        setIsLoaded(true);
      } catch (err) {
        console.error("Error processing model:", err);
        setError("Failed to process the 3D model");
      }
    }
  }, [scene, animations, animationFrame, selectedMuscles]);

  // Handler for mesh click
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.object && e.object.name) {
      const muscleName = e.object.name;
      if (selectedMuscles.includes(muscleName)) {
        // Deselect if already selected
        setSelectedMuscles(selectedMuscles.filter(name => name !== muscleName));
      } else {
        // Add to selection
        setSelectedMuscles([...selectedMuscles, muscleName]);
      }
    }
  };

  // Handler for mesh hover (optional: you can add hover effect)
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  };

  if (error) {
    return null; // Errors will be handled by the parent component
  }

  return (
    <group ref={groupRef}>
      {isLoaded && (
        <primitive
          object={scene}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      )}
    </group>
  );
}

export default function MuscleModelPage() {
  // UI-specific state (keep these as React state)
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("view");
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Toast
  const { toast } = useToast();

  // Zustand store
  const {
    selectedMuscles,
    selectMuscles: setSelectedMuscles,
    animationFrame,
    setAnimationFrame,
    isAnimating,
    toggleAnimation,
    cameraPosition,
    setCameraPosition,
    cameraTarget,
    setCameraTarget,
    resetCamera
  } = useModelStore();
  
  // Handle model preloading
  useEffect(() => {
    const preloadModel = async () => {
      try {
        await useGLTF.preload(MODEL_PATH);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to preload model:", err);
        setLoadError("Could not load the 3D muscle model. Please refresh the page or try again later.");
      }
    };

    preloadModel();

    // Clean up any animation interval on unmount
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Handle animation frame changes
  const handleFrameChange = (value: number[]) => {
    setAnimationFrame(value[0]);
  };

  // Toggle fullscreen mode for the canvas
  const toggleFullScreen = () => {
    if (!canvasContainerRef.current) return;
    
    if (!isFullScreen) {
      if (canvasContainerRef.current.requestFullscreen) {
        canvasContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Start/stop animation playback
  const handleToggleAnimation = () => {
    if (isAnimating) {
      // Stop animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      toggleAnimation(false);
    } else {
      // Start animation
      animationRef.current = setInterval(() => {
        const nextFrame = animationFrame >= 50 ? 0 : animationFrame + 1;
        setAnimationFrame(nextFrame);
      }, 100);
      toggleAnimation(true);
    }
  };

  // Reset camera to default position
  const handleResetCamera = () => {
    if (orbitControlsRef.current) {
      resetCamera();
      orbitControlsRef.current.reset();
    }
  };

  // Function to focus camera on a specific muscle
  const focusOnMuscle = (muscleName: string) => {
    const muscle = muscleMap[muscleName];
    if (!muscle) return;
    // Use group view instead of individual muscle view
    const view = muscle.group ? getGroupView(muscle.group, 'front') : null;
    if (view) {
      setCameraPosition(view.position);
      setCameraTarget(view.target);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(view.target.x, view.target.y, view.target.z);
        orbitControlsRef.current.object.position.set(view.position.x, view.position.y, view.position.z);
        orbitControlsRef.current.update();
      }
    }
  };

  // Function to handle muscle selection with camera focus
  const handleMuscleSelect = (muscleName: string) => {
    if (!selectedMuscles.includes(muscleName)) {
      setSelectedMuscles([...selectedMuscles, muscleName]);
      focusOnMuscle(muscleName);
    } else {
      setSelectedMuscles(selectedMuscles.filter(m => m !== muscleName));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold text-fitness-charcoal">3D Muscle Explorer</h1>
        
        {loadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="view" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="view">Interactive View</TabsTrigger>
            <TabsTrigger value="info">Muscle Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4">
            {/* 3D Model Canvas - Made larger */}
            <div 
              ref={canvasContainerRef}
              className={`w-full ${isFullScreen ? 'h-screen' : 'h-[800px]'} bg-gray-50 rounded-lg overflow-hidden border relative flex-grow`}
            >
              {!isModelLoaded ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-fitness-purple" />
                    <p>Loading 3D muscle model...</p>
                  </div>
                </div>
              ) : (
                <Canvas 
                  // Enable shadow rendering
                  shadows 
                  // Device Pixel Ratio - [1,2] means it will use 1x for low-res devices and 2x for high-res
                  dpr={[1, 2]} 
                  // Camera settings:
                  // Position slightly higher and further back to see the full model
                  // Reduced FOV for less distortion
                  camera={{ 
                    position: [0, 0, 7], 
                    fov: 40,
                    near: 0.1,
                    far: 1000
                  }}
                >
                  {/* Ambient light provides overall scene illumination */}
                  <ambientLight intensity={0.75} />
                  
                  {/* Directional light simulates sunlight */}
                  <directionalLight
                    // Light source position in 3D space - adjusted to highlight the face better
                    position={[5, 8, 7.5]}
                    // Light brightness
                    intensity={1.5}
                    // Enable shadow casting
                    castShadow
                    // Shadow map resolution
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />
                  
                  {/* The 3D muscle model component */}
                  <Model
                    animationFrame={animationFrame}
                    selectedMuscles={selectedMuscles}
                    setSelectedMuscles={setSelectedMuscles}
                  />
                  
                  {/* Camera controls for user interaction */}
                  <OrbitControls 
                    ref={orbitControlsRef}
                    // Enable panning (moving camera left/right/up/down)
                    enablePan={true}
                    // Enable panning with keyboard
                    enablePanning={true}
                    // Make panning more responsive
                    panSpeed={1.5}
                    // Enable zooming in/out
                    enableZoom={true}
                    // Adjust zoom speed
                    zoomSpeed={1.2}
                    // Enable rotation around the model
                    enableRotate={true}
                    // Make rotation smoother
                    rotateSpeed={1.0}
                    // Minimum zoom distance
                    minDistance={2}
                    // Maximum zoom distance
                    maxDistance={15}
                    // Default target position (where the camera looks)
                    target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
                    // Limit vertical rotation to prevent looking too far below the model
                    maxPolarAngle={Math.PI * 0.85}
                    // Enable damping for smoother movement
                    enableDamping={true}
                    dampingFactor={0.1}
                    position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
                    onChange={(e) => {
                      // Update camera position in store when controls change
                      const pos = orbitControlsRef.current?.object?.position;
                      const target = orbitControlsRef.current?.target;
                      const zoom = orbitControlsRef.current?.object?.zoom;
                      if (pos && target && zoom !== undefined) {
                        setCameraPosition({ x: pos.x, y: pos.y, z: pos.z });
                        setCameraTarget({ x: target.x, y: target.y, z: target.z });
                        console.log(`Camera Position: x: ${pos.x}, y: ${pos.y}, z: ${pos.z}`);
                        console.log(`Camera Target: x: ${target.x}, y: ${target.y}, z: ${target.z}`);
                        console.log(`Zoom Level: ${zoom}`);
                      }
                    }}
                  />
                </Canvas>
              )}
              
              {/* Interaction hint - Changed to light blue */}
              {isModelLoaded && !isFullScreen && (
                <div className="absolute top-3 right-3 text-sm bg-blue-100/90 text-blue-800 backdrop-blur-sm py-1.5 px-4 rounded-full shadow-sm border border-blue-200">
                  <span>Drag to rotate • Right-click and drag to move • Scroll to zoom</span>
                </div>
              )}
              
              {/* Reset View button */}
              {isModelLoaded && !isFullScreen && (
                <div className="absolute top-16 right-3 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm border border-gray-200 shadow-sm"
                    onClick={handleResetCamera}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Reset View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm border border-gray-200 shadow-sm"
                    onClick={() => setSelectedMuscles([])}
                    disabled={selectedMuscles.length === 0}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
              
              {/* Floating controls */}
              {isModelLoaded && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAnimationFrame(0);
                      handleToggleAnimation();
                    }}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm"
                    className="bg-fitness-purple hover:bg-fitness-purple/90 h-8 px-3"
                    onClick={() => handleToggleAnimation()}
                  >
                    {isAnimating ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Slider
                    className="w-40 mx-2"
                    min={0}
                    max={50}
                    step={1}
                    value={[animationFrame]}
                    onValueChange={handleFrameChange}
                    disabled={isAnimating}
                  />
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={toggleFullScreen}
                  >
                    {isFullScreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Muscle Groups</CardTitle>
                <CardDescription>
                  Major muscle groups and their functions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-fitness-purple mb-2">Upper Body</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Biceps Brachii</strong> - Arm flexion and supination</li>
                      <li><strong>Deltoids</strong> - Shoulder movement (anterior, medial, posterior)</li>
                      <li><strong>Pectoralis Major</strong> - Chest muscles for arm movement</li>
                      <li><strong>Latissimus Dorsi</strong> - Back muscles for pulling movements</li>
                      <li><strong>Trapezius</strong> - Upper back and neck movement</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-fitness-purple mb-2">Lower Body</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Quadriceps</strong> - Front thigh muscles for leg extension</li>
                      <li><strong>Hamstrings</strong> - Rear thigh muscles for leg flexion</li>
                      <li><strong>Gluteus Maximus</strong> - Buttock muscles for hip extension</li>
                      <li><strong>Gastrocnemius & Soleus</strong> - Calf muscles</li>
                      <li><strong>Abdominals</strong> - Core muscles for trunk flexion and stability</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Animation Details</h3>
                  <p className="text-blue-700">
                    The 3D model shows muscle contractions. Use the controls to animate muscles and
                    visualize how they change during workouts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedMuscles.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl shadow-lg border border-gray-200 z-20 min-w-[400px] max-w-[90vw] max-h-[60vh] overflow-y-auto mt-4 mb-8 mx-auto">
          {/* Info Panel Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3 flex justify-between items-center">
            <h3 className="font-bold text-lg text-fitness-purple">Muscle Information</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 py-1"
                onClick={() => setSelectedMuscles([])}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-4">
            <Tabs defaultValue="selected" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="selected">Selected ({selectedMuscles.length})</TabsTrigger>
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
                <TabsTrigger value="antagonists">Antagonists</TabsTrigger>
              </TabsList>
              
              {/* Selected Muscles Tab */}
              <TabsContent value="selected" className="space-y-4">
                {selectedMuscles.map(muscle => {
                  const info = muscleMap[muscle];
                  return info ? (
                    <Card key={muscle} className="overflow-hidden">
                      <CardHeader className="py-3 px-4 bg-gray-50">
                        <CardTitle className="text-base font-medium flex justify-between items-center">
                          <span>{info.displayName}</span>
                          <span className="text-xs py-1 px-2 rounded-full bg-fitness-purple/10 text-fitness-purple capitalize">
                            {info.group}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3 px-4 space-y-2 text-sm">
                        <p>{info.description}</p>
                        
                        {info.relatedExercises.length > 0 && (
                          <div className="mt-2">
                            <h4 className="font-semibold text-xs text-gray-500 uppercase mb-1">Exercises</h4>
                            <div className="flex flex-wrap gap-1">
                              {info.relatedExercises.map(exercise => (
                                <span 
                                  key={exercise} 
                                  className="inline-block bg-blue-50 text-blue-700 rounded-md px-2 py-1 text-xs"
                                >
                                  {exercise}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {info.antagonists.length > 0 && (
                          <div className="mt-2">
                            <h4 className="font-semibold text-xs text-gray-500 uppercase mb-1">Antagonists</h4>
                            <div className="flex flex-wrap gap-1">
                              {info.antagonists.map(antagonist => (
                                <Button
                                  key={antagonist}
                                  variant="link"
                                  className="h-auto p-0 text-xs text-amber-600 underline underline-offset-2"
                                  onClick={() => handleMuscleSelect(antagonist)}
                                >
                                  {muscleMap[antagonist]?.displayName || antagonist}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div key={muscle} className="p-2 text-sm bg-gray-50 rounded">
                      <span className="text-gray-400">{muscle}</span> (Not in database)
                    </div>
                  );
                })}
              </TabsContent>
              
              {/* Exercises Tab */}
              <TabsContent value="exercises">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Combined Exercises</CardTitle>
                    <CardDescription>
                      All exercises for your selected muscles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    {(() => {
                      const allExercises = Array.from(
                        new Set(selectedMuscles.flatMap(muscle => muscleMap[muscle]?.relatedExercises || []))
                      );
                      
                      return allExercises.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {allExercises.map(exercise => (
                            <div 
                              key={exercise} 
                              className="bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm"
                            >
                              {exercise}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No exercises found for selected muscles.</div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Antagonists Tab */}
              <TabsContent value="antagonists">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Antagonist Muscles</CardTitle>
                    <CardDescription>
                      Opposing muscles to your selection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    {(() => {
                      const allAntagonists = Array.from(
                        new Set(selectedMuscles.flatMap(muscle => muscleMap[muscle]?.antagonists || []))
                      );
                      
                      return allAntagonists.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 gap-2 mb-4">
                            {allAntagonists.map(antagonist => (
                              <div 
                                key={antagonist} 
                                className="flex justify-between bg-amber-50 text-amber-800 rounded-lg px-3 py-2 text-sm items-center"
                              >
                                <span>{muscleMap[antagonist]?.displayName || antagonist}</span>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 bg-white border-amber-200 text-xs"
                                  onClick={() => handleMuscleSelect(antagonist)}
                                  disabled={selectedMuscles.includes(antagonist)}
                                >
                                  {selectedMuscles.includes(antagonist) ? 'Selected' : 'Select'}
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => {
                              const toAdd = allAntagonists.filter(m => !selectedMuscles.includes(m));
                              setSelectedMuscles([...selectedMuscles, ...toAdd]);
                            }}
                            disabled={allAntagonists.every(a => selectedMuscles.includes(a))}
                          >
                            Select All Antagonists
                          </Button>
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">No antagonist muscles found for your selection.</div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
} 