package com.api.perpustakaan.dto.cart;

import lombok.Data;

@Data
public class CartResponseDTO {
    private String id;
    private Integer bookId;
    private String judul;
    private String pengarang;
    private String coverImage;
}
