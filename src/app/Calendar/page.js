"use client"
import {useState } from 'react'
import {Calendar} from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Clock, Zap } from "lucide-react"
import Link from "next/link";


const CalendarPage = () => {


  const [selectedDate, setSelectedDate] = useState(new Date())

  const tasks = [
    { id: "1", title: "Team Meeting", date: new Date(2023, 5, 15), time: "9:00 AM - 10:00 AM", priority: "high", completed: false },
    { id: "2", title: "Client Call", date: new Date(2023, 5, 15), time: "11:00 AM - 12:00 PM", priority: "medium", completed: false },
    { id: "3", title: "Project Review", date: new Date(2023, 5, 15), time: "2:00 PM - 3:00 PM", priority: "low", completed: true },
    { id: "4", title: "Quarterly Planning", date: new Date(2023, 5, 20), time: "10:00 AM - 12:00 PM", priority: "high", completed: false },
    { id: "5", title: "Team Lunch", date: new Date(2023, 5, 22), time: "12:30 PM - 2:00 PM", priority: "low", completed: false },
  ]
  const getTasksForDate = (date) => {
    return tasks.filter(
      (task) =>
        task.date.getFullYear() === date.getFullYear() &&
        task.date.getMonth() === date.getMonth() &&
        task.date.getDate() === date.getDate()
    )
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
        return "bg-blue-500"
    }
  }

  return (
    
    <Card>
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <Zap className="h-6 w-6" />
          <span className="ml-2 text-lg font-bold">Agendify</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/Homepage">
            Dashboard
          </Link>
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
      <CardHeader>
        <CardTitle>Calendar View</CardTitle>
        <CardDescription>Overview of your schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-lg font-semibold mb-4">
              Tasks for {selectedDate?.toLocaleDateString()}
            </h3>
            <div className="space-y-4">
              {getTasksForDate(selectedDate || new Date()).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 ${getPriorityColor(task.priority)} rounded-full`} />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.time}</p>
                    </div>
                  </div>
                  {task.completed ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
              {getTasksForDate(selectedDate || new Date()).length === 0 && (
                <p className="text-muted-foreground">No tasks scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CalendarPage
