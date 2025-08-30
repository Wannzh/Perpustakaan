package com.api.perpustakaan.dto.book;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookResponseDTO {
    private Integer id;
    private String judul;
    private String pengarang;
    private String penerbit;
    private Integer tahunTerbit;
    private String kategori;
    private Integer jumlahEksemplar;
    private Integer stokTersedia;
    private String coverImage; // response Image
}
