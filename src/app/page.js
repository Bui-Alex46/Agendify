"use client"
import { useState } from "react"
import { Bell, Calendar, Check, Clock, Cloud, Edit, Sun, Trash, X, Zap } from "lucide-react"
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


export default function HomePage() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Team Meeting", time: "9:00 AM - 10:00 AM", priority: "high", completed: false },
    { id: "2", title: "Client Call", time: "11:00 AM - 12:00 PM", priority: "medium", completed: false },
    { id: "3", title: "Project Review", time: "2:00 PM - 3:00 PM", priority: "low", completed: false },
  ])

  const [selectedTask, setSelectedTask] = useState(null)

  const updateTask = (updatedTask) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setSelectedTask(null)
  }

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    setSelectedTask(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
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
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Weather</CardTitle>
              <Sun className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cloud className="w-8 h-8 mr-2 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">72°F</p>
                    <p className="text-sm text-muted-foreground">Partly Cloudy</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Recommendation:</p>
                  <p className="text-sm text-muted-foreground">Light jacket</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
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
            <CardTitle>Detailed Schedule</CardTitle>
            <CardDescription>Click on a task to view or edit details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full">
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                <div className="space-y-4">
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
                              value={selectedTask?.completed ? "completed" : "pending"}
                              onValueChange={(value) =>
                                setSelectedTask((prev) =>
                                  prev ? { ...prev, completed: value === "completed" } : null
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
                </div>
              </TabsContent>
              <TabsContent value="tomorrow">
                <div className="text-center py-4 text-muted-foreground">No tasks scheduled for tomorrow.</div>
              </TabsContent>
              <TabsContent value="week">
                <div className="text-center py-4 text-muted-foreground">Weekly view coming soon.</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}