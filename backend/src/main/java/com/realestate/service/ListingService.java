package com.realestate.service;

import com.realestate.dto.DTOs.*;
import com.realestate.model.*;
import com.realestate.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ListingService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private ListingImageRepository listingImageRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    public ListingResponse createListing(ListingRequest request, List<MultipartFile> images) {
        User currentUser = authService.getCurrentUser();

        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .listingType(request.getListingType())
                .propertyType(request.getPropertyType())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .areaSqFt(request.getAreaSqFt())
                .floor(request.getFloor())
                .totalFloors(request.getTotalFloors())
                .parkingSpots(request.getParkingSpots())
                .yearBuilt(request.getYearBuilt())
                .furnished(request.getFurnished())
                .parking(request.getParking())
                .gym(request.getGym())
                .swimmingPool(request.getSwimmingPool())
                .security(request.getSecurity())
                .powerBackup(request.getPowerBackup())
                .lift(request.getLift())
                .waterSupply(request.getWaterSupply())
                .owner(currentUser)
                .status(Listing.ListingStatus.ACTIVE)
                .build();

        Listing saved = listingRepository.save(listing);

        if (images != null && !images.isEmpty()) {
            saveImages(saved, images);
        }

        return toResponse(listingRepository.findById(saved.getId()).orElseThrow());
    }

    @Transactional
    public ListingResponse updateListing(Long id, ListingRequest request, List<MultipartFile> newImages) {
        User currentUser = authService.getCurrentUser();
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (!listing.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to update this listing");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setListingType(request.getListingType());
        listing.setPropertyType(request.getPropertyType());
        listing.setAddress(request.getAddress());
        listing.setCity(request.getCity());
        listing.setState(request.getState());
        listing.setPincode(request.getPincode());
        listing.setBedrooms(request.getBedrooms());
        listing.setBathrooms(request.getBathrooms());
        listing.setAreaSqFt(request.getAreaSqFt());
        listing.setFurnished(request.getFurnished());
        listing.setParking(request.getParking());
        listing.setGym(request.getGym());
        listing.setSwimmingPool(request.getSwimmingPool());
        listing.setSecurity(request.getSecurity());
        listing.setPowerBackup(request.getPowerBackup());
        listing.setLift(request.getLift());
        listing.setWaterSupply(request.getWaterSupply());

        Listing updated = listingRepository.save(listing);

        if (newImages != null && !newImages.isEmpty()) {
            saveImages(updated, newImages);
        }

        return toResponse(listingRepository.findById(updated.getId()).orElseThrow());
    }

    @Transactional
    public void deleteListing(Long id) {
        User currentUser = authService.getCurrentUser();
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (!listing.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this listing");
        }

        listing.getImages().forEach(img -> fileStorageService.deleteFile(img.getFilePath()));
        listingRepository.delete(listing);
    }

    @Transactional
    public ListingResponse getListingById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listingRepository.incrementViewCount(id);
        return toResponse(listing);
    }

    public PageResponse<ListingResponse> searchListings(
            Listing.ListingType listingType,
            Listing.PropertyType propertyType,
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer bedrooms,
            String keyword,
            int page,
            int size,
            String sortBy) {

        Sort sort = switch (sortBy) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "newest" -> Sort.by("createdAt").descending();
            case "popular" -> Sort.by("viewCount").descending();
            default -> Sort.by("createdAt").descending();
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Listing> listings = listingRepository.searchListings(
                listingType, propertyType, city, minPrice, maxPrice, bedrooms, keyword, pageable);

        return toPageResponse(listings);
    }

    public PageResponse<ListingResponse> getMyListings(int page, int size) {
        User currentUser = authService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Listing> listings = listingRepository.findByOwner(currentUser, pageable);
        return toPageResponse(listings);
    }

    @Transactional
    public ListingResponse updateStatus(Long id, Listing.ListingStatus status) {
        User currentUser = authService.getCurrentUser();
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (!listing.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized");
        }
        listing.setStatus(status);
        return toResponse(listingRepository.save(listing));
    }

    @Transactional
    public void deleteImage(Long imageId) {
        User currentUser = authService.getCurrentUser();
        ListingImage image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getListing().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized");
        }

        fileStorageService.deleteFile(image.getFilePath());
        listingImageRepository.delete(image);
    }

    private void saveImages(Listing listing, List<MultipartFile> files) {
        int order = listing.getImages().size();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    String path = fileStorageService.storeFile(file, "listings/" + listing.getId());
                    String url = fileStorageService.getFileUrl(path);

                    ListingImage image = ListingImage.builder()
                            .fileName(file.getOriginalFilename())
                            .filePath(path)
                            .fileUrl(url)
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .displayOrder(order++)
                            .listing(listing)
                            .build();
                    listingImageRepository.save(image);
                } catch (Exception e) {
                    // Skip failed image
                }
            }
        }
    }

    private ListingResponse toResponse(Listing listing) {
        ListingResponse r = new ListingResponse();
        r.setId(listing.getId());
        r.setTitle(listing.getTitle());
        r.setDescription(listing.getDescription());
        r.setPrice(listing.getPrice());
        r.setListingType(listing.getListingType().name());
        r.setPropertyType(listing.getPropertyType().name());
        r.setStatus(listing.getStatus().name());
        r.setAddress(listing.getAddress());
        r.setCity(listing.getCity());
        r.setState(listing.getState());
        r.setPincode(listing.getPincode());
        r.setLatitude(listing.getLatitude());
        r.setLongitude(listing.getLongitude());
        r.setBedrooms(listing.getBedrooms());
        r.setBathrooms(listing.getBathrooms());
        r.setAreaSqFt(listing.getAreaSqFt());
        r.setFloor(listing.getFloor());
        r.setTotalFloors(listing.getTotalFloors());
        r.setParkingSpots(listing.getParkingSpots());
        r.setYearBuilt(listing.getYearBuilt());
        r.setFurnished(listing.getFurnished());
        r.setParking(listing.getParking());
        r.setGym(listing.getGym());
        r.setSwimmingPool(listing.getSwimmingPool());
        r.setSecurity(listing.getSecurity());
        r.setPowerBackup(listing.getPowerBackup());
        r.setLift(listing.getLift());
        r.setWaterSupply(listing.getWaterSupply());
        r.setViewCount(listing.getViewCount());
        r.setCreatedAt(listing.getCreatedAt());
        r.setUpdatedAt(listing.getUpdatedAt());

        ListingResponse.OwnerInfo owner = new ListingResponse.OwnerInfo();
        owner.setId(listing.getOwner().getId());
        owner.setFullName(listing.getOwner().getFullName());
        owner.setEmail(listing.getOwner().getEmail());
        owner.setPhone(listing.getOwner().getPhone());
        owner.setProfileImage(listing.getOwner().getProfileImage());
        r.setOwner(owner);

        r.setImages(listing.getImages().stream()
                .sorted(Comparator.comparing(ListingImage::getDisplayOrder))
                .map(img -> {
                    ListingResponse.ImageInfo info = new ListingResponse.ImageInfo();
                    info.setId(img.getId());
                    info.setFileUrl(img.getFileUrl());
                    info.setDisplayOrder(img.getDisplayOrder());
                    return info;
                })
                .collect(Collectors.toList()));

        return r;
    }

    private PageResponse<ListingResponse> toPageResponse(Page<Listing> page) {
        PageResponse<ListingResponse> response = new PageResponse<>();
        response.setContent(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
}
