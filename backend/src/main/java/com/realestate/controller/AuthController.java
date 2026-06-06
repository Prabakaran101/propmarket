package com.realestate.controller;

import com.realestate.dto.DTOs.*;
import com.realestate.model.User;
import com.realestate.repository.UserRepository;
import com.realestate.service.AuthService;
import com.realestate.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse auth = authService.register(request);
            return ResponseEntity.ok(new ApiResponse(true, "Registration successful", auth));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse auth = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(true, "Login successful", auth));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            UserProfileResponse profile = new UserProfileResponse();
            profile.setId(user.getId());
            profile.setEmail(user.getEmail());
            profile.setFullName(user.getFullName());
            profile.setPhone(user.getPhone());
            profile.setProfileImage(user.getProfileImage());
            profile.setRole(user.getRole().name());
            profile.setCreatedAt(user.getCreatedAt());
            profile.setTotalListings(user.getListings() != null ? user.getListings().size() : 0);
            return ResponseEntity.ok(new ApiResponse(true, "Success", profile));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Unauthorized"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            User user = authService.getCurrentUser();
            user.setFullName(request.getFullName());
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            userRepository.save(user);
            return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/profile/image")
    public ResponseEntity<ApiResponse> uploadProfileImage(@RequestParam("image") MultipartFile file) {
        try {
            User user = authService.getCurrentUser();
            String path = fileStorageService.storeFile(file, "profiles");
            String url = fileStorageService.getFileUrl(path);
            user.setProfileImage(url);
            userRepository.save(user);
            return ResponseEntity.ok(new ApiResponse(true, "Profile image updated", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
