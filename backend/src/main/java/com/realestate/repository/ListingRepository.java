package com.realestate.repository;

import com.realestate.model.Listing;
import com.realestate.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    Page<Listing> findByStatus(Listing.ListingStatus status, Pageable pageable);

    Page<Listing> findByOwner(User owner, Pageable pageable);

    Page<Listing> findByOwnerAndStatus(User owner, Listing.ListingStatus status, Pageable pageable);

    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' " +
           "AND (:listingType IS NULL OR l.listingType = :listingType) " +
           "AND (:propertyType IS NULL OR l.propertyType = :propertyType) " +
           "AND (:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice) " +
           "AND (:bedrooms IS NULL OR l.bedrooms >= :bedrooms) " +
           "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Listing> searchListings(
            @Param("listingType") Listing.ListingType listingType,
            @Param("propertyType") Listing.PropertyType propertyType,
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("bedrooms") Integer bedrooms,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Listing l SET l.viewCount = l.viewCount + 1 WHERE l.id = :id")
    void incrementViewCount(@Param("id") Long id);

    long countByStatus(Listing.ListingStatus status);

    long countByListingType(Listing.ListingType listingType);
}
