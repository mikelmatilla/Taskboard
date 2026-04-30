package com.mikelmatilla.taskboard.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.register(
            request.email(),
            request.password(),
            request.username(),
            request.name()
        );
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
