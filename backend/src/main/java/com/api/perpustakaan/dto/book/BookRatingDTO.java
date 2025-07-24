package com.api.perpustakaan.dto.book;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookRatingDTO {
    private String judul;
    private Double rataRataRating;
}

