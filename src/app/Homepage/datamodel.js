const events1 = [
  {
    event_id: 1,
    title: "Morning meeting",
    priority: 3,
    start: "2024-11-30T09:00:00", // Fixed start time
    end: "2024-11-30T09:30:00", // Fixed end time
  },
  {
    event_id: 2,
    title: "Code review",
    priority: 2,
    start: null, // No fixed start time
    end: "2024-11-30T12:00:00", // Deadline
  },
  {
    event_id: 3,
    title: "Prepare presentation",
    priority: 1,
    start: null, // No fixed start time
    end: "2024-11-30T17:00:00", // Deadline
  },
  {
    event_id: 4,
    title: "Client call",
    priority: 3,
    start: "2024-11-30T10:30:00", // Fixed start time
    end: "2024-11-30T11:00:00", // Fixed end time
  },
];


const events2 = [
  {
    event_id: 1,
    title: "Write documentation",
    priority: 2,
    start: null, // No fixed start time
    end: "2024-12-01T15:00:00", // Deadline
  },
  {
    event_id: 2,
    title: "Plan team outing",
    priority: 1,
    start: null, // No fixed start time
    end: "2024-12-01T20:00:00", // Deadline
  },
  {
    event_id: 3,
    title: "Update website",
    priority: 3,
    start: null, // No fixed start time
    end: "2024-12-01T12:00:00", // Deadline
  },
];

const events3 = [
  {
    event_id: 1,
    title: "Fix production bug",
    priority: 3,
    start: null, // No fixed start time
    end: "2024-11-30T10:00:00", // Deadline
  },
  {
    event_id: 2,
    title: "Submit project proposal",
    priority: 3,
    start: null, // No fixed start time
    end: "2024-11-30T09:30:00", // Deadline
  },
  {
    event_id: 3,
    title: "Review team's code",
    priority: 2,
    start: null, // No fixed start time
    end: "2024-11-30T11:00:00", // Deadline
  },
  {
    event_id: 4,
    title: "Team lunch",
    priority: 1,
    start: "2024-11-30T12:00:00", // Fixed start time
    end: "2024-11-30T13:00:00", // Fixed end time
  },
];

const events4 = [
  {
    event_id: 1,
    title: "Daily standup meeting",
    priority: 3,
    start: "2024-11-29T08:00:00", // Fixed start time
    end: "2024-11-29T08:30:00", // Fixed end time
  },
  {
    event_id: 2,
    title: "One-on-one with manager",
    priority: 2,
    start: "2024-11-29T09:30:00", // Fixed start time
    end: "2024-11-29T10:00:00", // Fixed end time
  },
  {
    event_id: 3,
    title: "Project planning",
    priority: 1,
    start: "2024-11-29T10:30:00", // Fixed start time
    end: "2024-11-29T11:30:00", // Fixed end time
  },
];



export const optimizeSchedule = (events) => {
  const DEFAULT_DURATION_MINUTES = 30; // Default task duration in minutes

  // Sort events by priority (higher = more important), then by `end` (earliest deadlines first)
  const sortedEvents = [...events].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    // Check if end is valid for both events
    const endA = new Date(a.end).getTime() || new Date().getTime();
    const endB = new Date(b.end).getTime() || new Date().getTime();
    return endA - endB; // Handle invalid `end`
  });

  const schedule = [];
  let currentTime = new Date().toISOString(); // Start scheduling from now

  sortedEvents.forEach((event) => {
    // Ensure valid start time (fallback to current time if invalid)
    const eventStartTime = new Date(event.start);
    const validStartTime = isNaN(eventStartTime) ? new Date(currentTime) : eventStartTime;
    
    // Calculate end time based on start + default duration if `end` is missing
    let eventEndTime = new Date(event.end);  // Convert `end` to Date object first
    
    if (isNaN(eventEndTime.getTime())) {  // Check if `end` is invalid
      eventEndTime = new Date(validStartTime.getTime() + DEFAULT_DURATION_MINUTES * 60000);
    }

    // Ensure valid time constraints
    if (isNaN(validStartTime) || isNaN(eventEndTime)) {
      console.warn(`Event "${event.title}" has invalid time constraints and was skipped.`);
      return; // Skip scheduling this event
    }

    schedule.push({
      event_id: event.event_id,
      title: event.title,
      priority: event.priority,
      start: validStartTime.toISOString(),
      end: eventEndTime.toISOString(),
    });

    currentTime = eventEndTime.toISOString(); // Update current time
  });

  return schedule;
};

