package com.realestate.dto;

import com.realestate.model.Listing;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DTOs {

    // ========== AUTH DTOs ==========
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String phone;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String profileImage;
        private String role;
    }

    @Data
    public static class UserProfileResponse {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String profileImage;
        private String role;
        private LocalDateTime createdAt;
        private int totalListings;
    }

    @Data
    public static class UpdateProfileRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;
        private String phone;
    }

    // ========== LISTING DTOs ==========
    @Data
    public static class ListingRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false)
        private BigDecimal price;

        @NotNull(message = "Listing type is required")
        private Listing.ListingType listingType;

        @NotNull(message = "Property type is required")
        private Listing.PropertyType propertyType;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        private String pincode;
        private Double latitude;
        private Double longitude;

        private Integer bedrooms;
        private Integer bathrooms;
        private Double areaSqFt;
        private Integer floor;
        private Integer totalFloors;
        private Integer parkingSpots;
        private Integer yearBuilt;

        private Boolean furnished = false;
        private Boolean parking = false;
        private Boolean gym = false;
        private Boolean swimmingPool = false;
        private Boolean security = false;
        private Boolean powerBackup = false;
        private Boolean lift = false;
        private Boolean waterSupply = true;
    }

    @Data
    public static class ListingResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String listingType;
        private String propertyType;
        private String status;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private Double latitude;
        private Double longitude;
        private Integer bedrooms;
        private Integer bathrooms;
        private Double areaSqFt;
        private Integer floor;
        private Integer totalFloors;
        private Integer parkingSpots;
        private Integer yearBuilt;
        private Boolean furnished;
        private Boolean parking;
        private Boolean gym;
        private Boolean swimmingPool;
        private Boolean security;
        private Boolean powerBackup;
        private Boolean lift;
        private Boolean waterSupply;
        private Integer viewCount;
        private OwnerInfo owner;
        private List<ImageInfo> images;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        @Data
        public static class OwnerInfo {
            private Long id;
            private String fullName;
            private String email;
            private String phone;
            private String profileImage;
        }

        @Data
        public static class ImageInfo {
            private Long id;
            private String fileUrl;
            private Integer displayOrder;
        }
    }

    @Data
    public static class PageResponse<T> {
        private List<T> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }

    @Data
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
}
