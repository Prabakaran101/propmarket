package com.realestate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingType listingType; // BUY, SELL, RENT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType; // HOUSE, APARTMENT, VILLA, PLOT, COMMERCIAL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.ACTIVE;

    // Location
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    private String pincode;

    private Double latitude;
    private Double longitude;

    // Property Details
    private Integer bedrooms;
    private Integer bathrooms;
    private Double areaSqFt;
    private Integer floor;
    private Integer totalFloors;
    private Integer parkingSpots;
    private Integer yearBuilt;

    // Amenities
    private Boolean furnished;
    private Boolean parking;
    private Boolean gym;
    private Boolean swimmingPool;
    private Boolean security;
    private Boolean powerBackup;
    private Boolean lift;
    private Boolean waterSupply;

    @Column(nullable = false)
    private Integer viewCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ListingImage> images = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ListingType {
        BUY, SELL, RENT
    }

    public enum PropertyType {
        HOUSE, APARTMENT, VILLA, PLOT, COMMERCIAL, PG
    }

    public enum ListingStatus {
        ACTIVE, SOLD, RENTED, INACTIVE
    }
}
