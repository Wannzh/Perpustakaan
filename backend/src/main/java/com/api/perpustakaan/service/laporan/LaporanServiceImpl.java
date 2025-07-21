package com.api.perpustakaan.service.laporan;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;
import com.api.perpustakaan.repository.transaction.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LaporanServiceImpl implements LaporanService {
    private final TransactionRepository transactionRepository;

    @Override
    public Integer getTotalPeminjaman() {
        return transactionRepository.countByStatus(StatusConstant.DIPINJAM);
    }

    @Override
    public Integer getTotalPengembalian() {
        return transactionRepository.countByStatus(StatusConstant.DIKEMBALIKAN);
    }

    @Override
    public Integer getTotalDendaKeseluruhan() {
        return transactionRepository.sumTotalDenda();
    }

    @Override
    public List<BukuTerpopulerDTO> getBukuPalingBanyakDipinjam() {
        return transactionRepository.findMostBorrowedBooks();
    }

    @Override
    public List<SiswaTerlambatDTO> getSiswaSeringTelat() {
        return transactionRepository.findMostLateStudents();
    }

    @Override
    public List<BukuTerpopulerDTO> getBukuTerpopuler(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findMostBorrowedBooksByPeriod(startDate, endDate);
    }

    @Override
    public List<SiswaTerlambatDTO> getSiswaPalingSeringTerlambat(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findMostLateStudentsByPeriod(startDate, endDate);
    }

}