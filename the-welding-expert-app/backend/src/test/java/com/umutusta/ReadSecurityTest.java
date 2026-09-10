package com.umutusta;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDate;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(value = BookingReadController.class, properties = {
    "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://example.invalid/auth/v1",
    "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://example.invalid/auth/v1/keys"
}) @Import(ReadSecurity.class)
class ReadSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean BookingReadService service;
    @MockitoBean JwtDecoder decoder;
    @Test void publicServicesAreReadable() throws Exception {
        mvc.perform(get("/api/v1/services")).andExpect(status().isOk());
    }
    @Test void anonymousAdminReadIsRejected() throws Exception {
        mvc.perform(get("/api/v1/admin/appointments")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
    @Test void writesRemainDenied() throws Exception {
        mvc.perform(post("/api/v1/services").with(jwt()).with(csrf())).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
    @Test void invalidDateRangeIsRejected() {
        assertThrows(ResponseStatusException.class, () -> BookingReadService.validateRange(LocalDate.of(2026,1,2), LocalDate.of(2026,1,1)));
    }
}
