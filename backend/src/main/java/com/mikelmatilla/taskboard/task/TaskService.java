package com.mikelmatilla.taskboard.task;

import com.mikelmatilla.taskboard.project.Project;
import com.mikelmatilla.taskboard.project.ProjectService;
import com.mikelmatilla.taskboard.user.User;
import com.mikelmatilla.taskboard.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserService userService;

    public Task create(Long projectId, String name, String description,
                       TaskPriority priority, LocalDateTime dueDate, String creatorEmail) {
        Project project = projectService.getById(projectId, creatorEmail);
        User creator = userService.findByEmail(creatorEmail);

        Task task = new Task();
        task.setName(name);
        task.setDescription(description);
        task.setPriority(priority != null ? priority : TaskPriority.MEDIUM);
        task.setDueDate(dueDate);
        task.setProject(project);
        task.setCreatedBy(creator);

        return taskRepository.save(task);
    }

    public List<Task> getByProject(Long projectId, String email) {
        Project project = projectService.getById(projectId, email);
        return taskRepository.findByProject(project);
    }

    public Task getById(Long id, String email) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectService.getById(task.getProject().getId(), email);
        return task;
    }

    public Task update(Long id, String name, String description,
                       TaskState state, TaskPriority priority,
                       LocalDateTime dueDate, String assignedToEmail, String email) {
        Task task = getById(id, email);

        if (name != null) task.setName(name);
        if (description != null) task.setDescription(description);
        if (state != null) task.setState(state);
        if (priority != null) task.setPriority(priority);
        if (dueDate != null) task.setDueDate(dueDate);
        if (assignedToEmail != null) {
            User assignedTo = userService.findByEmail(assignedToEmail);
            task.setAssignedTo(assignedTo);
        }

        return taskRepository.save(task);
    }

    public void delete(Long id, String email) {
        Task task = getById(id, email);
        taskRepository.delete(task);
    }
}
