package com.berkeozder.security.oauth2;

import com.berkeozder.data.entity.RoleEntity;
import com.berkeozder.data.entity.RoleType;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IRoleRepository;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.security.oauth2.user.OAuth2UserInfo;
import com.berkeozder.security.oauth2.user.OAuth2UserInfoFactory;
import com.berkeozder.security.userdetails.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Spring Security OAuth2 kimlik doğrulama akışında kullanıcı profilini yükleyen
 * ve veritabanındaki UserEntity ile eşleştiren veya yeni üye oluşturan servis.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (OAuth2AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("OAuth2 kullanıcı işleme hatası: {}", ex.getMessage(), ex);
            throw new OAuth2AuthenticationException(new OAuth2Error("oauth2_processing_error",
                    "OAuth2 kimlik doğrulama işlemi sırasında hata oluştu: " + ex.getMessage(), null));
        }
    }

    public OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        if (userInfo.getEmail() == null || userInfo.getEmail().isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("email_not_found",
                    "OAuth2 sağlayıcısından e-posta adresi alınamadı.", null));
        }

        Optional<UserEntity> userOptional = userRepository.findByEmail(userInfo.getEmail());
        UserEntity user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            user = updateExistingUser(user, userInfo, registrationId);
        } else {
            user = registerNewUser(userRequest, userInfo);
        }

        return CustomUserDetails.build(user, oAuth2User.getAttributes());
    }

    private UserEntity registerNewUser(OAuth2UserRequest userRequest, OAuth2UserInfo userInfo) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        // Kullanıcı adı oluştur: email prefix veya isim, çakışma varsa rastgele son ek
        String baseUsername = generateBaseUsername(userInfo);
        String username = baseUsername;
        int attempt = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + attempt++;
        }

        // İsim ayrıştırma
        String firstName = userInfo.getName();
        String lastName = "";
        if (firstName != null && firstName.contains(" ")) {
            int lastSpace = firstName.lastIndexOf(" ");
            lastName = firstName.substring(lastSpace + 1);
            firstName = firstName.substring(0, lastSpace);
        }

        // Varsayılan ROLE_USER rolü
        RoleEntity userRole = roleRepository.findByRoleName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(RoleEntity.builder().roleName(RoleType.ROLE_USER).build()));

        UserEntity newUser = UserEntity.builder()
                .username(username)
                .email(userInfo.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Güvenli rastgele parola
                .firstName(firstName)
                .lastName(lastName)
                .provider(provider)
                .providerId(userInfo.getId())
                .imageUrl(userInfo.getImageUrl())
                .isEnabled(true)
                .isAccountNonExpired(true)
                .isAccountNonLocked(true)
                .isCredentialsNonExpired(true)
                .roles(Set.of(userRole))
                .build();

        log.info("Yeni OAuth2 kullanıcısı sisteme kaydedildi: {} (Sağlayıcı: {})", username, provider);
        return userRepository.save(newUser);
    }

    private UserEntity updateExistingUser(UserEntity existingUser, OAuth2UserInfo userInfo, String registrationId) {
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        // Kullanıcı profili güncelleme
        if (existingUser.getProvider() == null || existingUser.getProvider() == AuthProvider.LOCAL) {
            existingUser.setProvider(provider);
        }
        if (existingUser.getProviderId() == null) {
            existingUser.setProviderId(userInfo.getId());
        }
        if (userInfo.getImageUrl() != null && !userInfo.getImageUrl().isBlank()) {
            existingUser.setImageUrl(userInfo.getImageUrl());
        }

        log.info("Mevcut kullanıcı OAuth2 ile bağlandı/güncellendi: {} (Sağlayıcı: {})", existingUser.getUsername(), provider);
        return userRepository.save(existingUser);
    }

    private String generateBaseUsername(OAuth2UserInfo userInfo) {
        if (userInfo.getEmail() != null && userInfo.getEmail().contains("@")) {
            return userInfo.getEmail().split("@")[0].replaceAll("[^a-zA-Z0-9_.-]", "");
        }
        if (userInfo.getName() != null && !userInfo.getName().isBlank()) {
            return userInfo.getName().trim().toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_.-]", "");
        }
        return "oauth_user_" + System.currentTimeMillis();
    }
}

