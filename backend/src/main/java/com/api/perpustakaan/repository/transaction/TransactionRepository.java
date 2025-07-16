package com.api.perpustakaan.repository.transaction;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Integer>{
    List<Transaction> findByStudentId(Integer studentId);
    List<Transaction> findByStatus(StatusConstant status);
}
