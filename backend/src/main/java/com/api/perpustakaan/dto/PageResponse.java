package com.api.perpustakaan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;  
    private int totalBukuDipinjam;  
    private int totalSiswaAktifMeminjam;   
    private int page;              
    private int size;              
    private long totalElements;   
    private int totalPages;        
    private boolean last;          
}
