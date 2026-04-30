package com.mikelmatilla.taskboard.task;

import com.mikelmatilla.taskboard.user.UserResponse;
import java.time.LocalDateTime;

public record TaskResponse(
    Long id,
    String name,
    String description,
    TaskState state,
    TaskPriority priority,
    UserResponse createdBy,
    UserResponse assignedTo,
    LocalDateTime dueDate,
    LocalDateTime creationDate,
    LocalDateTime lastUpdateDate
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
            task.getId(),
            task.getName(),
            task.getDescription(),
            task.getState(),
            task.getPriority(),
            UserResponse.from(task.getCreatedBy()),
            task.getAssignedTo() != null ? UserResponse.from(task.getAssignedTo()) : null,
            task.getDueDate(),
            task.getCreationDate(),
            task.getLastUpdateDate()
        );
    }
}
