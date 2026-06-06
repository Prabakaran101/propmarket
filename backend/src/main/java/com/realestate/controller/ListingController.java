package com.realestate.controller;

import com.realestate.dto.DTOs.*;
import com.realestate.model.Listing;
import com.realestate.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchListings(
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy) {

        Listing.ListingType lt = listingType != null ? Listing.ListingType.valueOf(listingType) : null;
        Listing.PropertyType pt = propertyType != null ? Listing.PropertyType.valueOf(propertyType) : null;

        PageResponse<ListingResponse> result = listingService.searchListings(
                lt, pt, city, minPrice, maxPrice, bedrooms, keyword, page, size, sortBy);
        return ResponseEntity.ok(new ApiResponse(true, "Success", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getListing(@PathVariable Long id) {
        try {
            ListingResponse listing = listingService.getListingById(id);
            return ResponseEntity.ok(new ApiResponse(true, "Success", listing));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createListing(
            @Valid @RequestPart("data") ListingRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            ListingResponse listing = listingService.createListing(request, images);
            return ResponseEntity.ok(new ApiResponse(true, "Listing created successfully", listing));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateListing(
            @PathVariable Long id,
            @Valid @RequestPart("data") ListingRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            ListingResponse listing = listingService.updateListing(id, request, images);
            return ResponseEntity.ok(new ApiResponse(true, "Listing updated successfully", listing));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteListing(@PathVariable Long id) {
        try {
            listingService.deleteListing(id);
            return ResponseEntity.ok(new ApiResponse(true, "Listing deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Listing.ListingStatus s = Listing.ListingStatus.valueOf(status);
            ListingResponse listing = listingService.updateStatus(id, s);
            return ResponseEntity.ok(new ApiResponse(true, "Status updated", listing));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<ListingResponse> result = listingService.getMyListings(page, size);
        return ResponseEntity.ok(new ApiResponse(true, "Success", result));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse> deleteImage(@PathVariable Long imageId) {
        try {
            listingService.deleteImage(imageId);
            return ResponseEntity.ok(new ApiResponse(true, "Image deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
