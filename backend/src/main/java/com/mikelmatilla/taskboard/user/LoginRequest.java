package com.mikelmatilla.taskboard.user;

public record LoginRequest(
    String email,
    String password
) {}
