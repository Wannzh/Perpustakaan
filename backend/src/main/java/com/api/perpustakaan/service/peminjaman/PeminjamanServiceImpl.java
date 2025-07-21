package com.api.perpustakaan.service.peminjaman;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.PageResponse;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestSelfDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanResponseDTO;
import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.entity.Transaction;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.book.BookRepository;
import com.api.perpustakaan.repository.transaction.TransactionRepository;
import com.api.perpustakaan.repository.user.UserRepository;

import org.springframework.data.domain.Sort;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PeminjamanServiceImpl implements PeminjamanService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public PeminjamanResponseDTO createManual(PeminjamanRequestDTO request) {
        User siswa = userRepository.findById(request.getSiswaId())
                .orElseThrow(() -> new RuntimeException("Siswa tidak ditemukan"));

        Book book = bookRepository.findById(request.getBukuId())
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));

        if (book.getStokTersedia() <= 0) {
            throw new RuntimeException("Stok buku tidak tersedia");
        }

        // Kurangi stok
        book.setStokTersedia(book.getStokTersedia() - 1);
        book.setUpdatedAt(LocalDateTime.now());
        bookRepository.save(book);

        Transaction transaksi = new Transaction();
        transaksi.setStudent(siswa);
        transaksi.setBook(book);
        transaksi.setTanggalPinjam(request.getTanggalPinjam());
        transaksi.setTanggalJatuhTempo(request.getTanggalJatuhTempo());
        transaksi.setStatus(StatusConstant.DIPINJAM);
        transaksi.setCreatedAt(LocalDateTime.now());
        transaksi.setUpdatedAt(LocalDateTime.now());

        Transaction saved = transactionRepository.save(transaksi);

        return PeminjamanResponseDTO.builder()
                .id(saved.getId())
                .namaSiswa(siswa.getName())
                .judulBuku(book.getJudul())
                .tanggalPinjam(saved.getTanggalPinjam())
                .tanggalJatuhTempo(saved.getTanggalJatuhTempo())
                .status(saved.getStatus())
                .build();
    }

    @Override
    public PeminjamanResponseDTO createSelfPeminjaman(String username, PeminjamanRequestSelfDTO request) {
        User siswa = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Siswa tidak ditemukan"));

        if (siswa.getRole() != RoleConstant.SISWA) {
            throw new RuntimeException("Hanya siswa yang bisa melakukan peminjaman mandiri");
        }

        Book book = bookRepository.findById(request.getBukuId())
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));

        if (book.getStokTersedia() == null || book.getStokTersedia() <= 0) {
            throw new RuntimeException("Stok buku tidak tersedia");
        }

        // Kurangi stok
        book.setStokTersedia(book.getStokTersedia() - 1);
        book.setUpdatedAt(LocalDateTime.now());
        bookRepository.save(book);

        Transaction transaksi = new Transaction();
        transaksi.setStudent(siswa);
        transaksi.setBook(book);
        transaksi.setTanggalPinjam(LocalDate.now());
        transaksi.setTanggalJatuhTempo(LocalDate.now().plusDays(7)); // default 7 hari
        transaksi.setStatus(StatusConstant.DIPINJAM);
        transaksi.setCreatedAt(LocalDateTime.now());
        transaksi.setUpdatedAt(LocalDateTime.now());

        Transaction saved = transactionRepository.save(transaksi);

        return PeminjamanResponseDTO.builder()
                .id(saved.getId())
                .namaSiswa(siswa.getName())
                .judulBuku(book.getJudul())
                .tanggalPinjam(saved.getTanggalPinjam())
                .tanggalJatuhTempo(saved.getTanggalJatuhTempo())
                .status(saved.getStatus())
                .build();
    }

    @Override
    public PageResponse<PeminjamanResponseDTO> getAllPeminjamanForPustakawan(
            int page, int size, String keyword, StatusConstant status,
            String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);

        Page<Transaction> trxPage;

        if (status != null && keyword != null && !keyword.isBlank()) {
            trxPage = transactionRepository.findByStatusAndKeyword(status, keyword.toLowerCase(), pageable);
        } else if (status != null) {
            trxPage = transactionRepository.findByStatus(status, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            trxPage = transactionRepository.findByKeyword(keyword.toLowerCase(), pageable);
        } else {
            trxPage = transactionRepository.findAll(pageable);
        }

        Page<PeminjamanResponseDTO> dtoPage = trxPage.map(trx -> PeminjamanResponseDTO.builder()
                .id(trx.getId())
                .namaSiswa(trx.getStudent().getName())
                .judulBuku(trx.getBook().getJudul())
                .tanggalPinjam(trx.getTanggalPinjam())
                .tanggalJatuhTempo(trx.getTanggalJatuhTempo())
                .tanggalKembali(trx.getTanggalKembali())
                .status(trx.getStatus())
                .statusPengembalian(trx.getStatusKembali())
                .denda(trx.getDenda())
                .build());

        return new PageResponse<>(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages(),
                dtoPage.isLast());
    }

}
