package com.mikelmatilla.taskboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mikelmatilla.taskboard.user.RegisterRequest;
import com.mikelmatilla.taskboard.user.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private String token;
    private Long projectId;

    @BeforeEach
    void setup() throws Exception {
        RegisterRequest request = new RegisterRequest(
            "task@test.com", "password123", "taskuser", "Task User"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new LoginRequest("task@test.com", "password123")
                )))
                .andExpect(status().isOk())
                .andReturn();

        token = objectMapper.readTree(
            loginResult.getResponse().getContentAsString()
        ).get("token").asText();

        MvcResult projectResult = mockMvc.perform(post("/api/projects")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Test Project\"}"))
                .andExpect(status().isOk())
                .andReturn();

        projectId = objectMapper.readTree(
            projectResult.getResponse().getContentAsString()
        ).get("id").asLong();
    }

    @Test
    void createTask_shouldReturnTask() throws Exception {
        mockMvc.perform(post("/api/projects/" + projectId + "/tasks")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Test Task\", \"description\": \"Test desc\", \"priority\": \"HIGH\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Task"))
                .andExpect(jsonPath("$.state").value("TODO"))
                .andExpect(jsonPath("$.priority").value("HIGH"));
    }

    @Test
    void getTasks_shouldReturnList() throws Exception {
        mockMvc.perform(post("/api/projects/" + projectId + "/tasks")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Test Task\", \"priority\": \"MEDIUM\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/projects/" + projectId + "/tasks")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Task"));
    }

    @Test
    void updateTaskState_shouldChangeState() throws Exception {
        MvcResult taskResult = mockMvc.perform(post("/api/projects/" + projectId + "/tasks")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Test Task\", \"priority\": \"MEDIUM\"}"))
                .andExpect(status().isOk())
                .andReturn();

        Long taskId = objectMapper.readTree(
            taskResult.getResponse().getContentAsString()
        ).get("id").asLong();

        mockMvc.perform(patch("/api/projects/" + projectId + "/tasks/" + taskId + "/state")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"state\": \"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("IN_PROGRESS"));
    }

    @Test
    void deleteTask_shouldReturn204() throws Exception {
        MvcResult taskResult = mockMvc.perform(post("/api/projects/" + projectId + "/tasks")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"To Delete\", \"priority\": \"LOW\"}"))
                .andExpect(status().isOk())
                .andReturn();

        Long taskId = objectMapper.readTree(
            taskResult.getResponse().getContentAsString()
        ).get("id").asLong();

        mockMvc.perform(delete("/api/projects/" + projectId + "/tasks/" + taskId)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void createTask_withoutToken_shouldReturn403() throws Exception {
        mockMvc.perform(post("/api/projects/" + projectId + "/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Test Task\", \"priority\": \"MEDIUM\"}"))
                .andExpect(status().isForbidden());
    }
}
