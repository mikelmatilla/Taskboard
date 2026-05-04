package com.mikelmatilla.taskboard.user;

public record RegisterRequest(
    String email,
    String password,
    String username,
    String name
) {}
