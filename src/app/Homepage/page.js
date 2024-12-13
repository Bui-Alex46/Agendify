"use client"
import { useState, useEffect } from "react"
import { Bell, Calendar, Check, Clock, Cloud, Edit, Sun, Trash, X, Zap, Undo } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link";
import WeatherCard from "@/components/weather/WeatherCard"; 
import { optimizeSchedule } from './datamodel.js';
import './home.css'

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([
    { id: "1", title: "Team Meeting", time: "9:00 AM - 10:00 AM", priority: "high", completed: false },
    { id: "2", title: "Client Call", time: "11:00 AM - 12:00 PM", priority: "medium", completed: false },
    { id: "3", title: "Project Review", time: "2:00 PM - 3:00 PM", priority: "low", completed: false },
  ])

  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [optimizedEvents, setOptimizedEvents] = useState(events);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('today'); // Default to 'today'
  const [originalEvents, setOriginalEvents] = useState([]);

    // Loading spinner component
  const LoadingSpinner = () => (
    <div className="spinner"></div>
  );

  useEffect(() => {
    setEvents([]); // Clear events before fetching new ones
    fetch('http://localhost:3001/events', {
      method: 'GET',
      credentials: 'include', // Include cookies
    })
      .then(response => response.json())
      .then(data => {
        // Transform data to include `start` and `end` properties
        const transformedEvents = data.map(event => ({
          ...event,
          start: {
            dateTime: new Date(event.start), // Ensure it's a Date object
          },
          end: {
            dateTime: new Date(event.end), // Ensure it's a Date object
          },
        }));
  
        setEvents(transformedEvents); // Update the state with transformed events
      })
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  // Filtering events for today
  const todayEvents = events.filter(event => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today (midnight)
    const endOfToday = new Date(now);
    endOfToday.setDate(now.getDate() + 1); // End of today (midnight of the next day)

    // Check if the event start or end time falls within today
    return (
      (event.start.dateTime >= now && event.start.dateTime < endOfToday) ||
      (event.end.dateTime >= now && event.end.dateTime < endOfToday)
    );
  });

    // Filtering events for tomorrow
    const nextDayEvents = events.filter(event => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today (midnight)
      const startOfNextDay = new Date(now);
      startOfNextDay.setDate(now.getDate() + 1); // Start of tomorrow (midnight)
      const endOfNextDay = new Date(startOfNextDay);
      endOfNextDay.setDate(startOfNextDay.getDate() + 1); // End of tomorrow (midnight of the next day)
  
      // Check if the event start or end time falls within the next day
      return (
        (event.start.dateTime >= startOfNextDay && event.start.dateTime < endOfNextDay) ||
        (event.end.dateTime >= startOfNextDay && event.end.dateTime < endOfNextDay)
      );
    });

  // Filtering events for the current week
  const currentWeekEvents = events.filter(event => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today (midnight)
    
    // Start of the current week (Sunday) (adjust for your week's start day if needed)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Adjust to the start of the week (Sunday)
    
    // End of the current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of the same week

    // Check if the event start or end time falls within the current week
    return (
      (event.start.dateTime >= startOfWeek && event.start.dateTime <= endOfWeek) ||
      (event.end.dateTime >= startOfWeek && event.end.dateTime <= endOfWeek)
    );
  });

  // Optimize events button
  const handleOptimize = () => {
    setIsOptimizing(true);
    // Filter events based on the selected tab
    let filteredEvents;
  
    if (selectedTab === 'today') {
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.start.dateTime);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      });
    } else if (selectedTab === 'tomorrow') {
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.start.dateTime);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date
        return eventDate.toDateString() === tomorrow.toDateString();
      });
    } else if (selectedTab === 'week') {
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.start.dateTime);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Get start of the current week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Get end of the current week
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
    setOriginalEvents(filteredEvents);

    // Now optimize the filtered events
    setTimeout(() => {
      const optimizedSchedule = optimizeSchedule(filteredEvents);
      setOptimizedEvents(optimizedSchedule);
      console.log('Optimized Schedule:', optimizedSchedule);
      setIsOptimized(true);
      setIsOptimizing(false);
    }, 1000); 
 
  };
  const handleRevert = () => {
    setOptimizedEvents([...originalEvents]); // Revert back to original events
    setIsOptimized(false); // Set optimized state to false
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date); // This will handle ISO 8601 strings like "2024-12-12T22:58:21.346Z"
    return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  
  const handleLinkGoogleCalendar = () => {
    window.location.href = 'http://localhost:3001/auth'; // Directs user to the OAuth2 flow
  };


  const updateTask = (updatedTask) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setSelectedTask(null)
  }

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    setSelectedTask(null)
  }
  const updateEventInDatabase = async (updatedEvent) => {
    try {
      const response = await fetch('http://localhost:3001/update-event', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update event.');
      }
  
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error updating event in database:', error);
    }
  };

  const updateEvent = (updatedEvent) => {
    setEvents(prevEvents => prevEvents.map(event => 
      event.event_id === updatedEvent.event_id ? { ...event, ...updatedEvent } : event
    ));
    setSelectedEvent(null);
     // Persist to database
    updateEventInDatabase(updatedEvent);
    
  };

 
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3:
        return "bg-red-500"
      case 2:
        return "bg-yellow-500"
      case 1:
        return "bg-green-500"
      default:
         return "bg-blue-500"
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <Zap className="h-6 w-6" />
          <span className="ml-2 text-lg font-bold">Agendify</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Dashboard
          </a>
          <Link href="/Calendar" className="text-sm font-medium hover:underline underline-offset-4" >
            Calendar
          </Link>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Tasks
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Settings
          </a>
        </nav>
        <Avatar className="ml-4">
          <AvatarImage alt="User" src="/placeholder-avatar.jpg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </header>
      <main className="flex-1 py-6 px-4 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Today&apos;s Schedule</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center">
                    <div className={`w-2 h-2 ${getPriorityColor(task.priority)} rounded-full mr-2`} />
                    <span className="text-sm">{task.time} - {task.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Heavy traffic on your route to work.</p>
                <p className="text-sm">Meeting with John rescheduled to 3 PM.</p>
                <p className="text-sm">Rain expected this afternoon.</p>
              </div>
            </CardContent>
          </Card>
          <WeatherCard />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Add Task
                </Button>
                <Button variant="outline" size="sm">
                  Schedule Meeting
                </Button>
                <Button variant="outline" size="sm">
                  Set Reminder
                </Button>
                <Button variant="outline" size="sm">
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Detailed Schedule</CardTitle>
              <CardDescription>Click on a task to view or edit details</CardDescription>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                onClick={handleLinkGoogleCalendar}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Link Google Calendar
              </Button>
              <Button  variant="default" onClick={handleOptimize}>
                <Zap className="w-4 h-4 mr-2" />
                Optimize Schedule
              </Button>
              <Button  variant="default" onClick={handleRevert}>
                <Undo className="w-4 h-4 mr-2" />
                Revert
              </Button>
            </div>
          </div>
        </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
             
              </TabsList>
              <TabsContent value="today">
                {isOptimizing ? (
                   <div className="flex justify-center items-center">
                   <LoadingSpinner />
                 </div>
                ) : (                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Dialog key={task.id}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center space-x-4 w-full">
                            <div className={`w-4 h-4 ${getPriorityColor(task.priority)} rounded-full`} />
                            <div className="flex-1">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">{task.time}</p>
                            </div>
                            {task.completed ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Task Details</DialogTitle>
                          <DialogDescription>View or edit task information</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                              Title
                            </Label>
                            <Input
                              id="title"
                              value={selectedTask?.title}
                              className="col-span-3"
                              onChange={(e) =>
                                setSelectedTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                              Time
                            </Label>
                            <Input
                              id="time"
                              value={selectedTask?.time}
                              className="col-span-3"
                              onChange={(e) =>
                                setSelectedTask((prev) => (prev ? { ...prev, time: e.target.value } : null))
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                              Priority
                            </Label>
                            <Select
                              value={selectedTask?.priority}
                              onValueChange={(value) =>
                                setSelectedTask((prev) =>
                                  prev ? { ...prev, priority: value } : null
                                )
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                              Notes
                            </Label>
                            <Textarea
                              id="notes"
                              value={selectedTask?.notes}
                              className="col-span-3"
                              onChange={(e) =>
                                setSelectedTask((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                              Status
                            </Label>
                            <RadioGroup
                              value={selectedTask?.status ? "completed" : "pending"}
                              onValueChange={(value) =>
                                setSelectedTask((prev) =>
                                  prev ? { ...prev, status: value === "completed" } : null
                                )
                              }
                              className="col-span-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pending" id="pending" />
                                <Label htmlFor="pending">Pending</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="completed" id="completed" />
                                <Label htmlFor="completed">Completed</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="destructive" onClick={() => selectedTask && deleteTask(selectedTask.id)}>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                          <div className="space-x-2">
                            <Button variant="outline" onClick={() => setSelectedTask(null)}>
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button onClick={() => selectedTask && updateTask(selectedTask)}>
                              <Check className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}

          {/* Render Google Calendar Events */}
          {(isOptimized ? optimizedEvents : todayEvents)?.map((event) => (
  <Dialog key={event.event_id}>
    <DialogTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={() => setSelectedEvent(event)} // Assuming you want to handle event selection similarly
      >
        <div className="flex items-center space-x-4 w-full">
        {event.priority ? (
          <div className={`w-4 h-4 ${getPriorityColor(event.priority)} rounded-full`} />
        ) : (
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
        )}
           {/* Customize the color as needed */}
          <div className="flex-1">
            <p className="font-medium">{event.title}</p> {/* Event title */}
            <p className="text-sm text-muted-foreground">
            {event.start && event.end ? (
                <>
                  <span>{formatDate(event.start.dateTime || event.start)}</span>
                  {' - '}
                  <span>{formatDate(event.end.dateTime || event.end)}</span>
                </>
              ) : (
                'No start or end time available'
              )}
            </p>
            </div>
              {event.status ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
      </Button>
    </DialogTrigger>
    <DialogContent>
  <DialogHeader>
    <DialogTitle>Task Details</DialogTitle>
    <DialogDescription>View or edit task information</DialogDescription>
  </DialogHeader>
  <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="title" className="text-right">
        Title
      </Label>
      <Input
        id="title"
        value={selectedEvent ? selectedEvent.title : ''}
        className="col-span-3"
        onChange={(e) =>
          setSelectedEvent((prev) => (prev ? { ...prev, title: e.target.value } : null))
        }
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="time" className="text-right">
        Time
      </Label>
      <Input
        id="time"
        value={selectedEvent?.start?.dateTime && selectedEvent?.end?.dateTime
          ? `${new Date(selectedEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedEvent.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'No time available'
        }
        className="col-span-3"
        onChange={(e) =>
          setSelectedEvent((prev) => (prev ? { ...prev, time: e.target.value } : null))
        }
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="priority" className="text-right">
        Priority
      </Label>
      <Select
       value={selectedEvent?.priority}
       onValueChange={(value) => {
         setSelectedEvent((prev) => (prev ? { ...prev, priority: value } : null));
       }}
      >
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value= {1}>Low</SelectItem>
          <SelectItem value= {2}>Medium</SelectItem>
          <SelectItem value= {3}>High</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="notes" className="text-right">
        Notes
      </Label>
      <Textarea
        id="notes"
        value={selectedTask?.notes}
        className="col-span-3"
        onChange={(e) =>
          setSelectedTask((prev) => (prev ? { ...prev, notes: e.target.value } : null))
        }
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="status" className="text-right">
    Status
  </Label>
  <RadioGroup
    value={selectedEvent?.status ? "completed" : "pending"}
    onValueChange={(value) => {
      // Track the change locally in selectedEvent state
      setSelectedEvent((prev) =>
        prev ? { ...prev, status: value === "completed" } : null
      );
    }}
    className="col-span-3"
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="pending" id="pending" />
      <Label htmlFor="pending">Pending</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="completed" id="completed" />
      <Label htmlFor="completed">Completed</Label>
    </div>
  </RadioGroup>
</div>
  </div>
  <div className="flex justify-between">
    <Button variant="destructive" onClick={() => selectedTask && deleteTask(selectedTask.id)}>
      <Trash className="w-4 h-4 mr-2" />
      Delete
    </Button>
    <div className="space-x-2">
      <Button variant="outline" onClick={() => setSelectedEvent(null)}>
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button onClick={() => selectedEvent && updateEvent(selectedEvent)}>
        <Check className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </div>
  </div>
</DialogContent>
  </Dialog>
        ))}


                </div>)}

              </TabsContent>
              <TabsContent value="tomorrow">
               {isOptimizing ? (
                <div className="flex justify-center items-center">
                <LoadingSpinner />
              </div>
               ) : (              <div className="grid gap-4 py-4"> 
                {(isOptimized ? optimizedEvents : nextDayEvents)?.map((event) => (
    <Dialog key={event.event_id}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setSelectedEvent(event)} // Assuming you want to handle event selection similarly
        >
          <div className="flex items-center space-x-4 w-full">
          {event.priority ? (
            <div className={`w-4 h-4 ${getPriorityColor(event.priority)} rounded-full`} />
          ) : (
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
          )}
             {/* Customize the color as needed */}
            <div className="flex-1">
              <p className="font-medium">{event.title}</p> {/* Event title */}
              <p className="text-sm text-muted-foreground">
              {event.start && event.end ? (
                  <>
                    <span>{formatDate(event.start.dateTime || event.start)}</span>
                    {' - '}
                    <span>{formatDate(event.end.dateTime || event.end)}</span>
                  </>
                ) : (
                  'No start or end time available'
                )}
              </p>
              </div>
                {event.status ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
    <DialogHeader>
      <DialogTitle>Task Details</DialogTitle>
      <DialogDescription>View or edit task information</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Title
        </Label>
        <Input
          id="title"
          value={event.title}
          className="col-span-3"
          onChange={(e) =>
            setSelectedEvent((prev) => (prev ? { ...prev, title: e.target.value } : null))
          }
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="time" className="text-right">
          Time
        </Label>
        <Input
          id="time"
          value={selectedEvent?.start?.dateTime && selectedEvent?.end?.dateTime
            ? `${new Date(selectedEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedEvent.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'No time available'
          }
          className="col-span-3"
          onChange={(e) =>
            setSelectedEvent((prev) => (prev ? { ...prev, time: e.target.value } : null))
          }
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Priority
        </Label>
        <Select
         value={selectedEvent?.priority}
         onValueChange={(value) => {
           setSelectedEvent((prev) => (prev ? { ...prev, priority: value } : null));
         }}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value= {1}>Low</SelectItem>
            <SelectItem value= {2}>Medium</SelectItem>
            <SelectItem value= {3}>High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={selectedTask?.notes}
          className="col-span-3"
          onChange={(e) =>
            setSelectedTask((prev) => (prev ? { ...prev, notes: e.target.value } : null))
          }
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="status" className="text-right">
      Status
    </Label>
    <RadioGroup
      value={selectedEvent?.status ? "completed" : "pending"}
      onValueChange={(value) => {
        // Track the change locally in selectedEvent state
        setSelectedEvent((prev) =>
          prev ? { ...prev, status: value === "completed" } : null
        );
      }}
      className="col-span-3"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pending" id="pending" />
        <Label htmlFor="pending">Pending</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="completed" id="completed" />
        <Label htmlFor="completed">Completed</Label>
      </div>
    </RadioGroup>
  </div>
    </div>
    <div className="flex justify-between">
      <Button variant="destructive" onClick={() => selectedTask && deleteTask(selectedTask.id)}>
        <Trash className="w-4 h-4 mr-2" />
        Delete
      </Button>
      <div className="space-x-2">
        <Button variant="outline" onClick={() => setSelectedEvent(null)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={() => selectedEvent && updateEvent(selectedEvent)}>
          <Check className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  </DialogContent>
    </Dialog>
          ))}
                </div>)}


              </TabsContent>
              <TabsContent value="week">
                {isOptimizing ? (
                  <div className="flex justify-center items-center">
                  <LoadingSpinner />
                </div>
                ) : (                <div className="grid gap-4 py-4">
                  {(isOptimized ? optimizedEvents : currentWeekEvents)?.map((event) => (
        <Dialog key={event.event_id}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setSelectedEvent(event)} // Assuming you want to handle event selection similarly
            >
              <div className="flex items-center space-x-4 w-full">
              {event.priority ? (
                <div className={`w-4 h-4 ${getPriorityColor(event.priority)} rounded-full`} />
              ) : (
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
              )}
                {/* Customize the color as needed */}
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p> {/* Event title */}
                  <p className="text-sm text-muted-foreground">
                  {event.start && event.end ? (
                      <>
                        <span>{formatDate(event.start.dateTime || event.start)}</span>
                        {' - '}
                        <span>{formatDate(event.end.dateTime || event.end)}</span>
                      </>
                    ) : (
                      'No start or end time available'
                    )}
            </p> {/* Event time */}
                  </div>
                    {event.status ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
              </div>
</Button>
</DialogTrigger>
<DialogContent>
<DialogHeader>
<DialogTitle>Task Details</DialogTitle>
<DialogDescription>View or edit task information</DialogDescription>
</DialogHeader>
<div className="grid gap-4 py-4">
<div className="grid grid-cols-4 items-center gap-4">
<Label htmlFor="title" className="text-right">
  Title
</Label>
<Input
  id="title"
  value={event.title}
  className="col-span-3"
  onChange={(e) =>
    setSelectedEvent((prev) => (prev ? { ...prev, title: e.target.value } : null))
  }
/>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<Label htmlFor="time" className="text-right">
  Time
</Label>
<Input
  id="time"
  value={selectedEvent?.start?.dateTime && selectedEvent?.end?.dateTime
    ? `${new Date(selectedEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedEvent.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'No time available'
  }
  className="col-span-3"
  onChange={(e) =>
    setSelectedEvent((prev) => (prev ? { ...prev, time: e.target.value } : null))
  }
/>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<Label htmlFor="priority" className="text-right">
  Priority
</Label>
<Select
 value={selectedEvent?.priority}
 onValueChange={(value) => {
   setSelectedEvent((prev) => (prev ? { ...prev, priority: value } : null));
 }}
>
  <SelectTrigger className="col-span-3">
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value= {1}>Low</SelectItem>
    <SelectItem value= {2}>Medium</SelectItem>
    <SelectItem value= {3}>High</SelectItem>
  </SelectContent>
</Select>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<Label htmlFor="notes" className="text-right">
  Notes
</Label>
<Textarea
  id="notes"
  value={selectedTask?.notes}
  className="col-span-3"
  onChange={(e) =>
    setSelectedTask((prev) => (prev ? { ...prev, notes: e.target.value } : null))
  }
/>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<Label htmlFor="status" className="text-right">
Status
</Label>
<RadioGroup
value={selectedEvent?.status ? "completed" : "pending"}
onValueChange={(value) => {
// Track the change locally in selectedEvent state
setSelectedEvent((prev) =>
  prev ? { ...prev, status: value === "completed" } : null
);
}}
className="col-span-3"
>
<div className="flex items-center space-x-2">
<RadioGroupItem value="pending" id="pending" />
<Label htmlFor="pending">Pending</Label>
</div>
<div className="flex items-center space-x-2">
<RadioGroupItem value="completed" id="completed" />
<Label htmlFor="completed">Completed</Label>
</div>
</RadioGroup>
</div>
</div>
<div className="flex justify-between">
<Button variant="destructive" onClick={() => selectedTask && deleteTask(selectedTask.id)}>
<Trash className="w-4 h-4 mr-2" />
Delete
</Button>
<div className="space-x-2">
<Button variant="outline" onClick={() => setSelectedEvent(null)}>
  <X className="w-4 h-4 mr-2" />
  Cancel
</Button>
<Button onClick={() => selectedEvent && updateEvent(selectedEvent)}>
  <Check className="w-4 h-4 mr-2" />
  Save Changes
</Button>
</div>
</div>
</DialogContent>
</Dialog>
  ))}
          </div>)}

              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
