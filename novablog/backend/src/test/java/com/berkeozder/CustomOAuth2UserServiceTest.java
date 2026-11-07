package com.berkeozder;

import com.berkeozder.data.entity.RoleEntity;
import com.berkeozder.data.entity.RoleType;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IRoleRepository;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.security.oauth2.AuthProvider;
import com.berkeozder.security.oauth2.CustomOAuth2UserService;
import com.berkeozder.security.oauth2.user.GoogleOAuth2UserInfo;
import com.berkeozder.security.oauth2.user.GithubOAuth2UserInfo;
import com.berkeozder.security.oauth2.user.OAuth2UserInfo;
import com.berkeozder.security.oauth2.user.OAuth2UserInfoFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomOAuth2UserService & OAuth2 UserInfo Unit Tests")
class CustomOAuth2UserServiceTest {

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IRoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CustomOAuth2UserService customOAuth2UserService;

    private ClientRegistration googleRegistration;
    private ClientRegistration githubRegistration;

    @BeforeEach
    void setUp() {
        googleRegistration = ClientRegistration.withRegistrationId("google")
                .clientId("test-google-id")
                .clientSecret("test-google-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();

        githubRegistration = ClientRegistration.withRegistrationId("github")
                .clientId("test-github-id")
                .clientSecret("test-github-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .authorizationUri("https://github.com/login/oauth/authorize")
                .tokenUri("https://github.com/login/oauth/access_token")
                .userInfoUri("https://api.github.com/user")
                .userNameAttributeName("id")
                .clientName("GitHub")
                .build();
    }

    @Test
    @DisplayName("1. OAuth2UserInfoFactory: Google profil özniteliklerini doğru ayrıştırmalıdır")
    void shouldExtractGoogleAttributes() {
        Map<String, Object> attributes = Map.of(
                "sub", "google-sub-12345",
                "name", "Berke Özder",
                "email", "berke@google.com",
                "picture", "https://google.com/avatar.jpg"
        );

        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo("google", attributes);

        assertThat(userInfo).isInstanceOf(GoogleOAuth2UserInfo.class);
        assertThat(userInfo.getId()).isEqualTo("google-sub-12345");
        assertThat(userInfo.getName()).isEqualTo("Berke Özder");
        assertThat(userInfo.getEmail()).isEqualTo("berke@google.com");
        assertThat(userInfo.getImageUrl()).isEqualTo("https://google.com/avatar.jpg");
    }

    @Test
    @DisplayName("2. OAuth2UserInfoFactory: GitHub profil özniteliklerini doğru ayrıştırmalıdır")
    void shouldExtractGithubAttributes() {
        Map<String, Object> attributes = Map.of(
                "id", 98765,
                "login", "berkeozder",
                "name", "Berke Özder",
                "email", "berke@github.com",
                "avatar_url", "https://github.com/avatar.jpg"
        );

        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo("github", attributes);

        assertThat(userInfo).isInstanceOf(GithubOAuth2UserInfo.class);
        assertThat(userInfo.getId()).isEqualTo("98765");
        assertThat(userInfo.getName()).isEqualTo("Berke Özder");
        assertThat(userInfo.getEmail()).isEqualTo("berke@github.com");
        assertThat(userInfo.getImageUrl()).isEqualTo("https://github.com/avatar.jpg");
    }

    @Test
    @DisplayName("3. OAuth2UserInfoFactory: Desteklenmeyen sağlayıcıda istisna fırlatmalıdır")
    void shouldThrowExceptionForUnsupportedProvider() {
        assertThatThrownBy(() -> OAuth2UserInfoFactory.getOAuth2UserInfo("facebook", Map.of()))
                .isInstanceOf(OAuth2AuthenticationException.class);
    }

    @Test
    @DisplayName("4. processOAuth2User: Yeni Google kullanıcısı sisteme otomatik kaydedilmelidir")
    void shouldRegisterNewUserForGoogle() {
        Map<String, Object> attributes = Map.of(
                "sub", "google-sub-101",
                "name", "Ahmet Yılmaz",
                "email", "ahmet@gmail.com",
                "picture", "https://lh3.googleusercontent.com/photo.jpg"
        );

        OAuth2AccessToken token = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "test-token", Instant.now(), Instant.now().plusSeconds(3600));
        OAuth2UserRequest userRequest = new OAuth2UserRequest(googleRegistration, token);
        OAuth2User oAuth2User = new DefaultOAuth2User(List.of(), attributes, "sub");

        when(userRepository.findByEmail("ahmet@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-random-password");

        RoleEntity roleUser = RoleEntity.builder().roleId(1L).roleName(RoleType.ROLE_USER).build();
        when(roleRepository.findByRoleName(RoleType.ROLE_USER)).thenReturn(Optional.of(roleUser));

        UserEntity savedEntity = UserEntity.builder()
                .userId(10L)
                .username("ahmet")
                .email("ahmet@gmail.com")
                .password("hashed-random-password")
                .firstName("Ahmet")
                .lastName("Yılmaz")
                .provider(AuthProvider.GOOGLE)
                .providerId("google-sub-101")
                .imageUrl("https://lh3.googleusercontent.com/photo.jpg")
                .roles(Set.of(roleUser))
                .build();

        when(userRepository.save(any(UserEntity.class))).thenReturn(savedEntity);

        OAuth2User result = customOAuth2UserService.processOAuth2User(userRequest, oAuth2User);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("ahmet");

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        UserEntity created = captor.getValue();
        assertThat(created.getEmail()).isEqualTo("ahmet@gmail.com");
        assertThat(created.getProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(created.getProviderId()).isEqualTo("google-sub-101");
    }

    @Test
    @DisplayName("5. processOAuth2User: Mevcut kullanıcı Google ile giriş yaptığında bilgileri güncellenmelidir")
    void shouldUpdateExistingUserOnOAuth2Login() {
        Map<String, Object> attributes = Map.of(
                "sub", "google-sub-202",
                "name", "Mehmet Kaya",
                "email", "mehmet@gmail.com",
                "picture", "https://lh3.googleusercontent.com/updated.jpg"
        );

        OAuth2AccessToken token = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "test-token", Instant.now(), Instant.now().plusSeconds(3600));
        OAuth2UserRequest userRequest = new OAuth2UserRequest(googleRegistration, token);
        OAuth2User oAuth2User = new DefaultOAuth2User(List.of(), attributes, "sub");

        RoleEntity roleUser = RoleEntity.builder().roleId(1L).roleName(RoleType.ROLE_USER).build();
        UserEntity existing = UserEntity.builder()
                .userId(20L)
                .username("mehmetk")
                .email("mehmet@gmail.com")
                .password("existing-hash")
                .provider(AuthProvider.LOCAL)
                .roles(Set.of(roleUser))
                .build();

        when(userRepository.findByEmail("mehmet@gmail.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        OAuth2User result = customOAuth2UserService.processOAuth2User(userRequest, oAuth2User);

        assertThat(result).isNotNull();
        assertThat(existing.getProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(existing.getProviderId()).isEqualTo("google-sub-202");
        assertThat(existing.getImageUrl()).isEqualTo("https://lh3.googleusercontent.com/updated.jpg");
    }

    @Test
    @DisplayName("6. processOAuth2User: E-posta eksik olduğunda hata fırlatmalıdır")
    void shouldThrowExceptionWhenEmailIsMissing() {
        Map<String, Object> attributes = Map.of(
                "sub", "google-sub-no-email",
                "name", "İsimsiz"
        );

        OAuth2AccessToken token = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "test-token", Instant.now(), Instant.now().plusSeconds(3600));
        OAuth2UserRequest userRequest = new OAuth2UserRequest(googleRegistration, token);
        OAuth2User oAuth2User = new DefaultOAuth2User(List.of(), attributes, "sub");

        assertThatThrownBy(() -> customOAuth2UserService.processOAuth2User(userRequest, oAuth2User))
                .isInstanceOf(OAuth2AuthenticationException.class);
    }
}

