package com.mikelmatilla.taskboard.task;

import java.time.LocalDateTime;

public record TaskRequest(
    String name,
    String description,
    TaskPriority priority,
    LocalDateTime dueDate,
    String assignedToEmail
) {}
