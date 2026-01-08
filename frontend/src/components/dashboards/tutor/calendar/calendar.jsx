import React, { useState, useEffect } from "react";
import tutorService from "../../../../services/tutorService";
import { useSubjects } from "../../../../contexts/SubjectsContext";
import "../../../../css/dashboards/tutor/calendar/calendar.css";

function getMonthMatrix(year, month) {
  // Returns a 2D array representing the weeks of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = firstDay.getDay();
  // Fill initial empty days
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let date = 1; date <= lastDay.getDate(); date++) {
    week.push(new Date(year, month, date));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  // Fill trailing empty days
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

function TutorCalendar() {
  const { getFlatSubjects } = useSubjects();
  const subjects = getFlatSubjects();
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  });
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', or 'day'
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [updateRecurringSeries, setUpdateRecurringSeries] = useState(false);
  const [newLesson, setNewLesson] = useState({
    studentId: "",
    subject: "",
    startAt: "",
    endAt: "",
    duration: 60,
    zoomLink: "",
    prepNotes: "",
    homework: "",
    isRecurring: false,
    recurrenceType: "weekly", // 'weekly' or 'monthly'
    recurrenceEndDate: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthMatrix = getMonthMatrix(year, month);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load lessons and students
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [lessonsRes, studentsRes] = await Promise.all([
          tutorService.getUpcomingLessons(),
          tutorService.getMyStudents(),
        ]);

        if (lessonsRes?.success && Array.isArray(lessonsRes.data)) {
          setLessons(lessonsRes.data);
        } else {
          setLessons([]);
        }

        if (studentsRes?.success && Array.isArray(studentsRes.data)) {
          setStudents(studentsRes.data);
        } else {
          setStudents([]);
        }
      } catch (e) {
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // Load once on mount - recurring instances are expanded client-side

  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  // Get week dates for week view
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get header text based on view mode
  const getHeaderText = () => {
    if (viewMode === 'month') {
      return `${monthNames[month]} ${year}`;
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates();
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];
      if (firstDay.getMonth() === lastDay.getMonth()) {
        return `${monthNames[firstDay.getMonth()]} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
      } else {
        return `${monthNames[firstDay.getMonth()]} ${firstDay.getDate()} - ${monthNames[lastDay.getMonth()]} ${lastDay.getDate()}, ${lastDay.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-AU', { 
        timeZone: 'Australia/Sydney',
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  // Helper function to set default lesson times
  const setDefaultTimes = (selectedDate) => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const now = new Date();
      
      // Set start time to next hour if today, or 9 AM if future date
      const startTime = new Date(date);
      if (date.toDateString() === now.toDateString()) {
        startTime.setHours(now.getHours() + 1, 0, 0, 0);
      } else {
        startTime.setHours(9, 0, 0, 0);
      }
      
      // Set end time to 1 hour after start time
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      
      const dateStr = formatForDateInput(startTime);
      const startTimeStr = formatForTimeInput(startTime);
      const endTimeStr = formatForTimeInput(endTime);

      setNewLesson(prev => ({
        ...prev,
        startAt: toSydneyISO(dateStr, startTimeStr),
        endAt: toSydneyISO(dateStr, endTimeStr),
        duration: 60
      }));
    }
  };

  // Helper function to calculate default recurrence end date (3 months from start)
  const getDefaultRecurrenceEndDate = (startDate) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split("T")[0];
  };

  // Create lesson
  const handleCreateLesson = async () => {
    try {
      const res = await tutorService.createLesson(newLesson);
      if (res?.success) {
        setLessons([res.data, ...lessons]);
        setShowCreateModal(false);
        setNewLesson({
          studentId: "",
          subject: "",
          startAt: "",
          endAt: "",
          duration: 60,
          zoomLink: "",
          prepNotes: "",
          homework: "",
          isRecurring: false,
          recurrenceType: "weekly",
          recurrenceEndDate: "",
        });
      } else {
        alert("Failed to create lesson: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to create lesson: " + e.message);
    }
  };

  // Update lesson
  const handleUpdateLesson = async () => {
    if (!editingLesson) return;
    
    try {
      const updates = {
        subject: editingLesson.subject,
        startAt: editingLesson.startAt,
        endAt: editingLesson.endAt,
        zoomLink: editingLesson.zoomLink || "",
        prepNotes: editingLesson.prepNotes || "",
        homework: editingLesson.homework || "",
      };

      const res = await tutorService.updateLesson(editingLesson.id, {
        ...updates,
        updateRecurringSeries,
      });

      if (res?.success) {
        // Refresh lessons
        const lessonsRes = await tutorService.getUpcomingLessons();
        if (lessonsRes?.success && Array.isArray(lessonsRes.data)) {
          setLessons(lessonsRes.data);
        }
        setShowEditModal(false);
        setEditingLesson(null);
        setUpdateRecurringSeries(false);
        alert("Lesson updated successfully!");
      } else {
        alert("Failed to update lesson: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to update lesson: " + e.message);
    }
  };

  // Mark session as complete
  const handleMarkComplete = async (deliveryMode = 'online') => {
    if (!editingLesson) return;
    
    try {
      const res = await tutorService.markSessionComplete(editingLesson.id, deliveryMode);
      if (res?.success) {
        // Refresh lessons
        const lessonsRes = await tutorService.getUpcomingLessons();
        if (lessonsRes?.success && Array.isArray(lessonsRes.data)) {
          setLessons(lessonsRes.data);
        }
        setShowEditModal(false);
        setEditingLesson(null);
        alert("Session marked as complete! The student will be notified to confirm.");
      } else {
        alert("Failed to mark session complete: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to mark session complete: " + e.message);
    }
  };

  // Helper function to get timezone abbreviation (AEST/AEDT)
  const getTimezoneAbbr = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const formatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        timeZoneName: "short",
      });
      const parts = formatter.formatToParts(date);
      const tzPart = parts.find((part) => part.type === "timeZoneName");
      return tzPart ? tzPart.value : "AEST";
    } catch (e) {
      return "AEST";
    }
  };

  // Generate time slots for dropdown (12-hour format, 15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    // Start from 12:00, 12:15, 12:30, 12:45, then 1:00...
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (const hour of hours) {
      for (let min = 0; min < 60; min += 15) {
        const m = String(min).padStart(2, "0");
        const displayTime = `${hour}:${m}`;
        slots.push(displayTime);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Helper to split 24h time into 12h time and period
  const parseTimeParts = (time24) => {
    if (!time24) return { time: "9:00", period: "AM" };
    const [h24, m] = time24.split(":").map(Number);
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return { time: `${h12}:${String(m).padStart(2, "0")}`, period };
  };

  // Helper to combine 12h time and period into 24h time
  const combineTimeParts = (time12, period) => {
    const [h12, m] = time12.split(":").map(Number);
    let h24 = h12;
    if (period === "PM" && h12 < 12) h24 += 12;
    if (period === "AM" && h12 === 12) h24 = 0;
    return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Helper to combine Sydney date and time into a UTC ISO string
  const toSydneyISO = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const [hh, mm] = timeStr.split(':').map(Number);
      
      // Create a date in UTC as a starting point
      let date = new Date(Date.UTC(y, m - 1, d, hh, mm));
      
      // Find what time it would be in Sydney if it were this UTC time
      const formatter = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const sY = parseInt(parts.find(p => p.type === 'year').value);
      const sM = parseInt(parts.find(p => p.type === 'month').value);
      const sD = parseInt(parts.find(p => p.type === 'day').value);
      const sH = parseInt(parts.find(p => p.type === 'hour').value);
      const sMin = parseInt(parts.find(p => p.type === 'minute').value);
      
      // Handle the case where hour might be 24
      const normalizedH = sH === 24 ? 0 : sH;
      
      const sydneyDate = Date.UTC(sY, sM - 1, sD, normalizedH, sMin);
      const diff = sydneyDate - date.getTime();
      
      return new Date(date.getTime() - diff).toISOString();
    } catch (e) {
      console.error("Error converting to Sydney ISO:", e);
      return `${dateStr}T${timeStr}:00Z`; // Fallback
    }
  };

  // Custom TimePicker component with split dropdowns
  const TimePicker = ({ value, onChange }) => {
    const { time, period } = parseTimeParts(value);

    return (
      <div className="d-flex gap-2">
        <select 
          className="form-select tutor-calendar-time-select"
          value={time}
          onChange={(e) => onChange(combineTimeParts(e.target.value, period))}
        >
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        <select 
          className="form-select tutor-calendar-period-select"
          style={{ width: '80px' }}
          value={period}
          onChange={(e) => onChange(combineTimeParts(time, e.target.value))}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  };

  // Helper to format date for input (YYYY-MM-DD) in Australia/Sydney
  const formatForDateInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      
      // Use Intl to get parts in Sydney time
      const formatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const parts = formatter.formatToParts(date);
      const year = parts.find(p => p.type === "year").value;
      const month = parts.find(p => p.type === "month").value;
      const day = parts.find(p => p.type === "day").value;
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  // Helper to format time for input (HH:mm) in Australia/Sydney
  const formatForTimeInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      
      return date.toLocaleTimeString("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return "";
    }
  };

  // Helper functions
  const formatTime = (dateStr) => {
    if (!dateStr) return "Invalid time";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid time";
      const timeStr = date.toLocaleTimeString("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const tzAbbr = getTimezoneAbbr(dateStr);
      return `${timeStr} ${tzAbbr}`;
    } catch (e) {
      return "Invalid time";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Invalid date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid date";
      
      // Create dates in Australia timezone for comparison
      const now = new Date();
      const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const lessonDate = new Date(date.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      
      if (lessonDate.toDateString() === today.toDateString()) return "Today";
      if (lessonDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
      
      return date.toLocaleDateString("en-AU", {
        timeZone: "Australia/Sydney",
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Expand recurring lessons to show all instances on calendar
  const expandRecurringLessons = (lessons, viewStartDate, viewEndDate) => {
    const expanded = [];
    
    lessons.forEach((lesson) => {
      // Always include the original lesson
      expanded.push(lesson);
      
      // If lesson has recurrenceRule, expand it
      if (lesson.recurrenceRule && lesson.seriesId) {
        const instances = generateRecurringInstances(lesson, viewStartDate, viewEndDate);
        expanded.push(...instances);
      }
    });
    
    return expanded;
  };

  // Generate recurring instances based on RRULE
  const generateRecurringInstances = (lesson, viewStartDate, viewEndDate) => {
    const instances = [];
    const startDate = new Date(lesson.startAt);
    const endDate = new Date(lesson.endAt);
    const duration = endDate - startDate;
    
    // Parse RRULE
    const rrule = lesson.recurrenceRule;
    if (!rrule) return instances;
    
    // Extract frequency
    const freqMatch = rrule.match(/FREQ=(\w+)/);
    if (!freqMatch) return instances;
    
    const frequency = freqMatch[1].toLowerCase();
    
    // Extract UNTIL date if present
    const untilMatch = rrule.match(/UNTIL=([^;]+)/);
    let untilDate = null;
    if (untilMatch) {
      const untilStr = untilMatch[1];
      // Parse YYYYMMDDTHHMMSSZ format
      if (untilStr.length >= 15) {
        const year = untilStr.substring(0, 4);
        const month = untilStr.substring(4, 6);
        const day = untilStr.substring(6, 8);
        untilDate = new Date(`${year}-${month}-${day}T23:59:59Z`);
      }
    }
    
    // Set view boundaries (3 months ahead for calendar display)
    const now = new Date();
    const maxDate = viewEndDate || new Date(now.getFullYear(), now.getMonth() + 3, 0);
    const endBoundary = untilDate && untilDate < maxDate ? untilDate : maxDate;
    
    // Generate instances
    let currentDate = new Date(startDate);
    let iteration = 0;
    const maxIterations = frequency === 'weekly' ? 52 : 12; // Prevent infinite loops
    
    while (currentDate <= endBoundary && iteration < maxIterations) {
      // Skip the original instance (already added)
      if (currentDate.getTime() !== startDate.getTime()) {
        const instanceEnd = new Date(currentDate.getTime() + duration);
        
        // Only include if within view range
        if (currentDate >= viewStartDate && currentDate <= endBoundary) {
          instances.push({
            ...lesson,
            id: `${lesson.id}-recur-${iteration}`, // Unique ID for display
            startAt: currentDate.toISOString(),
            endAt: instanceEnd.toISOString(),
            isRecurringInstance: true, // Flag to identify expanded instances
            originalLessonId: lesson.id,
          });
        }
      }
      
      // Move to next occurrence
      if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        break; // Unknown frequency
      }
      
      iteration++;
    }
    
    return instances;
  };

  const getLessonsForDate = (dateStr) => {
    if (!dateStr) return [];
    
    // Get view boundaries (current month)
    const viewStart = new Date(year, month, 1);
    const viewEnd = new Date(year, month + 1, 0);
    
    // Expand recurring lessons
    const expandedLessons = expandRecurringLessons(lessons, viewStart, viewEnd);
    
    return expandedLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.startAt);
      const targetDate = new Date(dateStr);
      
      // Compare dates in Australia timezone
      const lessonDateStr = lessonDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
      const targetDateStr = targetDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
      
      return lessonDateStr === targetDateStr;
    });
  };

  return (
    <div className="tutor-calendar-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="tutor-calendar-content">
            {/* Calendar Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between tutor-calendar-header mb-3">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-link tutor-calendar-nav-btn"
                  onClick={goToPrevious}
                  aria-label="Previous"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h4 className="tutor-calendar-title mb-0">
                  {getHeaderText()}
                </h4>
                <button
                  className="btn btn-link tutor-calendar-nav-btn"
                  onClick={goToNext}
                  aria-label="Next"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus me-1"></i>
                  Schedule Lesson
                </button>
                <div
                  className="btn-group tutor-calendar-view-toggle"
                  role="group"
                >
                  <button 
                    className={`btn tutor-calendar-view-btn ${viewMode === 'month' ? 'btn-dark active' : 'btn-outline-dark'}`}
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </button>
                  <button 
                    className={`btn tutor-calendar-view-btn ${viewMode === 'week' ? 'btn-dark active' : 'btn-outline-dark'}`}
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </button>
                  <button 
                    className={`btn tutor-calendar-view-btn ${viewMode === 'day' ? 'btn-dark active' : 'btn-outline-dark'}`}
                    onClick={() => setViewMode('day')}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Calendar Views */}
            {viewMode === 'month' && (
              <div className="tutor-calendar-section tutor-calendar-calendar-section mb-4">
                <div className="alert alert-info mb-3" role="alert">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Tip:</strong> Click on any date to quickly schedule a lesson for that day, or use the "Schedule Lesson" button for more control.
                </div>
                <div className="table-responsive">
                  <table className="table tutor-calendar-table mb-0">
                    <thead>
                      <tr>
                        {daysShort.map((d) => (
                          <th key={d} className="tutor-calendar-th text-center">
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthMatrix.map((week, i) => (
                        <tr key={i}>
                        {week.map((date, j) => {
                            const dateStr = date
                              ? `${date.getFullYear()}-${String(
                                  date.getMonth() + 1
                                ).padStart(2, "0")}-${String(
                                  date.getDate()
                                ).padStart(2, "0")}`
                              : "";
                            const dayLessons = date
                              ? getLessonsForDate(dateStr)
                              : [];
                            
                            // Check if date is in the past
                            const now = new Date();
                            const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
                            today.setHours(0, 0, 0, 0);
                            const isPastDate = date && date < today;
                            
                            return (
                              <td
                                key={j}
                                className={`tutor-calendar-td align-top ${
                                  date ? "" : "tutor-calendar-empty"
                                }${isPastDate ? " tutor-calendar-past-date" : ""}`}
                                onClick={() => {
                                  if (date && !isPastDate) {
                                    setDefaultTimes(dateStr);
                                    setShowCreateModal(true);
                                  }
                                }}
                                style={{ cursor: date && !isPastDate ? 'pointer' : 'default' }}
                                title={isPastDate ? 'Past dates cannot be scheduled' : ''}
                              >
                                {date && (
                                  <div className={`tutor-calendar-date-cell${isPastDate ? ' tutor-calendar-past-cell' : ''}`}>
                                    <div className={`tutor-calendar-date-num${isPastDate ? ' text-muted' : ''}`}>
                                      {date.getDate()}
                                    </div>
                                    {dayLessons.map((lesson, idx) => (
                                      <div
                                        className="tutor-calendar-lesson-card mt-1"
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const lessonToEdit = lesson.isRecurringInstance 
                                            ? lessons.find(l => l.id === lesson.originalLessonId) || lesson
                                            : lesson;
                                          setEditingLesson(lessonToEdit);
                                          setUpdateRecurringSeries(false);
                                          setShowEditModal(true);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                        title={`Click to edit lesson${lesson.isRecurringInstance ? ' (recurring)' : ''}`}
                                      >
                                        <span className="tutor-calendar-lesson-title">
                                          {lesson.subject}
                                        </span>
                                        <span className="tutor-calendar-lesson-time ms-1">
                                          {formatTime(lesson.startAt)}
                                        </span>
                                        {(lesson.seriesId || lesson.isRecurringInstance) && (
                                          <i className="fas fa-sync-alt tutor-calendar-lesson-icon ms-1 text-info" title="Recurring lesson"></i>
                                        )}
                                        {lesson.zoomLink && (
                                          <i className="fas fa-video tutor-calendar-lesson-icon ms-1"></i>
                                        )}
                                        <div className="text-muted small">
                                          {lesson.student?.firstName}{" "}
                                          {lesson.student?.lastName}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="tutor-calendar-section tutor-calendar-calendar-section mb-4">
                <div className="table-responsive">
                  <table className="table tutor-calendar-table mb-0">
                    <thead>
                      <tr>
                        {getWeekDates().map((date, i) => {
                          const now = new Date();
                          const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
                          today.setHours(0, 0, 0, 0);
                          const isToday = date.toDateString() === today.toDateString();
                          return (
                            <th key={i} className={`tutor-calendar-th text-center ${isToday ? 'bg-primary text-white' : ''}`}>
                              <div>{daysShort[date.getDay()]}</div>
                              <div className="fw-bold">{date.getDate()}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {getWeekDates().map((date, i) => {
                          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                          const dayLessons = getLessonsForDate(dateStr);
                          const now = new Date();
                          const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
                          today.setHours(0, 0, 0, 0);
                          const isPastDate = date < today;
                          
                          return (
                            <td 
                              key={i} 
                              className={`tutor-calendar-td align-top${isPastDate ? ' tutor-calendar-past-date' : ''}`}
                              style={{ minHeight: '200px', cursor: isPastDate ? 'not-allowed' : 'pointer' }}
                              onClick={() => {
                                if (!isPastDate) {
                                  setDefaultTimes(dateStr);
                                  setShowCreateModal(true);
                                }
                              }}
                            >
                              <div className={`tutor-calendar-date-cell${isPastDate ? ' tutor-calendar-past-cell' : ''}`}>
                                {dayLessons.length === 0 ? (
                                  <div className="text-muted small text-center py-2">No lessons</div>
                                ) : (
                                  dayLessons.map((lesson, idx) => (
                                    <div
                                      className="tutor-calendar-lesson-card mb-2"
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const lessonToEdit = lesson.isRecurringInstance 
                                          ? lessons.find(l => l.id === lesson.originalLessonId) || lesson
                                          : lesson;
                                        setEditingLesson(lessonToEdit);
                                        setShowEditModal(true);
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <div className="tutor-calendar-lesson-title">{lesson.subject}</div>
                                      <div className="tutor-calendar-lesson-time small">{formatTime(lesson.startAt)}</div>
                                      <div className="text-muted small">{lesson.student?.firstName} {lesson.student?.lastName}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Day View */}
            {viewMode === 'day' && (() => {
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
              const dayLessons = getLessonsForDate(dateStr);
              const now = new Date();
              const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
              today.setHours(0, 0, 0, 0);
              const isPastDate = currentDate < today;
              
              return (
                <div className="tutor-calendar-section tutor-calendar-calendar-section mb-4">
                  <div className="tutor-calendar-card">
                    <div className="tutor-calendar-card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                          {currentDate.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h5>
                        {!isPastDate && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setDefaultTimes(dateStr);
                              setShowCreateModal(true);
                            }}
                          >
                            <i className="fas fa-plus me-1"></i>Add Lesson
                          </button>
                        )}
                      </div>
                      
                      {isPastDate && (
                        <div className="alert alert-secondary mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          This is a past date. You cannot schedule new lessons for past dates.
                        </div>
                      )}
                      
                      {dayLessons.length === 0 ? (
                        <div className="text-muted text-center py-5">
                          <i className="fas fa-calendar-day fa-3x mb-3 d-block"></i>
                          No lessons scheduled for this day.
                          {!isPastDate && (
                            <button 
                              className="btn btn-primary mt-3"
                              onClick={() => {
                                setDefaultTimes(dateStr);
                                setShowCreateModal(true);
                              }}
                            >
                              Schedule a Lesson
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="tutor-calendar-day-lessons">
                          {dayLessons.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).map((lesson, idx) => (
                            <div 
                              key={idx} 
                              className="tutor-calendar-day-lesson-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const lessonToEdit = lesson.isRecurringInstance 
                                  ? lessons.find(l => l.id === lesson.originalLessonId) || lesson
                                  : lesson;
                                setEditingLesson(lessonToEdit);
                                setShowEditModal(true);
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div className="tutor-calendar-upcoming-dot me-3" style={{ width: '8px', height: '8px' }}></div>
                                <div>
                                  <div className="fw-bold">{lesson.subject}</div>
                                  <div className="text-muted small">
                                    {formatTime(lesson.startAt)} - {formatTime(lesson.endAt)}
                                  </div>
                                  <div className="small">{lesson.student?.firstName} {lesson.student?.lastName}</div>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {lesson.seriesId && <span className="badge bg-info">Recurring</span>}
                                {lesson.zoomLink && (
                                  <a 
                                    href={lesson.zoomLink} 
                                    className="btn btn-sm btn-dark"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <i className="fas fa-video me-1"></i>Join
                                  </a>
                                )}
                                <button className="btn btn-sm btn-outline-secondary">
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Upcoming Lessons Section */}
            <div className="tutor-calendar-section tutor-calendar-upcoming-section">
              <h4 className="tutor-calendar-section-title mb-3">
                Upcoming Lessons
              </h4>
              <div className="tutor-calendar-card tutor-calendar-upcoming-card">
                <div className="tutor-calendar-card-body">
                  {lessons.length === 0 && !loading ? (
                    <div className="text-muted text-center py-4">
                      No upcoming lessons scheduled. Click "Schedule Lesson" to
                      create one.
                    </div>
                  ) : (
                    lessons.slice(0, 5).map((lesson, idx) => (
                      <div
                        className="tutor-calendar-upcoming-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3"
                        key={idx}
                      >
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                          <span className="tutor-calendar-upcoming-dot me-2"></span>
                          <div>
                            <div className="tutor-calendar-upcoming-title">
                              {lesson.subject} - {lesson.student?.firstName}{" "}
                              {lesson.student?.lastName}
                              {lesson.seriesId && (
                                <span className="badge bg-info ms-2" title="Recurring lesson">
                                  <i className="fas fa-sync-alt me-1"></i>Recurring
                                </span>
                              )}
                            </div>
                            <div className="tutor-calendar-upcoming-time text-muted small">
                              {formatDate(lesson.startAt)},{" "}
                              {formatTime(lesson.startAt)} -{" "}
                              {formatTime(lesson.endAt)}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLesson(lesson);
                              setUpdateRecurringSeries(false);
                              setShowEditModal(true);
                            }}
                            title="Edit lesson"
                          >
                            <i className="fas fa-edit me-1"></i>Edit
                          </button>
                          {lesson.prepNotes && (
                            <span
                              className="text-muted small"
                              title={lesson.prepNotes}
                            >
                              <i className="fas fa-sticky-note"></i>
                            </span>
                          )}
                          {lesson.zoomLink ? (
                            <a
                              href={lesson.zoomLink}
                              className="btn btn-dark btn-sm tutor-calendar-join-btn"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-video me-1"></i>Join Zoom
                            </a>
                          ) : (
                            <span className="text-muted small">
                              No Zoom link
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Create Lesson Modal */}
            {showCreateModal && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Schedule New Lesson</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowCreateModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Student</label>
                            <select
                              className="form-select"
                              value={newLesson.studentId}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  studentId: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Student</option>
                              {students.map((assignment) => (
                                <option
                                  key={assignment.id}
                                  value={assignment.student?.id}
                                >
                                  {assignment.student?.firstName}{" "}
                                  {assignment.student?.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Subject</label>
                            <select
                              className="form-select"
                              value={newLesson.subject}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  subject: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject.id} value={subject.name}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={newLesson.startAt ? newLesson.startAt.split('T')[0] : ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                const currentTime = newLesson.startAt ? newLesson.startAt.split('T')[1] : '09:00';
                                const newStartAt = `${selectedDate}T${currentTime}`;
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(startDate);
                                endDate.setHours(endDate.getHours() + 1);
                                
                                setNewLesson({
                                  ...newLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString().slice(0, 16),
                                  recurrenceEndDate: newLesson.isRecurring && !newLesson.recurrenceEndDate
                                    ? getDefaultRecurrenceEndDate(newStartAt)
                                    : newLesson.recurrenceEndDate,
                                });
                              }}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Duration</label>
                            <select
                              className="form-select"
                              value={newLesson.duration || '60'}
                              onChange={(e) => {
                                const duration = parseInt(e.target.value);
                                const startTime = newLesson.startAt;
                                if (startTime) {
                                  const startDate = new Date(startTime);
                                  const endDate = new Date(startDate);
                                  endDate.setMinutes(endDate.getMinutes() + duration);
                                  
                                  setNewLesson({
                                    ...newLesson,
                                    duration: duration,
                                    endAt: endDate.toISOString().slice(0, 16)
                                  });
                                }
                              }}
                            >
                              <option value="30">30 minutes</option>
                              <option value="45">45 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                            </select>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Start Time</label>
                            <TimePicker
                              value={formatForTimeInput(newLesson.startAt)}
                              onChange={(selectedTime) => {
                                const currentDate = formatForDateInput(newLesson.startAt) || new Date().toISOString().split('T')[0];
                                const newStartAt = toSydneyISO(currentDate, selectedTime);
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(startDate);
                                endDate.setMinutes(endDate.getMinutes() + (parseInt(newLesson.duration) || 60));
                                
                                setNewLesson({
                                  ...newLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString()
                                });
                              }}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">End Time</label>
                            <TimePicker
                              value={formatForTimeInput(newLesson.endAt)}
                              onChange={(selectedTime) => {
                                const currentDate = formatForDateInput(newLesson.endAt) || new Date().toISOString().split('T')[0];
                                const newEndAt = toSydneyISO(currentDate, selectedTime);
                                
                                setNewLesson({
                                  ...newLesson,
                                  endAt: newEndAt
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isRecurring"
                              checked={newLesson.isRecurring}
                              onChange={(e) => {
                                const isRecurring = e.target.checked;
                                setNewLesson({
                                  ...newLesson,
                                  isRecurring,
                                  recurrenceEndDate: isRecurring && newLesson.startAt
                                    ? getDefaultRecurrenceEndDate(newLesson.startAt)
                                    : newLesson.recurrenceEndDate,
                                });
                              }}
                            />
                            <label className="form-check-label" htmlFor="isRecurring">
                              <strong>Recurring Lesson</strong>
                            </label>
                          </div>
                        </div>
                        {newLesson.isRecurring && (
                          <div className="mb-3 p-3 border rounded bg-light">
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Recurrence Type</label>
                                <select
                                  className="form-select"
                                  value={newLesson.recurrenceType}
                                  onChange={(e) =>
                                    setNewLesson({
                                      ...newLesson,
                                      recurrenceType: e.target.value,
                                    })
                                  }
                                >
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">End Date (Optional)</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={newLesson.recurrenceEndDate}
                                  min={newLesson.startAt ? newLesson.startAt.split('T')[0] : ''}
                                  onChange={(e) =>
                                    setNewLesson({
                                      ...newLesson,
                                      recurrenceEndDate: e.target.value,
                                    })
                                  }
                                />
                                <small className="text-muted">
                                  Leave empty for no end date. Default: 3 months from start.
                                </small>
                              </div>
                            </div>
                            {newLesson.startAt && (
                              <div className="mt-2">
                                <small className="text-info">
                                  <i className="fas fa-info-circle me-1"></i>
                                  This lesson will repeat {newLesson.recurrenceType === "weekly" ? "every week" : "every month"} on the same day and time
                                  {newLesson.recurrenceEndDate
                                    ? ` until ${new Date(newLesson.recurrenceEndDate).toLocaleDateString("en-AU", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}`
                                    : " indefinitely"}
                                </small>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">
                            Zoom Link (Optional)
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            value={newLesson.zoomLink}
                            onChange={(e) =>
                              setNewLesson({
                                ...newLesson,
                                zoomLink: e.target.value,
                              })
                            }
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Preparation Notes (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={newLesson.prepNotes}
                            onChange={(e) =>
                              setNewLesson({
                                ...newLesson,
                                prepNotes: e.target.value,
                              })
                            }
                            placeholder="What should the student prepare for this lesson?"
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Homework (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={newLesson.homework}
                            onChange={(e) =>
                              setNewLesson({
                                ...newLesson,
                                homework: e.target.value,
                              })
                            }
                            placeholder="Homework assignments for after the lesson"
                          ></textarea>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleCreateLesson}
                        disabled={
                          !newLesson.studentId ||
                          !newLesson.subject ||
                          !newLesson.startAt ||
                          !newLesson.endAt
                        }
                      >
                        Schedule Lesson
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Lesson Modal */}
            {showEditModal && editingLesson && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Lesson</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingLesson(null);
                          setUpdateRecurringSeries(false);
                        }}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {editingLesson.seriesId && (
                        <div className="alert alert-warning mb-3">
                          <strong>
                            <i className="fas fa-sync-alt me-2"></i>This is a recurring lesson
                          </strong>
                          <div className="form-check mt-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="updateRecurringSeries"
                              checked={updateRecurringSeries}
                              onChange={(e) => setUpdateRecurringSeries(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="updateRecurringSeries">
                              Apply changes to all lessons in this recurring series
                            </label>
                          </div>
                          {!updateRecurringSeries && (
                            <small className="text-muted d-block mt-2">
                              If unchecked, only this lesson will be updated and it will be removed from the recurring series.
                            </small>
                          )}
                        </div>
                      )}
                      <form>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Subject</label>
                            <select
                              className="form-select"
                              value={editingLesson.subject || ""}
                              onChange={(e) =>
                                setEditingLesson({
                                  ...editingLesson,
                                  subject: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject.id} value={subject.name}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={formatForDateInput(editingLesson.startAt)}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                const currentTime = formatForTimeInput(editingLesson.startAt) || '09:00';
                                const newStartAt = toSydneyISO(selectedDate, currentTime);
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(editingLesson.endAt || newStartAt);
                                const duration = (endDate - startDate) / (1000 * 60);
                                endDate.setTime(startDate.getTime() + duration * 60 * 1000);
                                
                                setEditingLesson({
                                  ...editingLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString(),
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Start Time</label>
                            <TimePicker
                              value={formatForTimeInput(editingLesson.startAt)}
                              onChange={(selectedTime) => {
                                const currentDate = formatForDateInput(editingLesson.startAt) || new Date().toISOString().split('T')[0];
                                const newStartAt = toSydneyISO(currentDate, selectedTime);
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(editingLesson.endAt || newStartAt);
                                const duration = (endDate - startDate) / (1000 * 60);
                                endDate.setTime(startDate.getTime() + duration * 60 * 1000);
                                
                                setEditingLesson({
                                  ...editingLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString(),
                                });
                              }}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">End Time</label>
                            <TimePicker
                              value={formatForTimeInput(editingLesson.endAt)}
                              onChange={(selectedTime) => {
                                const currentDate = formatForDateInput(editingLesson.endAt) || new Date().toISOString().split('T')[0];
                                const newEndAt = toSydneyISO(currentDate, selectedTime);
                                
                                setEditingLesson({
                                  ...editingLesson,
                                  endAt: newEndAt,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Zoom Link (Optional)
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            value={editingLesson.zoomLink || ""}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                zoomLink: e.target.value,
                              })
                            }
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Preparation Notes (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editingLesson.prepNotes || ""}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                prepNotes: e.target.value,
                              })
                            }
                            placeholder="What should the student prepare for this lesson?"
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Homework (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editingLesson.homework || ""}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                homework: e.target.value,
                              })
                            }
                            placeholder="Homework assignments for after the lesson"
                          ></textarea>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      {/* Show Mark Complete button for scheduled lessons */}
                      {/* TEMP: Removed time check for testing - revert by adding: && new Date(editingLesson.endAt) < new Date() */}
                      {editingLesson && editingLesson.status === 'scheduled' && (
                        <button
                          type="button"
                          className="btn btn-success me-auto"
                          onClick={() => handleMarkComplete('online')}
                        >
                          <i className="fas fa-check-circle me-1"></i>
                          Mark as Complete
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingLesson(null);
                          setUpdateRecurringSeries(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpdateLesson}
                        disabled={
                          !editingLesson.subject ||
                          !editingLesson.startAt ||
                          !editingLesson.endAt
                        }
                      >
                        Update Lesson
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorCalendar;
