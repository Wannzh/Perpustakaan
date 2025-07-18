package com.api.perpustakaan.repository.transaction;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.perpustakaan.constant.ReturnStatusConstant;
import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByStudentId(Integer studentId);

    List<Transaction> findByStatus(StatusConstant status);

    List<Transaction> findByStatusKembali(ReturnStatusConstant returnStatus);

    Optional<Transaction> findByIdAndStatus(Integer id, StatusConstant status);
}
