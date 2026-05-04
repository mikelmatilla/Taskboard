package com.mikelmatilla.taskboard.user;

public record UpdateProfileRequest(
    String username,
    String name
) {}
