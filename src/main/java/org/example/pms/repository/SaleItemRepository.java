package org.example.pms.repository;
import org.example.pms.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
}
