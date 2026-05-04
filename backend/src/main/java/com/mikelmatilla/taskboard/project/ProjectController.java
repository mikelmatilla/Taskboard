package com.mikelmatilla.taskboard.project;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@RequestBody ProjectRequest request,
                                          @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.create(request.name(), email)));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(projectService.getProjectsForUser(email)
                .stream().map(ProjectResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id,
                                                @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.getById(id, email)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                @RequestBody ProjectRequest request,
                                                @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.update(id, request.name(), email)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal String email) {
        projectService.delete(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectResponse> addMember(@PathVariable Long id,
                                                    @RequestBody MemberRequest request,
                                                    @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.addMember(id, request.email(), email)));
    }
}
