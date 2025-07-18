package com.api.perpustakaan.service.pengembalian;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.api.perpustakaan.constant.ReturnStatusConstant;
import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.constant.TypesOfFinesConstant;
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

    private int hitungDenda(Transaction transaksi, ReturnStatusConstant status) {
        LocalDate now = LocalDate.now();
        int denda = 0;

        switch (status) {
            case NORMAL:
                if (transaksi.getTanggalJatuhTempo() != null && now.isAfter(transaksi.getTanggalJatuhTempo())) {
                    int selisihHari = (int) ChronoUnit.DAYS.between(transaksi.getTanggalJatuhTempo(), now);
                    denda = selisihHari * 2000;
                }
                break;
            case RUSAK:
                denda = 50000;
                break;
            case HILANG:
                denda = 100000;
                break;
        }

        return denda;
    }

    @Override
    public ResponseEntity<?> kembalikanBuku(PengembalianRequestDTO request) {
        if (request.getStatusPengembalian() == ReturnStatusConstant.RUSAK &&
                (request.getCatatan() == null || request.getCatatan().isBlank())) {
            return ResponseEntity.badRequest().body("Catatan wajib diisi jika status pengembalian adalah RUSAK.");
        }

        Transaction transaksi = transactionRepository.findById(request.getTransactionId()).orElse(null);
        if (transaksi == null) {
            return ResponseEntity.badRequest().body("Data transaksi peminjaman tidak ditemukan.");
        }

        if (transaksi.getStatus() == StatusConstant.DIKEMBALIKAN) {
            return ResponseEntity.badRequest().body("Buku ini sudah dikembalikan sebelumnya.");
        }

        // Hitung denda dan set pengembalian
        ReturnStatusConstant statusPengembalian = request.getStatusPengembalian();
        transaksi.setTanggalKembali(LocalDate.now());
        transaksi.setStatusKembali(statusPengembalian);
        transaksi.setCatatan(request.getCatatan());
        transaksi.setStatus(StatusConstant.DIKEMBALIKAN);
        transaksi.setUpdatedAt(LocalDateTime.now());

        // Hitung dan set denda
        transaksi.setDenda(hitungDenda(transaksi, statusPengembalian));
        transaksi.setDendaTotal(hitungDenda(transaksi, statusPengembalian));

        // Memasukan jenis denda denda
        switch (statusPengembalian) {
            case NORMAL:
                if (transaksi.getTanggalJatuhTempo() != null
                        && LocalDate.now().isAfter(transaksi.getTanggalJatuhTempo())) {
                    transaksi.setDendaJenis(TypesOfFinesConstant.TELAT);
                }
                break;
            case RUSAK:
                transaksi.setDendaJenis(TypesOfFinesConstant.RUSAK);
                break;
            case HILANG:
                transaksi.setDendaJenis(TypesOfFinesConstant.HILANG);
                break;
        }

        // Kembalikan stok buku jika pengembalian NORMAL
        if (statusPengembalian == ReturnStatusConstant.NORMAL) {
            Book buku = transaksi.getBook();
            if (buku != null) {
                buku.setStokTersedia(buku.getStokTersedia() + 1);
                bookRepository.save(buku);
            }
        }

        transactionRepository.save(transaksi);
        return ResponseEntity.ok("Pengembalian berhasil dicatat.");
    }

    @Override
    public ResponseEntity<?> kembalikanBukuMandiri(PengembalianRequestDTO request, Integer siswaId) {
        if (request.getStatusPengembalian() == ReturnStatusConstant.RUSAK &&
                (request.getCatatan() == null || request.getCatatan().isBlank())) {
            return ResponseEntity.badRequest().body("Catatan wajib diisi jika status pengembalian adalah RUSAK.");
        }

        Transaction transaksi = transactionRepository.findById(request.getTransactionId()).orElse(null);
        if (transaksi == null) {
            return ResponseEntity.badRequest().body("Transaksi tidak ditemukan.");
        }

        if (!transaksi.getStudent().getId().equals(siswaId)) {
            return ResponseEntity.status(403).body("Anda tidak memiliki hak untuk mengembalikan transaksi ini.");
        }

        if (transaksi.getStatus() == StatusConstant.DIKEMBALIKAN) {
            return ResponseEntity.badRequest().body("Buku ini sudah dikembalikan.");
        }

        // Proses pengembalian
        ReturnStatusConstant statusPengembalian = request.getStatusPengembalian();
        transaksi.setTanggalKembali(LocalDate.now());
        transaksi.setStatusKembali(statusPengembalian);
        transaksi.setCatatan(request.getCatatan());
        transaksi.setStatus(StatusConstant.DIKEMBALIKAN);
        transaksi.setUpdatedAt(LocalDateTime.now());

        // Hitung dan set denda
        transaksi.setDenda(hitungDenda(transaksi, statusPengembalian));
        transaksi.setDendaTotal(hitungDenda(transaksi, statusPengembalian));
        // Memasukan jenis denda denda
        switch (statusPengembalian) {
            case NORMAL:
                if (transaksi.getTanggalJatuhTempo() != null
                        && LocalDate.now().isAfter(transaksi.getTanggalJatuhTempo())) {
                    transaksi.setDendaJenis(TypesOfFinesConstant.TELAT);
                }
                break;
            case RUSAK:
                transaksi.setDendaJenis(TypesOfFinesConstant.RUSAK);
                break;
            case HILANG:
                transaksi.setDendaJenis(TypesOfFinesConstant.HILANG);
                break;
        }

        if (statusPengembalian == ReturnStatusConstant.NORMAL) {
            transaksi.getBook().setStokTersedia(transaksi.getBook().getStokTersedia() + 1);
            bookRepository.save(transaksi.getBook());
        }

        transactionRepository.save(transaksi);
        return ResponseEntity.ok("Pengembalian mandiri berhasil dicatat.");
    }
}