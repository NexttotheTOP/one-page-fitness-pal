import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getUserWorkouts, type WorkoutPlanWithExercises } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { X, Dumbbell, FolderPlus, User, Activity, TrendingUp, Target, Info, Loader2, Brain } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  muscle_groups: string[]
  difficulty_level: string
  equipment_needed: string
}

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onContextChange?: (context: { exercises: Exercise[], workouts: WorkoutPlanWithExercises[] }) => void
  isStreaming?: boolean
  streamingText?: string
  onGenerate?: () => void
  isGenerating?: boolean
}

interface MentionedItem {
  id: string
  name: string
  type: 'exercise' | 'workout'
}

function normalize(str: string) {
  return str.replace(/[\s_]+/g, '').toLowerCase();
}

const MentionTextarea = ({ value, onChange, placeholder, className, onContextChange, isStreaming, streamingText, onGenerate, isGenerating }: MentionTextareaProps) => {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workouts, setWorkouts] = useState<WorkoutPlanWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mentionedItems, setMentionedItems] = useState<MentionedItem[]>([])
  
  // Use refs to store current data for the closure
  const exercisesRef = useRef<Exercise[]>([])
  const workoutsRef = useRef<WorkoutPlanWithExercises[]>([])

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 Fetching exercises and workouts...')
      
      if (!user) {
        console.log('❌ No user found, skipping data fetch')
        setIsLoading(false)
        return
      }
      
      try {
        // Fetch exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .order('name')

        if (exercisesError) {
          console.error('❌ Error fetching exercises:', exercisesError)
        } else {
          console.log('✅ Exercises fetched:', exercisesData?.length || 0)
          setExercises(exercisesData || [])
          exercisesRef.current = exercisesData || []
        }

        // Fetch workouts with full data including exercises
        try {
          const userWorkouts = await getUserWorkouts(user.id)
          console.log('✅ Workouts with exercises fetched:', userWorkouts?.length || 0)
          setWorkouts(userWorkouts || [])
          workoutsRef.current = userWorkouts || []
        } catch (workoutError) {
          console.error('❌ Error fetching workouts:', workoutError)
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error)
      } finally {
        setIsLoading(false)
        console.log('🏁 Data fetching complete')
      }
    }

    fetchData()
  }, [user])

  // Function to extract mentions from editor content and get full context data
  const extractMentionsAndContext = (editor: any) => {
    if (!editor) return { mentions: [], context: { exercises: [], workouts: [] } }
    
    const mentions: MentionedItem[] = []
    const contextExercises: Exercise[] = []
    const contextWorkouts: WorkoutPlanWithExercises[] = []
    const doc = editor.getJSON()
    
    const traverseNodes = (node: any) => {
      if (node.type === 'mention' && node.attrs?.id) {
        const mentionId = node.attrs.id
        const label = node.attrs.label || ''
        
        if (mentionId.startsWith('exercise-')) {
          const exerciseId = mentionId.replace('exercise-', '')
          const exercise = exercisesRef.current.find(ex => ex.id === exerciseId)
          if (exercise) {
            mentions.push({
              id: exerciseId,
              name: exercise.name,
              type: 'exercise'
            })
            // Add to context if not already included
            if (!contextExercises.find(ex => ex.id === exercise.id)) {
              contextExercises.push(exercise)
            }
          }
        } else if (mentionId.startsWith('workout-')) {
          const workoutId = mentionId.replace('workout-', '')
          const workout = workoutsRef.current.find(w => w.id === workoutId)
          if (workout) {
            mentions.push({
              id: workoutId,
              name: workout.name,
              type: 'workout'
            })
            // Add to context if not already included
            if (!contextWorkouts.find(w => w.id === workout.id)) {
              contextWorkouts.push(workout)
            }
          }
        }
      }
      
      if (node.content) {
        node.content.forEach(traverseNodes)
      }
    }
    
    traverseNodes(doc)
    
    // Remove duplicates and limit to 5 for display
    const uniqueMentions = mentions.filter((mention, index, self) => 
      index === self.findIndex(m => m.id === mention.id && m.type === mention.type)
    ).slice(0, 5)
    
    return {
      mentions: uniqueMentions,
      context: {
        exercises: contextExercises,
        workouts: contextWorkouts
      }
    }
  }

  // Function to remove a mention from the editor
  const removeMention = (itemId: string, itemType: 'exercise' | 'workout') => {
    if (!editor) return
    
    const mentionId = `${itemType}-${itemId}`
    
    // Find and remove the mention from the editor content
    const tr = editor.state.tr
    let found = false
    
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'mention' && node.attrs.id === mentionId) {
        tr.delete(pos, pos + node.nodeSize)
        found = true
        return false // Stop searching after first match
      }
    })
    
    if (found) {
      editor.view.dispatch(tr)
      onChange(editor.getText())
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || `Create 3 variations of my @Core Strength and Stability Workout.
Include the @Plank, @Push-ups, and @Squats. 
Make each variation focus on a different aspect: strength, endurance, and HIIT.`,
        emptyEditorClass: 'is-editor-empty',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            const normalizedQuery = normalize(query)
            
            const exerciseSuggestions = exercisesRef.current
              .filter(exercise => 
                normalize(exercise.name).includes(normalizedQuery)
              )
              .slice(0, 5)
              .map(exercise => ({
                id: `exercise-${exercise.id}`,
                label: `💪 ${exercise.name}`,
              }))

            const workoutSuggestions = workoutsRef.current
              .filter(workout => 
                normalize(workout.name).includes(normalizedQuery)
              )
              .slice(0, 5)
              .map(workout => ({
                id: `workout-${workout.id}`,
                label: `📋 ${workout.name}`,
              }))
            
            return [...exerciseSuggestions, ...workoutSuggestions]
          },
          render: () => {
            let popup: HTMLElement | null = null

            return {
              onStart: (props: any) => {
                console.log('🎨 Rendering suggestion popup with', props.items?.length, 'items')
                
                if (!props.items || props.items.length === 0) {
                  return
                }

                // Remove existing popup if any
                if (popup) {
                  popup.remove()
                }

                // Create popup element
                popup = document.createElement('div')
                popup.className = 'mention-suggestions'
                popup.style.cssText = `
                  position: absolute;
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  padding: 4px;
                  z-index: 1000;
                  max-height: 200px;
                  overflow-y: auto;
                  min-width: 200px;
                `

                // Position the popup
                const rect = props.clientRect?.()
                if (rect) {
                  popup.style.top = `${rect.bottom + window.scrollY + 4}px`
                  popup.style.left = `${rect.left + window.scrollX}px`
                }

                // Create suggestion items
                const itemsHTML = props.items.map((item: any, index: number) => `
                  <div 
                    class="mention-suggestion-item" 
                    data-index="${index}"
                    style="
                      padding: 8px 12px;
                      cursor: pointer;
                      border-radius: 4px;
                      margin: 2px 0;
                      transition: background-color 0.2s;
                      font-size: 14px;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    "
                    onmouseover="this.style.backgroundColor='#f3f4f6'"
                    onmouseout="this.style.backgroundColor='transparent'"
                  >
                    <span style="font-weight: 500;">${item.label}</span>
                  </div>
                `).join('')

                popup.innerHTML = itemsHTML

                // Add click handlers
                popup.querySelectorAll('.mention-suggestion-item').forEach((item, index) => {
                  item.addEventListener('click', () => {
                    const suggestion = props.items[index]
                    if (suggestion) {
                      console.log('✅ Suggestion selected:', suggestion)
                      props.command({
                        id: suggestion.id,
                        label: suggestion.label,
                      })
                    }
                  })
                })

                // Add to document
                document.body.appendChild(popup)
                console.log('✅ Suggestion popup added to DOM')
              },

              onUpdate: (props: any) => {
                // Recreate the popup instead of calling this.onStart
                if (popup) {
                  popup.remove()
                  popup = null
                }
                
                if (!props.items || props.items.length === 0) {
                  return
                }

                // Create popup element
                popup = document.createElement('div')
                popup.className = 'mention-suggestions'
                popup.style.cssText = `
                  position: absolute;
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  padding: 4px;
                  z-index: 1000;
                  max-height: 200px;
                  overflow-y: auto;
                  min-width: 200px;
                `

                // Position the popup
                const rect = props.clientRect?.()
                if (rect) {
                  popup.style.top = `${rect.bottom + window.scrollY + 4}px`
                  popup.style.left = `${rect.left + window.scrollX}px`
                }

                // Create suggestion items
                const itemsHTML = props.items.map((item: any, index: number) => `
                  <div 
                    class="mention-suggestion-item" 
                    data-index="${index}"
                    style="
                      padding: 8px 12px;
                      cursor: pointer;
                      border-radius: 4px;
                      margin: 2px 0;
                      transition: background-color 0.2s;
                      font-size: 14px;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    "
                    onmouseover="this.style.backgroundColor='#f3f4f6'"
                    onmouseout="this.style.backgroundColor='transparent'"
                  >
                    <span style="font-weight: 500;">${item.label}</span>
                  </div>
                `).join('')

                popup.innerHTML = itemsHTML

                // Add click handlers
                popup.querySelectorAll('.mention-suggestion-item').forEach((item, index) => {
                  item.addEventListener('click', () => {
                    const suggestion = props.items[index]
                    if (suggestion) {
                      console.log('✅ Suggestion selected:', suggestion)
                      props.command({
                        id: suggestion.id,
                        label: suggestion.label,
                      })
                    }
                  })
                })

                // Add to document
                document.body.appendChild(popup)
                console.log('✅ Suggestion popup updated in DOM')
              },

              onKeyDown: (props: any) => {
                if (props.event.key === 'Escape') {
                  if (popup) {
                    popup.remove()
                    popup = null
                  }
                  return true
                }
                return false
              },

              onExit: () => {
                console.log('🚪 Exiting suggestions, removing popup')
                if (popup) {
                  popup.remove()
                  popup = null
                }
              },
            }
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText())
      // Extract mentions whenever content updates
      const { mentions, context } = extractMentionsAndContext(editor)
      setMentionedItems(mentions)
      onContextChange?.(context)
    },
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        ),
      },
    },
  }, [exercises, workouts]) // Recreate editor when data changes

  // Update mentions when editor content changes externally
  useEffect(() => {
    if (editor && editor.getText() !== value) {
      editor.commands.setContent(value)
      const { mentions, context } = extractMentionsAndContext(editor)
      setMentionedItems(mentions)
      onContextChange?.(context)
    }
  }, [value, editor, onContextChange])

  return (
    <div className="relative space-y-3">
      <style>{`
        .ProseMirror .mention {
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-weight: 500;
          color: #7c3aed;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .markdown-preview {
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3, .markdown-preview h4 {
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }

        .markdown-preview p {
          margin-bottom: 1em;
        }

        .markdown-preview ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        .markdown-preview li {
          margin-bottom: 0.5em;
        }

        .markdown-preview strong {
          font-weight: 600;
          color: #374151;
        }

        /* Modern Mention Suggestions UI */
        .mention-suggestions {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
        }

        .mention-suggestion-item {
          transition: all 0.2s;
        }

        .mention-suggestion-item:hover {
          background-color: #f5f3ff;
        }
      `}</style>
      
      {/* Auto-included Profile Context */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-medium text-green-700 uppercase tracking-wide flex items-center gap-1">
            <User className="h-3 w-3" />
            Automatically included in context
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border-green-300"
          >
            <Target className="h-3 w-3" />
            <span>Your Assessment</span>
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border-green-300"
          >
            <Activity className="h-3 w-3" />
            <span>Body Analysis</span>
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border-green-300"
          >
            <TrendingUp className="h-3 w-3" />
            <span>Progress Data</span>
          </Badge>
        </div>
        <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <Info className="h-3 w-3" />
          Your personal fitness profile helps create more targeted workouts
        </div>
      </div>
      
      {/* Context Indication Area - Above the textarea */}
      {mentionedItems.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1">
              <FolderPlus className="h-3 w-3" />
              Referenced in your prompt ({mentionedItems.length}/5)
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {mentionedItems.map((item) => (
              <Badge
                key={`${item.type}-${item.id}`}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors",
                  item.type === 'exercise' 
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" 
                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                )}
              >
                {item.type === 'exercise' ? (
                  <Dumbbell className="h-3 w-3" />
                ) : (
                  <FolderPlus className="h-3 w-3" />
                )}
                <span>{item.name}</span>
                <button
                  onClick={() => removeMention(item.id, item.type)}
                  className="ml-1 hover:bg-white/50 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {mentionedItems.length >= 5 && (
            <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span>⚠️ Maximum of 5 references reached</span>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-purple-200 focus-within:border-purple-400 transition-all">
          <EditorContent editor={editor} />
          
          {/* @ Reference Info Badge - appears when text is empty or minimal */}
          {(!value || value.trim().length < 10) && (
            <div className="absolute top-2 right-2 z-10">
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm animate-in fade-in-0 duration-300"
              >
                <Info className="h-3 w-3 mr-1" />
                <span className="text-xs">
                  Type @ to reference exercises & workouts
                </span>
              </Badge>
            </div>
          )}
          
          {/* Example usage tooltip - shows on hover of info badge */}
          {(!value || value.trim().length < 10) && (
            <div className="absolute top-10 right-2 z-20 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-blue-900 text-white text-xs rounded-lg p-2 shadow-lg max-w-xs">
                <div className="font-medium mb-1">Examples:</div>
                <div className="space-y-1 text-blue-100">
                  <div>• <span className="text-blue-300">@Squats</span> (exercise)</div>
                  <div>• <span className="text-purple-300">@Full Body Workout</span> (workout)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Streaming preview with markdown support */}
      {isStreaming && streamingText && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin text-fitness-purple/60" />
            <span className="text-sm font-medium text-gray-600">AI is analyzing your request...</span>
          </div>
          <div className="markdown-preview text-gray-700">
            <ReactMarkdown>{streamingText}</ReactMarkdown>
          </div>
        </div>
      )}
      
      {/* Updated stats display with generate button */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
              <Dumbbell className="h-3 w-3" />
              <span>{exercises.length} Exercises</span>
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
              <FolderPlus className="h-3 w-3" />
              <span>{workouts.length} Workouts</span>
            </Badge>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading data...
            </div>
          )}
        </div>
        
        {onGenerate && (
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !value.trim()}
            className={cn(
              "shadow-md transition-all",
              isGenerating 
                ? "bg-gray-100 text-gray-500" 
                : "bg-fitness-purple hover:bg-fitness-purple/90 text-white"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Workout...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Workout
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default MentionTextarea 