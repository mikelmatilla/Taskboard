package com.mikelmatilla.taskboard.user;

public record AuthResponse(
    String token,
    UserResponse user
) {}
