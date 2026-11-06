package com.berkeozder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ActuatorPrometheusIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Actuator /health endpoint'i UP durumunda ve 200 dönmelidir")
    void testActuatorHealthEndpoint() throws Exception {
        MvcResult result = mockMvc.perform(get("/actuator/health")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(jsonNode.get("status").asText()).isEqualTo("UP");
    }

    @Test
    @DisplayName("Actuator /prometheus endpoint'i JVM ve sistem metriklerini text formatında yayınlamalıdır")
    void testActuatorPrometheusEndpoint() throws Exception {
        MvcResult result = mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertThat(content).isNotBlank();
        // Temel JVM ve Micrometer metriklerinin varlığını doğrula
        assertThat(content).contains("jvm_memory_used_bytes");
        assertThat(content).contains("process_cpu_usage");
        assertThat(content).contains("novablog-enterprise-backend");
    }

    @Test
    @DisplayName("Actuator /info endpoint'i başarıyla yanıt vermelidir")
    void testActuatorInfoEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());
    }
}

