package com.api.perpustakaan.repository.transaction;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query("SELECT t FROM Transaction t " +
            "WHERE LOWER(t.book.judul) LIKE %:keyword% " +
            "OR LOWER(t.student.name) LIKE %:keyword%")
    Page<Transaction> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.status = :status AND " +
            "(LOWER(t.book.judul) LIKE %:keyword% OR LOWER(t.student.name) LIKE %:keyword%)")
    Page<Transaction> findByStatusAndKeyword(@Param("status") StatusConstant status,
            @Param("keyword") String keyword,
            Pageable pageable);

    Page<Transaction> findByStatus(StatusConstant status, Pageable pageable);

    List<Transaction> findByStatus(StatusConstant status);
    Page<Transaction> findAll(Pageable pageable);

    List<Transaction> findByTanggalJatuhTempo(LocalDate tanggal);

    List<Transaction> findByStatusAndTanggalJatuhTempoBefore(StatusConstant status, LocalDate tanggal);

}
