import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Html } from '@react-three/drei';
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
import { useAuth } from '@/lib/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

// Label positioning constants
const LABEL_OFFSET_X = 0.6; // Increased horizontal offset
const LABEL_OFFSET_Y = 0.0; // No vertical offset initially
const LABEL_SPACING = 0.25; // Increased vertical spacing between labels
const LEFT_SIDE = -1;
const RIGHT_SIDE = 1;

// Interface for MuscleLabel props
interface MuscleLabelProps {
  position: any; // Using any to avoid TypeScript errors
  muscleName: string;
  color: string;
  index: number; // Add index for better positioning
  totalOnSide: number; // Add total count on this side for distribution
}

// Simplified muscle label component using Html from drei
function MuscleLabel({ position, muscleName, color, index, totalOnSide }: MuscleLabelProps) {
  const [side, setSide] = useState<number>(RIGHT_SIDE);
  const displayName = muscleMap[muscleName]?.displayName || muscleName;
  
  // Determine which side to show the label based on x-position
  useEffect(() => {
    setSide(position.x > 0.1 ? LEFT_SIDE : RIGHT_SIDE);
  }, [position]);
  
  // Calculate label position with better distribution
  const labelPos = useMemo(() => {
    if (!position) return new THREE.Vector3(0, 0, 0);
    
    // Distribute labels vertically based on their index and total count
    const verticalRange = 2.0; // Total vertical range to distribute labels
    const verticalOffset = (index / totalOnSide) * verticalRange - (verticalRange / 2);
    
    return new THREE.Vector3(
      position.x + (side * LABEL_OFFSET_X),
      verticalOffset, // Position labels evenly along the model height
      position.z
    );
  }, [position, side, index, totalOnSide]);

  // Safeguard against rendering issues
  if (!position || !labelPos) {
    return null;
  }
  
  return (
    <Html
      position={labelPos}
      center
      distanceFactor={15}
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        color: '#333',
        padding: '1.5px 6px',
        borderRadius: '3px',
        fontSize: '4px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        border: `1px solid ${color}`,
        transform: `translateX(${side === LEFT_SIDE ? -7 : 7}px)`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.10)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span 
          style={{ 
            display: 'inline-block', 
            width: '4px',
            height: '4px',
            borderRadius: '50%', 
            backgroundColor: color,
            marginRight: '4px'
          }}
        />
        {displayName}
      </div>
    </Html>
  );
}

function Model({ animationFrame = 0, highlightedMuscles, setHighlightedMuscles, showLabels = true }: ModelProps & { showLabels?: boolean }) {
  const groupRef = useRef<any>();
  const { scene, animations, nodes } = useGLTF(MODEL_PATH);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labelPositions, setLabelPositions] = useState<Map<string, any>>(new Map());
  
  // Process the mesh positions for labels
  /*
  useEffect(() => {
    if (!scene || !isLoaded) return;
    
    try {
      const positions = new Map<string, any>();
      
      // Calculate best position for each muscle mesh's label
      Object.keys(highlightedMuscles).forEach(muscleName => {
        const mesh = scene.getObjectByName(muscleName);
        if (!mesh) return;
        
        try {
          const pos = new THREE.Vector3();
          mesh.getWorldPosition(pos);
          
          // Only store valid positions
          if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) return;
          
          positions.set(muscleName, pos);
        } catch (err) {
          console.warn(`Error getting position for ${muscleName}:`, err);
        }
      });
      
      // No valid positions found, don't update
      if (positions.size === 0) return;
      
      // Divide positions into left and right sides based on x-coordinate
      const rightSide: Array<{ key: string, pos: any }> = [];
      const leftSide: Array<{ key: string, pos: any }> = [];
      
      // Sort into left/right sides based on X position
      positions.forEach((pos, key) => {
        if (pos.x > 0.1) {
          leftSide.push({ key, pos });
        } else {
          rightSide.push({ key, pos });
        }
      });
      
      setLabelPositions(positions);
    } catch (err) {
      console.error("Error processing label positions:", err);
    }
  }, [scene, highlightedMuscles, isLoaded]);
  */

  useEffect(() => {
    if (scene) {
      try {
        scene.scale.set(2.2, 2.2, 2.2);
        scene.position.set(0, -2.2, 0);
        scene.traverse((object) => {
          if (object.isMesh) {
            // Only set original color/material/emissive ONCE, ever
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
          }
        });

        // Always reset to original before applying highlights
        scene.traverse((object) => {
          if (object.isMesh) {
            if (object.userData._originalColor) {
              object.material.color.copy(object.userData._originalColor);
            }
            if (object.material.emissive && object.userData._originalEmissive !== undefined) {
              object.material.emissive.set(object.userData._originalEmissive);
            }
            object.cursor = 'pointer';
          }
        });

        // Now apply highlights
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
        <>
          <primitive
            object={scene}
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
          
          {/* Render muscle labels with improved positioning 
          {showLabels && (
            <group>
              {Object.entries(highlightedMuscles).map(([muscleName, color], idx) => {
                const position = labelPositions.get(muscleName);
                if (!position) return null;
                
                // Determine which side this label is on
                const isRightSide = position.x <= 0.1;
                
                // Count total labels on this side for distribution
                const totalOnSide = Object.entries(highlightedMuscles)
                  .filter(([_, __], i) => {
                    const pos = labelPositions.get(Object.keys(highlightedMuscles)[i]);
                    return pos && (pos.x <= 0.1) === isRightSide;
                  }).length;
                
                // Calculate index among labels on this side
                const sideIndex = Object.entries(highlightedMuscles)
                  .filter(([key, _], i) => {
                    const pos = labelPositions.get(key);
                    return pos && (pos.x <= 0.1) === isRightSide && 
                      Object.keys(highlightedMuscles).indexOf(key) < 
                      Object.keys(highlightedMuscles).indexOf(muscleName);
                  }).length;
                
                return (
                  <MuscleLabel
                    key={muscleName}
                    position={position}
                    muscleName={muscleName}
                    color={color}
                    index={sideIndex}
                    totalOnSide={Math.max(1, totalOnSide)}
                  />
                );
              })}
            </group>
          )} */}
        </>
      )}
    </group>
  );
}

