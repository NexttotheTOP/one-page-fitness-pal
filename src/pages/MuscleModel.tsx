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
import { io, Socket } from "socket.io-client";
import { initModelControlApi } from "../lib/modelControlApi";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Path to your 3D model
const MODEL_PATH = '/models/muscle-model.glb';

// TypeScript interface for Model props
interface ModelProps {
  animationFrame: number;
  highlightedMuscles: Record<string, string>;
  setHighlightedMuscles: (muscleColors: Record<string, string>) => void;
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 70%)`;
}

function Model({ animationFrame = 0, highlightedMuscles, setHighlightedMuscles }: ModelProps) {
  const groupRef = useRef<any>(null);
  const { scene, animations, nodes } = useGLTF(MODEL_PATH);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (scene) {
      try {
        scene.scale.set(2, 2, 2);
        scene.position.set(0, -1.75, 0);
        scene.traverse((object) => {
          if (object.isMesh) {
            if (!object.userData._originalMaterial) {
              object.userData._originalMaterial = object.material.clone();
              object.material = object.material.clone();
            }
            if (!object.userData._originalColor) {
              object.userData._originalColor = object.material.color.clone();
            }
            if (object.material.emissive && !object.userData._originalEmissive) {
              object.userData._originalEmissive = object.material.emissive.clone();
            }
            if (object.userData._originalColor) {
                object.material.color.copy(object.userData._originalColor);
            }
            if (object.material.emissive && object.userData._originalEmissive !== undefined) {
              object.material.emissive.set(object.userData._originalEmissive);
            }
            object.cursor = 'pointer';
          }
        });
        // Highlight muscles with their assigned color
        if (highlightedMuscles && Object.keys(highlightedMuscles).length > 0) {
          scene.traverse((object) => {
            if (object.isMesh && highlightedMuscles[object.name]) {
              object.material.color.set(highlightedMuscles[object.name]);
              if (object.material.emissive) {
                object.material.emissive.set(highlightedMuscles[object.name]);
              }
            }
          });
        }
        setIsLoaded(true);
      } catch (err) {
        console.error("Error processing model:", err);
        setError("Failed to process the 3D model");
      }
    }
  }, [scene, animations, animationFrame, highlightedMuscles]);

  // Handler for mesh click
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.object && e.object.name) {
      const muscleName = e.object.name;
      // Toggle highlight with default color yellow
      const newMap = { ...highlightedMuscles };
      if (newMap[muscleName]) {
        delete newMap[muscleName];
      } else {
        newMap[muscleName] = getRandomColor();
      }
      setHighlightedMuscles(newMap);
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

// --- Socket.io Chat Hook and ChatTester ---
function useModelChat() {
  const [messages, setMessages] = useState<{role: string; content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:8000");
    socketRef.current = socket;

    // Attach model control event handlers
    initModelControlApi(socket);

    // Listen for chat responses
    socket.on("model_response", (data) => {
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setMessages((msgs) => [...msgs, { role: "backend", content: data.response }]);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (msg: string) => {
    if (!msg.trim() || !socketRef.current) return;
    setError(null);
    setLoading(true);
    setMessages((msgs) => [...msgs, { role: "user", content: msg }]);
    socketRef.current.emit("model_message", {
      message: msg,
      thread_id: "test-thread-1",
      user_id: "test-user-1"
    });
  };

  return { messages, sendMessage, loading, error };
}

function ChatTester() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading, error } = useModelChat();
  const messageListRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl">
      {/* Chat Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="font-medium text-base text-fitness-charcoal">Model Assistant</h2>
        </div>
        <div className="text-xs text-gray-400">Connected to websocket</div>
      </div>
      
      {/* Messages Container */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 bg-gradient-to-b from-gray-50/30 to-white/30"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-70">
            <div className="w-12 h-12 mb-4 rounded-full bg-fitness-purple/10 flex items-center justify-center">
              <span className="text-fitness-purple text-xl">💬</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              Ask me anything about muscles, exercises, or how to use the 3D model.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-opacity animate-fadeIn`}
              style={{
                animationDelay: `${idx * 50}ms`,
                opacity: 0,
                animation: 'fadeIn 0.3s ease forwards'
              }}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-fitness-purple text-white shadow-md rounded-tr-none' 
                    : 'bg-transparent rounded-tl-none text-gray-800 shadow-none border-0'
                }`}
              >
                {msg.role !== 'user'
                  ? <div>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  : <div>{msg.content}</div>
                }
                <div className={`text-[10px] text-right mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start transition-opacity animate-fadeIn">
            <div className="bg-transparent rounded-2xl rounded-tl-none p-3 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-5 py-2 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      
      {/* Input Area */}
      <div className="px-4 py-3">
        <form
          className="flex items-center gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (input.trim() && !loading) {
              sendMessage(input);
              setInput("");
            }
          }}
        >
          <input
            className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 bg-white text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fitness-purple/30 focus:border-fitness-purple/50 transition-all"
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !loading && input.trim()) {
                e.preventDefault();
                sendMessage(input);
                setInput("");
              }
            }}
            disabled={loading}
          />
          <button
            type="submit"
            className={`rounded-full p-2.5 bg-fitness-purple text-white flex-shrink-0 shadow-sm hover:bg-fitness-purple/90 transition-all ${
              loading || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || !input.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
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
    highlightedMuscles,
    setHighlightedMuscles,
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
  const handleMuscleSelect = (muscleName: string, color: string = '#FFD600') => {
    const newMap = { ...highlightedMuscles };
    if (newMap[muscleName]) {
      delete newMap[muscleName];
    } else {
      newMap[muscleName] = color;
    }
    setHighlightedMuscles(newMap);
    focusOnMuscle(muscleName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container max-w-[1600px] mx-auto py-6 space-y-4 px-6">
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
          
          <TabsContent value="view" className="space-y-4 w-full">
            {/* Flex container for canvas and chat */}
            <div className="w-full">
              <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* 3D Model Canvas */}
                <div 
                  ref={canvasContainerRef}
                  className="w-full lg:w-3/5 h-[800px] bg-gray-50 rounded-lg overflow-hidden border relative"
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
                        highlightedMuscles={highlightedMuscles}
                        setHighlightedMuscles={setHighlightedMuscles}
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
                        onClick={() => setHighlightedMuscles({})}
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
                {/* Chat UI */}
                <div className="lg:w-2/5 w-full h-[800px] flex flex-col justify-between">
                  <ChatTester />
                </div>
              </div>
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

      {Object.keys(highlightedMuscles).length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm text-gray-800 rounded-xl shadow-lg border border-gray-200 z-20 min-w-[400px] max-w-[98%] max-h-[60vh] overflow-y-auto mt-4 mb-8 mx-auto">
          {/* Info Panel Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3 flex justify-between items-center">
            <h3 className="font-bold text-lg text-fitness-purple">Muscle Information</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 py-1"
                onClick={() => setHighlightedMuscles({})}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-4">
            <Tabs defaultValue="selected" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="selected">Selected ({Object.keys(highlightedMuscles).length})</TabsTrigger>
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
                <TabsTrigger value="antagonists">Antagonists</TabsTrigger>
              </TabsList>
              
              {/* Selected Muscles Tab */}
              <TabsContent value="selected" className="space-y-4">
                {Object.keys(highlightedMuscles).map(muscle => {
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
                        new Set(Object.keys(highlightedMuscles).flatMap(muscle => muscleMap[muscle]?.relatedExercises || []))
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
                        new Set(Object.keys(highlightedMuscles).flatMap(muscle => muscleMap[muscle]?.antagonists || []))
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
                                  disabled={Object.keys(highlightedMuscles).includes(antagonist)}
                                >
                                  {Object.keys(highlightedMuscles).includes(antagonist) ? 'Selected' : 'Select'}
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => {
                              const toAdd = allAntagonists.filter(m => !Object.keys(highlightedMuscles).includes(m));
                              const newMap = { ...highlightedMuscles };
                              toAdd.forEach(m => newMap[m] = '#FFD600');
                              setHighlightedMuscles(newMap);
                            }}
                            disabled={allAntagonists.every(a => Object.keys(highlightedMuscles).includes(a))}
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