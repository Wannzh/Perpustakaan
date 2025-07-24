package com.api.perpustakaan.controller.laporan;

import com.api.perpustakaan.dto.book.BookRatingDTO;
import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;
import com.api.perpustakaan.repository.transaction.TransactionRepository;
import com.api.perpustakaan.service.laporan.LaporanExportService;
import com.api.perpustakaan.service.laporan.LaporanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/laporan")
@RequiredArgsConstructor
public class LaporanController {
    private final LaporanService reportService;
    private final TransactionRepository transactionRepository;
    private final LaporanExportService exportService;

    @PreAuthorize("hasRole('SISWA')")
    @GetMapping("/buku-terpopuler")
    public ResponseEntity<List<BukuTerpopulerDTO>> getBukuTerpopuler(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<BukuTerpopulerDTO> result = reportService.getBukuTerpopuler(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/siswa-terlambat")
    public ResponseEntity<List<SiswaTerlambatDTO>> getSiswaPalingSeringTerlambat(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SiswaTerlambatDTO> result = reportService.getSiswaPalingSeringTerlambat(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/export/buku-terpopuler/pdf")
    public ResponseEntity<byte[]> exportBukuTerpopulerPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<BukuTerpopulerDTO> data = reportService.getBukuTerpopuler(startDate, endDate);
        ByteArrayInputStream stream = exportService.exportBukuTerpopulerToPdf(data);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=buku-terpopuler.pdf")
                .body(stream.readAllBytes());
    }

    @GetMapping("/export/siswa-terlambat/excel")
    public ResponseEntity<byte[]> exportSiswaTerlambatExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SiswaTerlambatDTO> data = reportService.getSiswaPalingSeringTerlambat(startDate, endDate);
        ByteArrayInputStream stream = exportService.exportSiswaTerlambatToExcel(data);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=siswa-terlambat.xlsx")
                .body(stream.readAllBytes());
    }

    @GetMapping("/top-rated-books")
    public ResponseEntity<List<BookRatingDTO>> getTopRatedBooks() {
        List<Object[]> result = transactionRepository.findTopRatedBooks();
        List<BookRatingDTO> dtos = result.stream()
                .map(obj -> new BookRatingDTO((String) obj[0], (Double) obj[1]))
                .toList();
        return ResponseEntity.ok(dtos);
    }
}