// Utility to get or create a session-based thread ID
function getSessionThreadId() {
  let threadId = localStorage.getItem('muscleModelThreadId');
  if (!threadId) {
    threadId = crypto.randomUUID();
    localStorage.setItem('muscleModelThreadId', threadId);
  }
  return threadId;
}

// --- Socket.io Chat Hook and ChatTester ---
// Update useModelChat to accept userId and threadId
function useModelChat(userId: string | undefined, threadId: string) {
  const [messages, setMessages] = useState<{role: string; content: string; id?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [hasReceivedToken, setHasReceivedToken] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const socket = io("https://web-production-aafa6.up.railway.app");
    socketRef.current = socket;

    // Attach model control event handlers
    initModelControlApi(socket);

    // We'll keep the old non-streaming response handler for fallback compatibility
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
      // Clean up event source if it exists
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      socket.disconnect();
    };
  }, []);

  const sendMessage = (msg: string) => {
    if (!msg.trim() || !socketRef.current || !userId) return;
    
    setError(null);
    setLoading(true);
    setIsThinking(false);
    setHasReceivedToken(false);
    
    // Add user message to UI
    const messageId = crypto.randomUUID();
    setMessages((msgs) => [...msgs, { role: "user", content: msg, id: messageId }]);
    
    // Add empty assistant message that will be filled with streaming content
    const assistantMsgId = crypto.randomUUID();
    setMessages((msgs) => [...msgs, { role: "backend", content: "", id: assistantMsgId }]);
    
    // First notify via socket that we're starting a conversation
    socketRef.current.emit("model_start", {
      message: msg,
      thread_id: threadId,
      user_id: userId
    });
    
    // Clean up any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Create URL with parameters
    const params = new URLSearchParams({
      message: msg,
      thread_id: threadId,
      user_id: userId
    });
    
    // Create new EventSource for token streaming
    const eventSource = new EventSource(`https://web-production-aafa6.up.railway.app/model/token-stream?${params}`);
    eventSourceRef.current = eventSource;
    
    let accumulatedText = "";
    
    // Handle metadata event
    eventSource.addEventListener('metadata', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received metadata:", data);
        // Store any metadata if needed
      } catch (err) {
        console.error("Error parsing metadata:", err);
      }
    });
    
    // Handle thinking state
    eventSource.addEventListener('thinking', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Model thinking:", data);
        setIsThinking(true);
      } catch (err) {
        console.error("Error parsing thinking event:", err);
      }
    });
    
    // Handle token streaming
    eventSource.addEventListener('token', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.content) {
          setIsThinking(false);
          setHasReceivedToken(true);
          accumulatedText += data.content;
          // Update UI with accumulated text so far
          setMessages((msgs) => 
            msgs.map(m => 
              m.id === assistantMsgId 
                ? { ...m, content: accumulatedText } 
                : m
            )
          );
        }
      } catch (err) {
        console.error("Error parsing token:", err);
      }
    });
    
    // Handle complete message (full response)
    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.response) {
          setIsThinking(false);
          // Update with the complete response
          // This might override individual tokens if both are sent
          setMessages((msgs) => 
            msgs.map(m => 
              m.id === assistantMsgId 
                ? { ...m, content: data.response } 
                : m
            )
          );
        }
      } catch (err) {
        console.error("Error parsing complete response:", err);
      }
    });
    
    // Handle model events
    eventSource.addEventListener('event', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received model event via SSE:", data);
        // Process model events if needed
        // This could be a redundancy with socket.io events
      } catch (err) {
        console.error("Error parsing event:", err);
      }
    });
    
    // Handle completion
    eventSource.addEventListener('done', () => {
      console.log("Stream completed");
      eventSource.close();
      eventSourceRef.current = null;
      setLoading(false);
      setIsThinking(false);
    });
    
    // Handle errors
    eventSource.addEventListener('error', (err) => {
      console.error("EventSource error:", err);
      eventSource.close();
      eventSourceRef.current = null;
      setLoading(false);
      setIsThinking(false);
      setError("Connection error. Please try again.");
    });
  };

  return { messages, sendMessage, loading, isThinking, error, hasReceivedToken };
}

