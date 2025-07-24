package com.api.perpustakaan.repository.transaction;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;
import com.api.perpustakaan.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
        int countByStatus(StatusConstant status);

        @Query("SELECT COUNT(DISTINCT t.student.id) " +
                        "FROM Transaction t " +
                        "WHERE t.status = 'DIPINJAM' AND t.student.active = true")
        int countDistinctActiveStudentsWithBooks();

        @Query("SELECT SUM(t.denda) FROM Transaction t WHERE t.denda > 0")
        Integer sumTotalDenda();

        @Query("SELECT new com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO(t.book.judul, COUNT(t)) " +
                        "FROM Transaction t " +
                        "GROUP BY t.book.judul " +
                        "ORDER BY COUNT(t) DESC")
        List<BukuTerpopulerDTO> findMostBorrowedBooks();

        @Query("SELECT new com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO(t.student.name, COUNT(t)) " +
                        "FROM Transaction t " +
                        "WHERE t.denda > 0 " +
                        "GROUP BY t.student.name " +
                        "ORDER BY COUNT(t) DESC")
        List<SiswaTerlambatDTO> findMostLateStudents();

        @Query("SELECT new com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO(t.book.judul, COUNT(t)) " +
                        "FROM Transaction t " +
                        "WHERE t.tanggalPinjam BETWEEN :startDate AND :endDate " +
                        "GROUP BY t.book.judul " +
                        "ORDER BY COUNT(t) DESC")
        List<BukuTerpopulerDTO> findMostBorrowedBooksByPeriod(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT new com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO(t.student.name, COUNT(t)) " +
                        "FROM Transaction t " +
                        "WHERE t.denda > 0 AND t.tanggalPinjam BETWEEN :startDate AND :endDate " +
                        "GROUP BY t.student.name " +
                        "ORDER BY COUNT(t) DESC")
        List<SiswaTerlambatDTO> findMostLateStudentsByPeriod(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

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

        @Query("SELECT t.book.judul, AVG(t.rating) as avgRating " +
                        "FROM Transaction t WHERE t.rating IS NOT NULL " +
                        "GROUP BY t.book.judul ORDER BY avgRating DESC")
        List<Object[]> findTopRatedBooks();

}
