const tasks = [
    {
      id: 1,
      title: "Task 1",
      priority: 3, // 1 = Low, 2 = Medium, 3 = High
      deadline: "2024-11-20T18:00:00",
      dependencies: [], // Task IDs that must be completed first
    },
    {
        id: 2,
        title: "Task 2",
        priority: 2, // 1 = Low, 2 = Medium, 3 = High
        deadline: "2024-11-20T19:00:00",
        dependencies: [], // Task IDs that must be completed first
    },
    {
        id: 3,
        title: "Task 3",
        priority: 2, // 1 = Low, 2 = Medium, 3 = High
        deadline: "2024-11-20T20:00:00",
        dependencies: [], // Task IDs that must be completed first
    },
    {
        id: 4,
        title: "Task 4",
        priority: 3, // 1 = Low, 2 = Medium, 3 = High
        deadline: "2024-11-20T20:00:00",
        dependencies: [], // Task IDs that must be completed first
    },
    

  ];


  function optimizeSchedule(tasks) {
    const DEFAULT_DURATION_MINUTES = 30; // Default task duration in minutes
  
    // Sort tasks by priority, then by earliest deadline
    const sortedTasks = [...tasks].sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return new Date(a.deadline) - new Date(b.deadline); // Earlier deadline first
    });
  
    const schedule = [];
    let currentTime = new Date().toISOString(); // Start scheduling from now
  
    sortedTasks.forEach((task) => {
      const startTime = new Date(currentTime);
      const endTime = new Date(startTime.getTime() + DEFAULT_DURATION_MINUTES * 60000);
  
      // Add the task to the schedule
      schedule.push({
        ...task,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
  
      // Update the current time
      currentTime = endTime.toISOString();
    });
  
    return schedule;
  }
  
  // Example usage
  const optimizedSchedule = optimizeSchedule(tasks);
  console.log(optimizedSchedule);