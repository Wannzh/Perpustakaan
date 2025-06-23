package com.api.perpustakaan.dto.book;

import lombok.Data;

@Data
public class BookRequestDTO {
    private String judul;
    private String pengarang;
    private String penerbit;
    private Integer tahunTerbit;
    private String kategori;
    private Integer jumlahEksemplar;
}
