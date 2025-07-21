package com.api.perpustakaan.scheduler;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.entity.Transaction;
import com.api.perpustakaan.repository.transaction.TransactionRepository;
import com.api.perpustakaan.service.EmailService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotifikasiScheduler {

    private final TransactionRepository transactionRepository;
    private final EmailService emailService;

    // Jalan setiap hari jam 08.00
    @Scheduled(cron = "0 0 0 * * *") // format: detik menit jam tanggal bulan hari
    public void kirimNotifikasiPeminjaman() {
        LocalDate today = LocalDate.now();

        // Ambil semua transaksi yang statusnya masih DIPINJAM
        List<Transaction> transaksiList = transactionRepository.findByStatus(StatusConstant.DIPINJAM);

        for (Transaction trx : transaksiList) {
            LocalDate jatuhTempo = trx.getTanggalJatuhTempo();

            // H-1
            if (ChronoUnit.DAYS.between(today, jatuhTempo) == 1) {
                emailService.sendPeminjamanEmail(
                        trx.getStudent().getEmail(),
                        trx.getStudent().getName(),
                        trx.getBook().getJudul(),
                        jatuhTempo,
                        0,
                        0
                );
            }

            // H+1 atau lebih
            if (today.isAfter(jatuhTempo)) {
                int terlambat = (int) ChronoUnit.DAYS.between(jatuhTempo, today);
                int denda = terlambat * 2000;

                emailService.sendPeminjamanEmail(
                        trx.getStudent().getEmail(),
                        trx.getStudent().getName(),
                        trx.getBook().getJudul(),
                        jatuhTempo,
                        terlambat,
                        denda
                );
            }
        }
    }
}
