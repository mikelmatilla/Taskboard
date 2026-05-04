package com.mikelmatilla.taskboard.user;

public record UserResponse(
    Long id,
    String email,
    String username,
    String name
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getUsername(),
            user.getName()
        );
    }
}
