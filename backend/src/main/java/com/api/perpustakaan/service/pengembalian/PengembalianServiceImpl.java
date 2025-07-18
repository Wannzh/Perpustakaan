package com.api.perpustakaan.service.pengembalian;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.api.perpustakaan.constant.ReturnStatusConstant;
import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.pengembalian.PengembalianRequestDTO;
import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.entity.Transaction;
import com.api.perpustakaan.repository.book.BookRepository;
import com.api.perpustakaan.repository.transaction.TransactionRepository;

import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class PengembalianServiceImpl implements PengembalianService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BookRepository bookRepository;

    @Override
    public ResponseEntity<?> kembalikanBuku(PengembalianRequestDTO request) {
        // Validasi status RUSAK → catatan wajib diisi
        if (request.getStatusPengembalian() == ReturnStatusConstant.RUSAK &&
                (request.getCatatan() == null || request.getCatatan().isBlank())) {
            return ResponseEntity.badRequest()
                    .body("Catatan wajib diisi jika status pengembalian adalah RUSAK.");
        }

        // Cari transaksi berdasarkan ID
        Transaction transaksi = transactionRepository.findById(request.getTransactionId())
                .orElse(null);

        if (transaksi == null) {
            return ResponseEntity.badRequest()
                    .body("Data transaksi peminjaman tidak ditemukan.");
        }

        // Cek apakah sudah dikembalikan
        if (transaksi.getStatus() == StatusConstant.DIKEMBALIKAN) {
            return ResponseEntity.badRequest()
                    .body("Buku ini sudah dikembalikan sebelumnya.");
        }

        // Proses pengembalian
        transaksi.setTanggalKembali(LocalDate.now());
        transaksi.setStatusKembali(request.getStatusPengembalian());
        transaksi.setCatatan(request.getCatatan());
        transaksi.setStatus(StatusConstant.DIKEMBALIKAN);
        transaksi.setUpdatedAt(LocalDateTime.now());

        // Kembalikan stok buku jika status pengembalian NORMAL
        if (request.getStatusPengembalian() == ReturnStatusConstant.NORMAL) {
            Book buku = transaksi.getBook();
            if (buku != null) {
                log.info("Stok sebelum: {}", buku.getStokTersedia());
                log.info("Menambahkan stok buku id: {}", buku.getId());
                buku.setStokTersedia(buku.getStokTersedia() + 1);

                bookRepository.save(buku);
            }
        }

        transactionRepository.save(transaksi);

        return ResponseEntity.ok("Pengembalian berhasil dicatat.");
    }
}
