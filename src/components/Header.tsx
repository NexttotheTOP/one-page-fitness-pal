import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  Brain, 
  User, 
  LogOut, 
  BarChart, 
  Menu, 
  HelpCircle,
  BookOpen,
  Target,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Rocket,
  Zap,
  Lightbulb,
  Ruler,
  Crosshair,
  Flame
} from 'lucide-react';
import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const features = [
    {
      title: "3D Muscle Explorer",
      icon: <Crosshair className="h-5 w-5 text-blue-500" />,
      description: "Interactive 3D model of the human muscular system. Click, rotate, and learn about muscle groups.",
      benefits: [
        "Real-time muscle visualization",
        "Interactive learning experience",
        "Detailed muscle information",
        "Exercise impact visualization"
      ],
      color: "bg-blue-500/10",
      path: "/muscle-model"
    },
    {
      title: "AI Knowledge Assistant",
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      description: "Your personal fitness coach powered by advanced AI. Get expert advice and answers instantly.",
      benefits: [
        "Expert-backed knowledge",
        "Real-time answers",
        "Video references",
        "Personalized guidance"
      ],
      color: "bg-purple-500/10",
      path: "/knowledge"
    },
    {
      title: "Smart Workout Generator",
      icon: <Sparkles className="h-5 w-5 text-orange-500" />,
      description: "Create custom workouts tailored to your goals, experience, and preferences.",
      benefits: [
        "AI-powered customization",
        "Progressive overload",
        "Exercise variations",
        "Real-time adjustments"
      ],
      color: "bg-orange-500/10",
      path: "/"
    },
    {
      title: "Fitness Profile",
      icon: <Target className="h-5 w-5 text-green-500" />,
      description: "Comprehensive fitness tracking and analysis for data-driven progress.",
      benefits: [
        "Body composition analysis",
        "Progress tracking",
        "Goal setting",
        "Performance metrics"
      ],
      color: "bg-green-500/10",
      path: "/profile"
    }
  ];

  const quickTips = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Quick Start",
      tip: "Begin with the Workout Generator to create your first personalized workout plan."
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
      title: "Pro Tip",
      tip: "Use the '@' symbol to tag your favorite exercises when creating workouts."
    },
    {
      icon: <Ruler className="h-5 w-5 text-purple-500" />,
      title: "Best Practice",
      tip: "Complete your fitness profile for more accurate and personalized recommendations."
    },
    {
      icon: <Flame className="h-5 w-5 text-red-500" />,
      title: "Remember",
      tip: "Explore the 3D Muscle Model to understand exercise impact on specific muscle groups."
    }
  ];

  return (
    <>
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-fitness-purple/5 via-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="bg-fitness-purple p-2 rounded-xl shadow-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Welcome to OpenFit-AI</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Your intelligent fitness companion powered by AI
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="features" className="h-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent gap-2">
                <TabsTrigger 
                  value="features" 
                  className="data-[state=active]:bg-fitness-purple data-[state=active]:text-white"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Key Features
                </TabsTrigger>
                <TabsTrigger 
                  value="quickstart"
                  className="data-[state=active]:bg-fitness-purple data-[state=active]:text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Start Guide
                </TabsTrigger>
                <TabsTrigger 
                  value="help"
                  className="data-[state=active]:bg-fitness-purple data-[state=active]:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Help & Support
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="overflow-y-auto px-6 pb-6" style={{ height: 'calc(90vh - 180px)' }}>
              <TabsContent value="features" className="mt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, idx) => (
                    <Card key={idx} className="relative group overflow-hidden border border-gray-200/50 shadow-sm">
                      <CardHeader className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className={`${feature.color} p-2 rounded-lg`}>
                            {feature.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {feature.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, benefitIdx) => (
                            <li key={benefitIdx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="h-1 w-1 rounded-full bg-gray-400" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <Link 
                          to={feature.path}
                          onClick={() => setGuideOpen(false)}
                          className="mt-4 inline-flex items-center text-sm text-fitness-purple hover:text-fitness-purple/80 font-medium"
                        >
                          Try it now
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="quickstart" className="mt-6">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {quickTips.map((tip, idx) => (
                      <Card key={idx} className="bg-white border border-gray-200/50">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className="bg-gray-50 p-2 rounded-lg h-min">
                              {tip.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-base mb-1">{tip.title}</h3>
                              <p className="text-gray-600 text-sm">{tip.tip}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-fitness-purple/20 bg-gradient-to-br from-fitness-purple/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="text-lg">Ready to start?</CardTitle>
                      <CardDescription>
                        Begin your fitness journey with these simple steps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge className="h-6 w-6 rounded-full flex items-center justify-center text-xs bg-fitness-purple">1</Badge>
                          <p className="text-sm">Complete your fitness profile for personalized recommendations</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="h-6 w-6 rounded-full flex items-center justify-center text-xs bg-fitness-purple">2</Badge>
                          <p className="text-sm">Generate your first AI-powered workout plan</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="h-6 w-6 rounded-full flex items-center justify-center text-xs bg-fitness-purple">3</Badge>
                          <p className="text-sm">Explore the 3D muscle model to understand exercises better</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="h-6 w-6 rounded-full flex items-center justify-center text-xs bg-fitness-purple">4</Badge>
                          <p className="text-sm">Use the AI assistant for form tips and exercise guidance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="help" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>
                      We're here to support your fitness journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-700 mb-2">Contact Support</h3>
                      <p className="text-blue-600 text-sm mb-3">
                        Have questions or running into issues? Reach out to us:
                      </p>
                      <div className="space-y-2 text-sm">
                        <a 
                          href="mailto:woutvp@icloud.com"
                          className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                        >
                          <MessageSquare className="h-4 w-4" />
                          woutvp@icloud.com
                        </a>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-700 mb-2">Connect & Contribute</h3>
                      <p className="text-purple-600 text-sm mb-3">
                        OpenFit-AI is open-source and community-driven. Join us:
                      </p>
                      <div className="space-y-2 text-sm">
                        <a 
                          href="https://www.linkedin.com/in/wout-van-parys-a9a28420a/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-700 hover:text-purple-800"
                        >
                          <User className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <header className="bg-white border-b border-gray-200 py-3 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 lg:px-4 xl:px-6 w-full max-w-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2 pr-4">
                <div className="p-1.5 bg-gradient-to-br from-fitness-purple to-purple-400 rounded-lg shadow-sm">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-fitness-charcoal flex items-center">
                    OpenFit-AI
                  </h1>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">Open-source fitness expertise by AI</div>
                </div>
              </div>
              
              {/* Mobile Menu Button - only shown on small screens */}
              <Button variant="ghost" className="p-1.5 lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Main Navigation - hidden on small screens */}
              <nav className="hidden lg:flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/' 
                      ? 'bg-fitness-purple text-white shadow-sm'
                      : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                  }`}
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Workouts</span>
                </Link>
                
                <Link
                  to="/profile"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/profile' 
                      ? 'bg-fitness-purple text-white shadow-sm'
                      : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Overview</span>
                </Link>
                
                <Link
                  to="/knowledge"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/knowledge' 
                      ? 'bg-fitness-purple text-white shadow-sm'
                      : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>Knowledge</span>
                </Link>
                
                <Link
                  to="/muscle-model"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/muscle-model' 
                      ? 'bg-fitness-purple text-white shadow-sm'
                      : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="h-4 w-4" />
                  <span>3D Muscles</span>
                </Link>
              </nav>
            </div>

            {/* User profile and actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex items-center gap-1.5 text-gray-600 border-gray-200"
                onClick={() => setGuideOpen(true)}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Guide</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-gray-200">
                      <AvatarFallback className="bg-purple-100 text-fitness-purple">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {displayName && (
                        <p className="font-medium">{displayName}</p>
                      )}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
