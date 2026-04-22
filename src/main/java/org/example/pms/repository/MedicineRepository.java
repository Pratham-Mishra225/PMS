package org.example.pms.repository;
import org.example.pms.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByNameContainingIgnoreCase(String name);
    @Query("SELECT m FROM Medicine m WHERE m.quantity < :threshold")
    List<Medicine> findLowStock(@Param("threshold") int threshold);
    @Query("SELECT m FROM Medicine m WHERE m.expiryDate <= :date")
    List<Medicine> findExpiredOrExpiringSoon(@Param("date") LocalDate date);
}

