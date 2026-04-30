package com.mikelmatilla.taskboard.task;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {
    
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(@PathVariable Long projectId,
                                               @RequestBody TaskRequest request,
                                               @AuthenticationPrincipal String email) {
        Task task = taskService.create(
            projectId,
            request.name(),
            request.description(),
            request.priority(),
            request.dueDate(),
            email
        );
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getByProject(@PathVariable Long projectId,
                                                           @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(taskService.getByProject(projectId, email)
                .stream().map(TaskResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getById(@PathVariable Long projectId,
                                                @PathVariable Long id,
                                                @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(TaskResponse.from(taskService.getById(id, email)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long projectId,
                                               @PathVariable Long id,
                                               @RequestBody TaskUpdateRequest request,
                                               @AuthenticationPrincipal String email) {
        Task task = taskService.update(
            id,
            request.name(),
            request.description(),
            request.state(),
            request.priority(),
            request.dueDate(),
            request.assignedToEmail(),
            email
        );
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId,
                                       @PathVariable Long id,
                                       @AuthenticationPrincipal String email) {
        taskService.delete(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/state")
    public ResponseEntity<TaskResponse> updateState(@PathVariable Long projectId,
                                                    @PathVariable Long id,
                                                    @RequestBody StateRequest request,
                                                    @AuthenticationPrincipal String email) {
        Task task = taskService.update(id, null, null, request.state(), null, null, null, email);
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<TaskResponse> updatePriority(@PathVariable Long projectId,
                                                    @PathVariable Long id,
                                                    @RequestBody PriorityRequest request,
                                                    @AuthenticationPrincipal String email) {
        Task task = taskService.update(id, null, null, null, request.priority(), null, null, email);
        return ResponseEntity.ok(TaskResponse.from(task));
    }
}
