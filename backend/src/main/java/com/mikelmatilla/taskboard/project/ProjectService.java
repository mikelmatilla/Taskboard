package com.mikelmatilla.taskboard.project;

import com.mikelmatilla.taskboard.user.User;
import com.mikelmatilla.taskboard.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final UserService userService;

    public Project create(String name, String ownerEmail) {
        User owner = userService.findByEmail(ownerEmail);
        Project project = new Project();
        project.setName(name);
        project.setOwner(owner);
        return projectRepository.save(project);
    }

    public List<Project> getProjectsForUser(String email) {
        User user = userService.findByEmail(email);
        List<Project> owned = projectRepository.findByOwner(user);
        List<Project> member = projectRepository.findByMembersContaining(user);
        owned.addAll(member);
        return owned;
    }

    public Project getById(Long id, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!hasAccess(project, email)) {
            throw new RuntimeException("Access denied");
        }
        return project;
    }

    public Project update(Long id, String name, String email) {
        Project project = getById(id, email);
        project.setName(name);
        return projectRepository.save(project);
    }

    public void delete(Long id, String email) {
        Project project = getById(id, email);
        if (!project.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Only the owner can delete a project");
        }
        projectRepository.delete(project);
    }

    public Project addMember(Long projectId, String memberEmail, String ownerEmail) {
        Project project = getById(projectId, ownerEmail);
        if (!project.getOwner().getEmail().equals(ownerEmail)) {
            throw new RuntimeException("Only the owner can add members");
        }
        User member = userService.findByEmail(memberEmail);
        if (!project.getMembers().contains(member)) {
            project.getMembers().add(member);
        }
        return projectRepository.save(project);
    }

    private boolean hasAccess(Project project, String email) {
        return project.getOwner().getEmail().equals(email) ||
               project.getMembers().stream()
                       .anyMatch(m -> m.getEmail().equals(email));
    }
}
