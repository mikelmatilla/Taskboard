package com.mikelmatilla.taskboard.task;

import java.time.LocalDateTime;

public record TaskUpdateRequest(
    String name,
    String description,
    TaskState state,
    TaskPriority priority,
    LocalDateTime dueDate,
    String assignedToEmail
) {}