function ChatTester() {
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const threadId = useMemo(getSessionThreadId, []);
  const { messages, sendMessage, loading, isThinking, error, hasReceivedToken } = useModelChat(user?.id, threadId);
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
              Ask me anything about muscles, exercises, highlitghting specific muscle groups, or anything else you want to know about the human body.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={msg.id || idx} 
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
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="prose prose-sm max-w-none mb-2">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 my-1.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5">{children}</ol>,
                          li: ({ children }) => <li className="my-0.5">{children}</li>,
                          h3: ({ children }) => <h3 className="text-lg font-semibold my-2">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-md font-semibold my-1.5">{children}</h4>,
                          a: ({ children, href }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                            >
                              {children}
                            </a>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500 text-sm">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto my-2 text-sm">
                              {children}
                            </pre>
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
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
        
        {/* Thinking/Loading indicator */}
        {(isThinking && !hasReceivedToken) && (
          <div className="flex justify-start transition-opacity animate-fadeIn">
            <div className="bg-transparent rounded-2xl rounded-tl-none p-3 flex items-center space-x-2 text-gray-500 text-sm font-medium">
              <span>Thinking...</span>
            </div>
          </div>
        )}
        {(loading && !isThinking && !hasReceivedToken) && (
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

// Utility functions for spherical interpolation
interface SphericalCoords {
  radius: number;
  theta: number;  // horizontal angle (azimuth)
  phi: number;    // vertical angle (polar)
}

// Convert from Cartesian (x,y,z) to Spherical (radius, theta, phi)
function cartesianToSpherical(position: {x: number, y: number, z: number}, center: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0}): SphericalCoords {
  // Calculate relative position to center
  const x = position.x - center.x;
  const y = position.y - center.y;
  const z = position.z - center.z;
  
  // Calculate radius (distance from center)
  const radius = Math.sqrt(x * x + y * y + z * z);
  
  // Calculate theta (horizontal angle, 0 to 2π)
  let theta = Math.atan2(x, z);
  
  // Calculate phi (vertical angle, 0 to π)
  const phi = Math.acos(Math.max(-1, Math.min(1, y / radius)));
  
  return { radius, theta, phi };
}

// Convert from Spherical (radius, theta, phi) to Cartesian (x,y,z)
function sphericalToCartesian(spherical: SphericalCoords, center: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0}): {x: number, y: number, z: number} {
  const { radius, theta, phi } = spherical;
  
  // Calculate Cartesian coordinates
  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  
  // Add center offset
  return {
    x: x + center.x,
    y: y + center.y,
    z: z + center.z
  };
}

// Interpolate between two spherical coordinates
function interpolateSpherical(start: SphericalCoords, end: SphericalCoords, t: number): SphericalCoords {
  // Normalize angles to avoid discontinuities when crossing 2π
  let startTheta = start.theta;
  let endTheta = end.theta;
  
  // Ensure we take the shortest path around the circle
  const deltaTheta = endTheta - startTheta;
  if (deltaTheta > Math.PI) {
    startTheta += 2 * Math.PI;
  } else if (deltaTheta < -Math.PI) {
    endTheta += 2 * Math.PI;
  }
  
  return {
    radius: start.radius + (end.radius - start.radius) * t,
    theta: startTheta + (endTheta - startTheta) * t,
    phi: start.phi + (end.phi - start.phi) * t
  };
}

// Now update the CameraController interface to include spherical coordinates
interface CameraControllerProps {
  isAnimatingCamera: boolean;
  setIsAnimatingCamera: React.Dispatch<React.SetStateAction<boolean>>;
  currentCameraPosition: React.MutableRefObject<{x: number; y: number; z: number}>;
  currentCameraTarget: React.MutableRefObject<{x: number; y: number; z: number}>;
  targetCameraPosition: React.MutableRefObject<{x: number; y: number; z: number}>;
  targetCameraTarget: React.MutableRefObject<{x: number; y: number; z: number}>;
  isProgrammaticUpdate: React.MutableRefObject<boolean>;
  orbitControlsRef: React.MutableRefObject<any>;
  animationSpeed?: number;
}

// Update the CameraController to fix reliability issues
function CameraController({
  isAnimatingCamera,
  setIsAnimatingCamera,
  currentCameraPosition,
  currentCameraTarget,
  targetCameraPosition,
  targetCameraTarget,
  isProgrammaticUpdate,
  orbitControlsRef,
  animationSpeed = 0.05
}: CameraControllerProps) {
  // Get access to the Three.js camera and renderer
  const { camera, gl } = useThree();
  
  // Add a ref to track if user is actively controlling the camera
  const userControlActive = useRef(false);
  const userControlTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Add refs for spherical interpolation
  const modelCenter = useRef({x: 0, y: 0, z: 0}); // Center of rotation, typically model center
  const startSpherical = useRef<SphericalCoords>({radius: 7, theta: 0, phi: Math.PI / 2});
  const targetSpherical = useRef<SphericalCoords>({radius: 7, theta: 0, phi: Math.PI / 2});
  const currentProgress = useRef(0);
  const isFrontToBackTransition = useRef(false);
  
  // Reference to track the last target position for detecting changes
  const lastTargetPosition = useRef({...targetCameraPosition.current});
  
  // Add a cleanup cooldown flag
  const animationCleanupInProgress = useRef(false);
  const animationCleanupTimer = useRef<NodeJS.Timeout | null>(null);

  // Set up user interaction detection
  useEffect(() => {
    if (!gl.domElement) return;
    
    // When user starts interacting with the canvas, stop animation
    const handleUserInteractionStart = () => {
      // Set flag indicating user is controlling camera
      userControlActive.current = true;
      
      // Stop animation immediately when user interacts
      if (isAnimatingCamera) {
        setIsAnimatingCamera(false);
      }
      
      // Clear any existing timer
      if (userControlTimer.current) {
        clearTimeout(userControlTimer.current);
        userControlTimer.current = null;
      }
      
      // Force camera to current position directly (no animation)
      if (orbitControlsRef.current) {
        const controls = orbitControlsRef.current;
        
        // Update animation targets to match current position
        currentCameraPosition.current = { 
          x: camera.position.x, 
          y: camera.position.y, 
          z: camera.position.z 
        };
        
        currentCameraTarget.current = {
          x: controls.target.x,
          y: controls.target.y,
          z: controls.target.z
        };
        
        // Also update target positions
        targetCameraPosition.current = { ...currentCameraPosition.current };
        targetCameraTarget.current = { ...currentCameraTarget.current };
        
        // Update spherical coordinates
        startSpherical.current = cartesianToSpherical(currentCameraPosition.current, modelCenter.current);
        targetSpherical.current = startSpherical.current;
        
        // Reset transition state
        isFrontToBackTransition.current = false;
        currentProgress.current = 0;
      }
    };
    
    // When user stops interacting, set a timer before allowing animations again
    const handleUserInteractionEnd = () => {
      // Clear existing timer
      if (userControlTimer.current) {
        clearTimeout(userControlTimer.current);
      }
      
      // Set a timer to release user control after a delay
      userControlTimer.current = setTimeout(() => {
        userControlActive.current = false;
        userControlTimer.current = null;
      }, 300); // 300ms delay before accepting programmatic camera moves again
    };
    
    // Add event listeners for mouse and touch interactions
    const domElement = gl.domElement;
    domElement.addEventListener('mousedown', handleUserInteractionStart);
    domElement.addEventListener('touchstart', handleUserInteractionStart);
    domElement.addEventListener('mouseup', handleUserInteractionEnd);
    domElement.addEventListener('touchend', handleUserInteractionEnd);
    
    // Cleanup
    return () => {
      domElement.removeEventListener('mousedown', handleUserInteractionStart);
      domElement.removeEventListener('touchstart', handleUserInteractionStart);
      domElement.removeEventListener('mouseup', handleUserInteractionEnd);
      domElement.removeEventListener('touchend', handleUserInteractionEnd);
      
      if (userControlTimer.current) {
        clearTimeout(userControlTimer.current);
      }
      
      if (animationCleanupTimer.current) {
        clearTimeout(animationCleanupTimer.current);
      }
    };
  }, [gl, isAnimatingCamera, setIsAnimatingCamera, camera, orbitControlsRef]);
  
  // Effect to initialize spherical coordinates when animation starts or target changes
  useEffect(() => {
    if (!orbitControlsRef.current) return;
    
    // If animation cleanup is in progress, don't start a new animation yet
    if (animationCleanupInProgress.current) {
      console.log("Animation cleanup in progress, delaying new animation");
      return;
    }
    
    // Check if target position has changed
    const hasTargetChanged = (
      targetCameraPosition.current.x !== lastTargetPosition.current.x ||
      targetCameraPosition.current.y !== lastTargetPosition.current.y ||
      targetCameraPosition.current.z !== lastTargetPosition.current.z
    );
    
    // Only recalculate spherical coordinates when target changes or animation starts
    if (isAnimatingCamera && hasTargetChanged) {
      console.log("New animation starting with target:", targetCameraPosition.current);
      
      // Update last target reference
      lastTargetPosition.current = { ...targetCameraPosition.current };
      
      // Always calculate fresh spherical coordinates from current Cartesian positions
      const startPos = cartesianToSpherical(currentCameraPosition.current, modelCenter.current);
      const targetPos = cartesianToSpherical(targetCameraPosition.current, modelCenter.current);
      
      // Robust detection of front-to-back transition:
      // 1. Calculate dot product between direction vectors (from center to camera)
      const startDir = {
        x: currentCameraPosition.current.x - modelCenter.current.x,
        y: currentCameraPosition.current.y - modelCenter.current.y,
        z: currentCameraPosition.current.z - modelCenter.current.z
      };
      
      const targetDir = {
        x: targetCameraPosition.current.x - modelCenter.current.x,
        y: targetCameraPosition.current.y - modelCenter.current.y,
        z: targetCameraPosition.current.z - modelCenter.current.z
      };
      
      // Normalize vectors
      const startDirLength = Math.sqrt(startDir.x * startDir.x + startDir.y * startDir.y + startDir.z * startDir.z);
      const targetDirLength = Math.sqrt(targetDir.x * targetDir.x + targetDir.y * targetDir.y + targetDir.z * targetDir.z);
      
      // Calculate dot product (if close to -1, directions are nearly opposite)
      const dotProduct = (
        (startDir.x * targetDir.x + startDir.y * targetDir.y + startDir.z * targetDir.z) / 
        (startDirLength * targetDirLength)
      );
      
      // If dot product is negative, vectors point in opposite hemispheres
      // This is a more reliable way to detect front-to-back transitions
      isFrontToBackTransition.current = dotProduct < -0.3;
      
      console.log('Transition type:', isFrontToBackTransition.current ? 'Orbital (front-to-back)' : 'Linear');
      console.log('Dot product:', dotProduct);
      
      // Store the spherical coordinates
      startSpherical.current = startPos;
      targetSpherical.current = targetPos;
      
      // Reset progress for new animation
      currentProgress.current = 0;
    }
  }, [isAnimatingCamera, targetCameraPosition.current, currentCameraPosition.current, orbitControlsRef.current]);
  
  // Set up the animation loop with useFrame
  useFrame(() => {
    // Skip animation if user is controlling, animation is off, or cleanup is in progress
    if (!isAnimatingCamera || !orbitControlsRef.current || userControlActive.current || animationCleanupInProgress.current) return;
    
    const controls = orbitControlsRef.current;
    
    // Cap animation speed to prevent issues with very high values
    const clampedSpeed = Math.min(animationSpeed, 0.8);
    
    if (isFrontToBackTransition.current) {
      // Use spherical interpolation for front-to-back transitions
      
      // Increment progress (using animation speed)
      currentProgress.current += clampedSpeed * 0.8; // Slow down orbital transitions slightly
      currentProgress.current = Math.min(currentProgress.current, 1);
      
      // Interpolate between start and target spherical coordinates
      const interpolated = interpolateSpherical(
        startSpherical.current, 
        targetSpherical.current, 
        currentProgress.current
      );
      
      // Convert back to Cartesian coordinates
      const newPosition = sphericalToCartesian(interpolated, modelCenter.current);
      
      // Update camera position
      currentCameraPosition.current = newPosition;
      
      // Lerp the target position (center of the model usually stays fixed)
      currentCameraTarget.current = {
        x: currentCameraTarget.current.x + (targetCameraTarget.current.x - currentCameraTarget.current.x) * clampedSpeed,
        y: currentCameraTarget.current.y + (targetCameraTarget.current.y - currentCameraTarget.current.y) * clampedSpeed,
        z: currentCameraTarget.current.z + (targetCameraTarget.current.z - currentCameraTarget.current.z) * clampedSpeed
      };
      
      // If progress is complete, end animation
      if (currentProgress.current >= 1) {
        // Set cleanup flag
        animationCleanupInProgress.current = true;
        
        // Ensure we're exactly at the target position at the end
        currentCameraPosition.current = { ...targetCameraPosition.current };
        currentCameraTarget.current = { ...targetCameraTarget.current };
        
        // Update camera and controls
        camera.position.set(
          currentCameraPosition.current.x,
          currentCameraPosition.current.y,
          currentCameraPosition.current.z
        );
        
        if (controls.target) {
          controls.target.set(
            currentCameraTarget.current.x,
            currentCameraTarget.current.y,
            currentCameraTarget.current.z
          );
          controls.update();
        }
        
        // Clean up state
        setIsAnimatingCamera(false);
        currentProgress.current = 0;
        isFrontToBackTransition.current = false;
        
        // Use a short timer to ensure state updates are processed
        // before allowing a new animation to start
        if (animationCleanupTimer.current) {
          clearTimeout(animationCleanupTimer.current);
        }
        animationCleanupTimer.current = setTimeout(() => {
          animationCleanupInProgress.current = false;
          animationCleanupTimer.current = null;
          console.log("Animation cleanup complete, ready for new animation");
        }, 50); // Short cooldown period
        
        return; // Skip the rest of the frame
      }
    } else {
      // Use standard linear interpolation for normal camera movements
      
      // Animation speed/smoothness factor
      const lerpFactor = clampedSpeed; 
      
      // Lerp the current position toward the target
      currentCameraPosition.current = {
        x: currentCameraPosition.current.x + (targetCameraPosition.current.x - currentCameraPosition.current.x) * lerpFactor,
        y: currentCameraPosition.current.y + (targetCameraPosition.current.y - currentCameraPosition.current.y) * lerpFactor,
        z: currentCameraPosition.current.z + (targetCameraPosition.current.z - currentCameraPosition.current.z) * lerpFactor
      };
      
      // Lerp the current target toward the target
      currentCameraTarget.current = {
        x: currentCameraTarget.current.x + (targetCameraTarget.current.x - currentCameraTarget.current.x) * lerpFactor,
        y: currentCameraTarget.current.y + (targetCameraTarget.current.y - currentCameraTarget.current.y) * lerpFactor,
        z: currentCameraTarget.current.z + (targetCameraTarget.current.z - currentCameraTarget.current.z) * lerpFactor
      };
      
      // Calculate if we're close enough to stop the animation
      const positionDistance = new THREE.Vector3(
        targetCameraPosition.current.x - currentCameraPosition.current.x,
        targetCameraPosition.current.y - currentCameraPosition.current.y,
        targetCameraPosition.current.z - currentCameraPosition.current.z
      ).length();
      
      const targetDistance = new THREE.Vector3(
        targetCameraTarget.current.x - currentCameraTarget.current.x,
        targetCameraTarget.current.y - currentCameraTarget.current.y,
        targetCameraTarget.current.z - currentCameraTarget.current.z
      ).length();
      
      // If we're close enough, stop animating
      if (positionDistance < 0.1 && targetDistance < 0.1) {
        // Set cleanup flag
        animationCleanupInProgress.current = true;
        
        // Ensure we're exactly at the target position at the end
        currentCameraPosition.current = { ...targetCameraPosition.current };
        currentCameraTarget.current = { ...targetCameraTarget.current };
        
        // Update camera and controls
        camera.position.set(
          currentCameraPosition.current.x,
          currentCameraPosition.current.y,
          currentCameraPosition.current.z
        );
        
        if (controls.target) {
          controls.target.set(
            currentCameraTarget.current.x,
            currentCameraTarget.current.y,
            currentCameraTarget.current.z
          );
          controls.update();
        }
        
        setIsAnimatingCamera(false);
        
        // Use a short timer to ensure state updates are processed
        // before allowing a new animation to start
        if (animationCleanupTimer.current) {
          clearTimeout(animationCleanupTimer.current);
        }
        animationCleanupTimer.current = setTimeout(() => {
          animationCleanupInProgress.current = false;
          animationCleanupTimer.current = null;
          console.log("Animation cleanup complete, ready for new animation");
        }, 50); // Short cooldown period
        
        return; // Skip the rest of the frame
      }
    }
    
    // Only apply animation if we're not in a user control state
    if (!userControlActive.current) {
      // Set camera and controls with the current interpolated values
      camera.position.set(
        currentCameraPosition.current.x,
        currentCameraPosition.current.y,
        currentCameraPosition.current.z
      );
      
      if (controls.target) {
        controls.target.set(
          currentCameraTarget.current.x,
          currentCameraTarget.current.y,
          currentCameraTarget.current.z
        );
        
        // Update controls
        controls.update();
      }
    }
  });
  
  return null; // This component doesn't render anything visible
}

export default function MuscleModelPage() {
  // UI-specific state (keep these as React state)
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  // --- Smooth camera transition refs ---
  const cameraAnimationFrameRef = useRef<number | null>(null);
  
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

  // Camera animation state
  const [isAnimatingCamera, setIsAnimatingCamera] = useState(false);
  const currentCameraPositionRef = useRef({ x: 0, y: 0, z: 7 }); // Initial camera pos
  const currentCameraTargetRef = useRef({ x: 0, y: 0, z: 0 }); // Initial target
  const targetCameraPositionRef = useRef({ ...cameraPosition });
  const targetCameraTargetRef = useRef({ ...cameraTarget });
  const isProgrammaticUpdate = useRef(false);

  // Add animation speed control
  const [cameraAnimationSpeed, setCameraAnimationSpeed] = useState(0.5);
  
  // State for muscle guide dialog
  const [muscleGuideOpen, setMuscleGuideOpen] = useState(false);

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

  // Debug function to log vector
  const logVector = (name: string, vector: any) => {
    if (!vector) return `${name}: null`;
    return `${name}: {x: ${vector.x.toFixed(2)}, y: ${vector.y.toFixed(2)}, z: ${vector.z.toFixed(2)}}`;
  };

  // Function to focus camera on a specific muscle
  const focusOnMuscle = (muscleName: string) => {
    const muscle = muscleMap[muscleName];
    if (!muscle) return;
    // Use group view instead of individual muscle view
    const view = muscle.group ? getGroupView(muscle.group, 'front') : null;
    if (view) {
      // Set flag to prevent onChange from firing
      isProgrammaticUpdate.current = true;
      
      // Update store values
      setCameraPosition(view.position);
      setCameraTarget(view.target);
      
      // Directly update OrbitControls if available
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(view.target.x, view.target.y, view.target.z);
        orbitControlsRef.current.object.position.set(view.position.x, view.position.y, view.position.z);
        orbitControlsRef.current.update();
      }
      
      // Clear the flag after a short delay
      setTimeout(() => {
        isProgrammaticUpdate.current = false;
      }, 50);
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

  // Update the useEffect for camera position changes
  useEffect(() => {
    if (!orbitControlsRef.current) return;
    
    // Set flag to indicate we're making a programmatic update
    isProgrammaticUpdate.current = true;
    
    // Store the new target values from zustand store
    targetCameraPositionRef.current = { ...cameraPosition };
    targetCameraTargetRef.current = { ...cameraTarget };
    
    // Initialize current values if animation isn't already running
    if (!isAnimatingCamera) {
      try {
        // Get the current camera and control values as starting point
        const camera = orbitControlsRef.current.object;
        const controls = orbitControlsRef.current;
        
        // Set current values to the current camera state
        currentCameraPositionRef.current = { 
          x: camera.position.x, 
          y: camera.position.y, 
          z: camera.position.z 
        };
        
        currentCameraTargetRef.current = {
          x: controls.target.x,
          y: controls.target.y,
          z: controls.target.z
        };
        
        // Start the animation (but don't interrupt user interaction)
        setIsAnimatingCamera(true);
      } catch (err) {
        console.error("Error initializing camera animation:", err);
      }
    }
    
    // Clear the flag after a small delay to allow the update to complete
    setTimeout(() => {
      isProgrammaticUpdate.current = false;
    }, 50);
    
  }, [cameraPosition, cameraTarget]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container max-w-[1600px] mx-auto py-6 space-y-6 px-6">
        {/* Modern Hero Section */}
        <div className="bg-gradient-to-r from-fitness-purple/5 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-fitness-purple/10 p-2 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-fitness-purple" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fitness-purple to-fitness-charcoal bg-clip-text text-transparent">3D Muscle Explorer</h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Interactive model of the human muscular system. Click on muscles to highlight, rotate to view from any angle, and learn about muscle groups and their functions.
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Info className="h-4 w-4" />
                How to use
              </Button>
              
              <Dialog open={muscleGuideOpen} onOpenChange={setMuscleGuideOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-fitness-purple hover:bg-fitness-purple/90 gap-1.5">
                    <Info className="h-4 w-4" />
                    Muscle Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center gap-2">
                      <div className="bg-fitness-purple/10 p-1.5 rounded-lg">
                        <Info className="h-5 w-5 text-fitness-purple" />
                      </div>
                      <DialogTitle>Understanding Muscle Groups</DialogTitle>
                    </div>
                    <DialogDescription>
                      Major muscle groups and their functions in the human body
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="p-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border p-5 shadow-sm">
                        <h3 className="font-semibold text-fitness-purple flex items-center gap-2 mb-3">
                          <span className="bg-fitness-purple/10 p-1 rounded w-6 h-6 flex items-center justify-center text-xs">U</span>
                          Upper Body
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                          <li><strong className="text-fitness-charcoal">Biceps Brachii</strong> - Arm flexion and supination</li>
                          <li><strong className="text-fitness-charcoal">Deltoids</strong> - Shoulder movement (anterior, medial, posterior)</li>
                          <li><strong className="text-fitness-charcoal">Pectoralis Major</strong> - Chest muscles for arm movement</li>
                          <li><strong className="text-fitness-charcoal">Latissimus Dorsi</strong> - Back muscles for pulling movements</li>
                          <li><strong className="text-fitness-charcoal">Trapezius</strong> - Upper back and neck movement</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white rounded-xl border p-5 shadow-sm">
                        <h3 className="font-semibold text-fitness-purple flex items-center gap-2 mb-3">
                          <span className="bg-fitness-purple/10 p-1 rounded w-6 h-6 flex items-center justify-center text-xs">L</span>
                          Lower Body
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                          <li><strong className="text-fitness-charcoal">Quadriceps</strong> - Front thigh muscles for leg extension</li>
                          <li><strong className="text-fitness-charcoal">Hamstrings</strong> - Rear thigh muscles for leg flexion</li>
                          <li><strong className="text-fitness-charcoal">Gluteus Maximus</strong> - Buttock muscles for hip extension</li>
                          <li><strong className="text-fitness-charcoal">Gastrocnemius & Soleus</strong> - Calf muscles</li>
                          <li><strong className="text-fitness-charcoal">Abdominals</strong> - Core muscles for trunk flexion and stability</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-blue-50 p-5 rounded-xl border border-blue-100 flex gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg h-min">
                        <Info className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800 text-lg mb-2">Animation Details</h3>
                        <p className="text-blue-700">
                          The 3D model shows muscle contractions in real-time. Use the animation controls to visualize how muscles change during various exercises and movements. Click on muscles to highlight them and learn more about their functions.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50" 
                            onClick={() => setMuscleGuideOpen(false)}>
                            Close Guide
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {loadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}
        
        {/* Main Content - Always showing Interactive View */}
        <div className="space-y-4 w-full">
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
                      showLabels={showLabels}
                    />
                    
                    {/* Add the CameraController inside the Canvas */}
                    <CameraController
                      isAnimatingCamera={isAnimatingCamera}
                      setIsAnimatingCamera={setIsAnimatingCamera}
                      currentCameraPosition={currentCameraPositionRef}
                      currentCameraTarget={currentCameraTargetRef}
                      targetCameraPosition={targetCameraPositionRef}
                      targetCameraTarget={targetCameraTargetRef}
                      isProgrammaticUpdate={isProgrammaticUpdate}
                      orbitControlsRef={orbitControlsRef}
                      animationSpeed={cameraAnimationSpeed}
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
                        // Only update store if the change was caused by user interaction
                        if (!isProgrammaticUpdate.current && orbitControlsRef.current) {
                          // If animation is running, stop it because user is now controlling camera
                          if (isAnimatingCamera) {
                            setIsAnimatingCamera(false);
                          }
                          
                          const pos = orbitControlsRef.current.object?.position;
                          const target = orbitControlsRef.current.target;
                          if (pos && target) {
                            setCameraPosition({ x: pos.x, y: pos.y, z: pos.z });
                            setCameraTarget({ x: target.x, y: target.y, z: target.z });
                            
                            // Also update the target refs to match current position
                            targetCameraPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
                            targetCameraTargetRef.current = { x: target.x, y: target.y, z: target.z };
                          }
                        }
                      }}
                    />
                  </Canvas>
                )}
                
                {/* Static labels in top-left corner */}
                {isModelLoaded && Object.keys(highlightedMuscles).length > 0 && (
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 rounded-lg p-3 min-w-[180px]"
                    style={{ background: 'transparent', boxShadow: 'none' }}
                  >
                    <div className="font-semibold text-fitness-purple text-xs mb-1">Selected Muscles</div>
                    {Object.entries(highlightedMuscles).map(([muscle, color]) => (
                      <div key={muscle} className="flex items-center gap-2 text-xs">
                        <span style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: '1px solid #ccc'
                        }} />
                        <span>{muscleMap[muscle]?.displayName || muscle}</span>
                      </div>
                    ))}
                  </div>
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
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200"
                      onClick={toggleFullScreen}
                    >
                      {isFullScreen ? (
                        <Minimize className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize className="h-3.5 w-3.5" />
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
        </div>
        
        {/* Compact Muscle Info Panel - Shown when muscles are selected */}
        {Object.keys(highlightedMuscles).length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-fitness-purple/10 p-1.5 rounded-lg">
                  <Info className="h-4 w-4 text-fitness-purple" />
                </div>
                <h3 className="font-semibold text-fitness-charcoal">Selected Muscles ({Object.keys(highlightedMuscles).length})</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setShowLabels(v => !v)}
                >
                  {showLabels ? 'Hide Labels' : 'Show Labels'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setHighlightedMuscles({})}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.keys(highlightedMuscles).map(muscle => {
                const info = muscleMap[muscle];
                if (!info) return null;
                
                return (
                  <div key={muscle} className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 text-sm border">
                    <span 
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: highlightedMuscles[muscle] }}
                    ></span>
                    <span className="font-medium">{info.displayName}</span>
                    <span className="text-xs text-gray-500">({info.group})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 