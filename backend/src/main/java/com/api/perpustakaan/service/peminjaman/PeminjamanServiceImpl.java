package com.api.perpustakaan.service.peminjaman;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanResponseDTO;
import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.entity.Transaction;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.book.BookRepository;
import com.api.perpustakaan.repository.transaction.TransactionRepository;
import com.api.perpustakaan.repository.user.UserRepository;

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
        transaksi.setCatatan(request.getCatatan() != null ? request.getCatatan() : "-");
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
}
