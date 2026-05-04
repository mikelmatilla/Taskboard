package com.mikelmatilla.taskboard.project;

import com.mikelmatilla.taskboard.user.UserResponse;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectResponse(
    Long id,
    String name,
    UserResponse owner,
    List<UserResponse> members,
    LocalDateTime creationDate,
    LocalDateTime lastUpdateDate
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
            project.getId(),
            project.getName(),
            UserResponse.from(project.getOwner()),
            project.getMembers().stream()
                .map(UserResponse::from)
                .toList(),
            project.getCreationDate(),
            project.getLastUpdateDate()
        );
    }
}
