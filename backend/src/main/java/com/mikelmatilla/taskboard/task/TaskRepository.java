package com.mikelmatilla.taskboard.task;

import com.mikelmatilla.taskboard.project.Project;
import com.mikelmatilla.taskboard.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignedTo(User user);
    List<Task> findByProjectAndState(Project project, TaskState state);
}
